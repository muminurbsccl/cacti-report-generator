import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { NODE_MAPPINGS } from '../constants';
import { ScrapedNode, CactiNodeMapping } from '../types';

// Set worker source to local file for offline use
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const processPdfFile = async (
  file: File, 
  onProgress: (msg: string, percent: number) => void
): Promise<ScrapedNode[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const foundNodes: ScrapedNode[] = [];
  const processedMappingIds = new Set<string>();

  // Create a worker for Tesseract once to reuse - configured for offline use
  const worker = await Tesseract.createWorker('eng', 1, {
    workerPath: '/tesseract/worker.min.js',
    langPath: '/tesseract',
    corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
  });

  for (let i = 1; i <= numPages; i++) {
    onProgress(`Processing Page ${i} of ${numPages}...`, (i / numPages) * 100);

    const page = await pdf.getPage(i);
    // Use scale 2.0 for higher resolution OCR accuracy
    const viewport = page.getViewport({ scale: 2.0 }); 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Run OCR on the full page
    const { data: { words } } = await worker.recognize(canvas);
    
    // Group words into lines to search for titles
    const lines = groupWordsToLines(words);

    // Identified regions on this page
    const matchedRegions: { line: Line, mapping: CactiNodeMapping, y: number }[] = [];

    // 1. First Pass: Identify all titles on this page
    for (const line of lines) {
        const lineText = line.text.toLowerCase();
        
        // Find best matching mapping
        for (const mapping of NODE_MAPPINGS) {
            // Skip if we already found this exact ID globally (prevent global duplicates)
            if (processedMappingIds.has(mapping.id)) continue;

            // Check if any of the mapping's tags match this line (case-insensitive)
            const tagMatched = mapping.tags.some(tag => lineText.includes(tag.toLowerCase()));
            if (tagMatched) {
                matchedRegions.push({
                    line,
                    mapping,
                    y: line.bbox.y0 // Top of the title line
                });
                processedMappingIds.add(mapping.id);
                break; // Found a match for this line, stop checking other mappings
            }
        }
    }

    // 2. Sort regions by Y position (Top to Bottom)
    matchedRegions.sort((a, b) => a.y - b.y);

    // 3. Extract Images with dynamic height calculation
    for (let k = 0; k < matchedRegions.length; k++) {
        const region = matchedRegions[k];
        const nextRegion = matchedRegions[k + 1];

        // Start crop slightly above the title to include it nicely.
        // Cacti graphs have the title inside the image top area.
        const cropY = Math.max(0, region.line.bbox.y0 - 25);

        // Cacti graphs are usually ~25-30% of page height at 2x scale (~443px).
        const estimatedGraphHeight = viewport.height / 3.8;
        let cropHeight = 0;

        if (nextRegion) {
            // Calculate distance to the next title
            // Use a buffer (e.g., -30px) so we don't accidentally include the next title's header
            cropHeight = (nextRegion.line.bbox.y0 - 30) - cropY;

            // If the gap to the next matched region is too large (e.g. unmatched graphs in between),
            // cap to a single graph height to avoid capturing extra graphs
            if (cropHeight > estimatedGraphHeight) {
                cropHeight = estimatedGraphHeight;
            }
        } else {
            // Last element on page.
            const remainingSpace = viewport.height - cropY;
            cropHeight = Math.min(estimatedGraphHeight, remainingSpace - 50); // -50 for footer margin
        }
        
        // Minimum fallback
        if (cropHeight < 150) cropHeight = 350;

        // Downscale to 1x resolution for smaller PDF output
        const scaledWidth = Math.round(canvas.width / 2);
        const scaledHeight = Math.round(cropHeight / 2);

        const nodeCanvas = document.createElement('canvas');
        nodeCanvas.width = scaledWidth;
        nodeCanvas.height = scaledHeight;
        const nodeCtx = nodeCanvas.getContext('2d');

        if (nodeCtx) {
            nodeCtx.drawImage(
                canvas,
                0, cropY, canvas.width, cropHeight, // Source Rect
                0, 0, scaledWidth, scaledHeight // Dest Rect (downscaled)
            );

            foundNodes.push({
                mapping: region.mapping,
                imageUrl: nodeCanvas.toDataURL('image/jpeg', 0.75),
                originalTitle: region.line.text
            });
        }
    }
  }

  await worker.terminate();
  return foundNodes;
};

// --- Helper interfaces & functions for OCR ---

interface Line {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
}

const groupWordsToLines = (words: Tesseract.Word[]): Line[] => {
    const lines: Line[] = [];
    // Sort words by Y position, then X position
    words.sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
    
    let currentLine: Tesseract.Word[] = [];
    
    for (const word of words) {
        if (currentLine.length === 0) {
            currentLine.push(word);
            continue;
        }
        
        const lastWord = currentLine[currentLine.length - 1];
        // If vertical difference is small, they are on the same line
        const verticalDiff = Math.abs(word.bbox.y0 - lastWord.bbox.y0);
        if (verticalDiff < 20) { 
            currentLine.push(word);
        } else {
            // Push the finished line
            lines.push(wordsToLine(currentLine));
            currentLine = [word];
        }
    }
    if (currentLine.length > 0) {
        lines.push(wordsToLine(currentLine));
    }
    return lines;
};

const wordsToLine = (words: Tesseract.Word[]): Line => {
    const text = words.map(w => w.text).join(' ');
    const x0 = Math.min(...words.map(w => w.bbox.x0));
    const y0 = Math.min(...words.map(w => w.bbox.y0));
    const x1 = Math.max(...words.map(w => w.bbox.x1));
    const y1 = Math.max(...words.map(w => w.bbox.y1));
    return { text, bbox: { x0, y0, x1, y1 } };
}