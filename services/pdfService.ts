import { jsPDF } from 'jspdf';
import { ScrapedNode, ReportDateRange } from '../types';

export const generatePDF = async (
  nodes: ScrapedNode[],
  dateRange: ReportDateRange,
  onProgress: (msg: string) => void
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for formatted date
  const formatMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    // Returns format like "November, 2025"
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', ', ');
  };
  const reportMonth = formatMonth(dateRange.start);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`MRTG Screenshot for Downstreams of BSCPLC IIG for ${reportMonth}`, margin, 20);
  
  let yPos = 40;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    onProgress(`Processing ${i + 1}/${nodes.length}: ${node.mapping.clientName}`);

    // Image is already base64 from the PDF processor
    const base64Img = node.imageUrl;

    // Check if we need a new page (approx 80 units for a graph block)
    // 20 top margin, 15 bottom margin. 
    if (yPos + 80 > pageHeight - 15) {
      doc.addPage();
      yPos = 20;
    }

    // Prepare Title Text
    // Rule: Hide (0.00 Mbps) if that is the bandwidth value.
    const bandwidthText = node.mapping.bandwidth === '0.00 Mbps' ? '' : `(${node.mapping.bandwidth})`;
    const clientTitle = `${node.mapping.clientName} ${bandwidthText}`.trim();

    // Header: Client Name (Bandwidth) - Left Aligned
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(clientTitle, margin, yPos);
    
    // Description if meaningful - Right Aligned
    if (node.mapping.description && node.mapping.description.length > 2) {
         doc.setFontSize(9);
         doc.setFont("helvetica", "normal");
         doc.setTextColor(100);
         
         // Calculate X position for right alignment
         const descText = node.mapping.description;
         const descWidth = doc.getTextWidth(descText);
         const xPosRight = pageWidth - margin - descWidth;
         
         doc.text(descText, xPosRight, yPos);
         doc.setTextColor(0);
    }
    
    yPos += 2; // Spacing

    if (base64Img) {
        const imgProps = doc.getImageProperties(base64Img);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
        
        try {
            doc.addImage(base64Img, 'JPEG', margin, yPos + 2, contentWidth, imgHeight, undefined, 'FAST');
            yPos += imgHeight + 15; // Image height + padding
        } catch (err) {
            console.error("Error adding image to PDF", err);
            doc.setTextColor(255, 0, 0);
            doc.text("Error loading graph image", margin, yPos + 10);
            doc.setTextColor(0, 0, 0);
            yPos += 20;
        }
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("[Image unavailable]", margin, yPos + 10);
        doc.setTextColor(0, 0, 0);
        yPos += 20;
    }
  }

  // Add Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  doc.save(`BSCPLC_Report_${reportMonth.replace(', ', '_')}.pdf`);
};