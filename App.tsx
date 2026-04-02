import React, { useState } from 'react';
import { Upload, FileText, Download, RefreshCw, CheckSquare, Square, AlertCircle, FileUp, Cpu, Terminal, ShieldCheck, Play, Lock, Key, BookOpen, ExternalLink, X } from 'lucide-react';
import { AppStep, ReportDateRange, ScrapedNode } from './types';
import { processPdfFile } from './services/pdfProcessor';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  // --- State ---
  const [step, setStep] = useState<AppStep>(AppStep.AUTH);
  const [loadingMsg, setLoadingMsg] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  
  // Auth State
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [dateRange, setDateRange] = useState<ReportDateRange>(() => {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${firstDayLastMonth.getFullYear()}-${pad(firstDayLastMonth.getMonth() + 1)}-01T00:00`;
    const endStr = `${lastDayLastMonth.getFullYear()}-${pad(lastDayLastMonth.getMonth() + 1)}-${pad(lastDayLastMonth.getDate())}T23:59`;
    return { start: startStr, end: endStr };
  });

  const [availableNodes, setAvailableNodes] = useState<ScrapedNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1212') {
      setStep(AppStep.UPLOAD);
      setAuthError('');
    } else {
      setAuthError('ACCESS DENIED: INVALID SECURITY CREDENTIALS');
      setPasswordInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep(AppStep.PROCESSING);
    setError(null);
    setLoadingMsg('INITIALIZING SCAN SEQUENCE...');
    setProgress(0);

    try {
      const nodes = await processPdfFile(file, (msg, pct) => {
        setLoadingMsg(msg.toUpperCase());
        setProgress(pct);
      });

      if (nodes.length === 0) {
        setError("SYSTEM ERROR: NO DATA MATCH. VERIFY SOURCE FILE INTEGRITY.");
        setStep(AppStep.UPLOAD);
        return;
      }
      
      // Sort nodes by mapping ID to keep them in consistent order
      nodes.sort((a, b) => {
         const idA = parseFloat(a.mapping.id) || 0;
         const idB = parseFloat(b.mapping.id) || 0;
         return idA - idB;
      });

      setAvailableNodes(nodes);
      // Default select all
      setSelectedNodeIds(new Set(nodes.map(n => n.mapping.id)));
      setStep(AppStep.SELECTION);
    } catch (err: any) {
      console.error(err);
      setError("CRITICAL FAILURE: " + (err.message || "UNKNOWN PROCESSING ERROR"));
      setStep(AppStep.UPLOAD);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedNodeIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNodeIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedNodeIds.size === availableNodes.length) {
      setSelectedNodeIds(new Set());
    } else {
      setSelectedNodeIds(new Set(availableNodes.map(n => n.mapping.id)));
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedNodeIds.size === 0) return;
    
    setStep(AppStep.GENERATING);
    setLoadingMsg('COMPILING FINAL REPORT...');
    
    const selectedNodes = availableNodes.filter(n => selectedNodeIds.has(n.mapping.id));
    
    try {
        await generatePDF(selectedNodes, dateRange, (msg) => setLoadingMsg(msg.toUpperCase()));
        setStep(AppStep.FINISHED);
    } catch (err: any) {
        setError("GENERATION FAILED: " + err.message);
        setStep(AppStep.SELECTION);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setAvailableNodes([]);
    setError(null);
    setProgress(0);
  };

  // --- Renders ---

  const renderManual = () => {
    if (!showManual) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative max-h-[90vh] overflow-y-auto">
           {/* Decorative corners for modal */}
           <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
           <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
           <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
           <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>

           <button 
             onClick={() => setShowManual(false)}
             className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="p-8">
             <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-800 pb-4">
               <BookOpen className="w-6 h-6 text-cyan-500" />
               Operational Manual
             </h2>
             
             <div className="space-y-6 font-mono text-sm text-slate-400">
               
               <div className="bg-slate-950 border border-slate-800 p-5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                 <h3 className="text-cyan-400 font-bold uppercase mb-3 tracking-wider">Step 1: Access Data Source</h3>
                 <p className="mb-3 text-slate-500">Log in to the Cacti Network Monitoring system to retrieve graph data.</p>
                 <div className="grid grid-cols-1 gap-2 bg-slate-900 p-4 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                       <span className="text-slate-500 text-xs uppercase">Target URL</span>
                       <span className="text-cyan-300">192.168.200.45/graph_view.php...</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 pt-2">
                       <span className="text-slate-500 text-xs uppercase">Username</span>
                       <span className="text-green-400 font-bold">noc</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-slate-500 text-xs uppercase">Password</span>
                       <span className="text-green-400 font-bold">noc@BSCCL</span>
                    </div>
                 </div>
               </div>

               <div className="bg-slate-950 border border-slate-800 p-5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                 <h3 className="text-cyan-400 font-bold uppercase mb-3 tracking-wider">Step 2: Export Data</h3>
                 <p className="text-slate-500 mb-2">Once inside Cacti (Tree ID: 6):</p>
                 <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
                   <li>Press <strong className="text-white">Ctrl + P</strong> to open the print dialog.</li>
                   <li>Set Destination to <strong className="text-white">Save as PDF</strong>.</li>
                   <li>Ensure "Background Graphics" is <strong className="text-white">Enabled</strong> (if available).</li>
                   <li>Save the PDF file to your local machine.</li>
                 </ul>
               </div>

               <div className="bg-slate-950 border border-slate-800 p-5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                 <h3 className="text-cyan-400 font-bold uppercase mb-3 tracking-wider">Step 3: Process & Report</h3>
                 <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
                   <li>Drag and drop the saved PDF into the <strong>Upload Source Data</strong> section.</li>
                   <li>Select the reporting <strong className="text-white">Date Range</strong>.</li>
                   <li>The system will extract graphs and identify clients automatically.</li>
                   <li>Select the desired graphs and click <strong className="text-white">Execute Report</strong>.</li>
                 </ul>
               </div>

             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                <button 
                  onClick={() => setShowManual(false)}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black font-mono uppercase tracking-widest transition-colors"
                >
                  Close Manual
                </button>
             </div>
           </div>
        </div>
      </div>
    );
  };

  const renderAuth = () => (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 p-8 md:p-12 relative shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-950 border-2 border-cyan-500 mb-6 relative">
             <div className="absolute inset-1 border border-slate-800"></div>
            <Lock className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white font-mono tracking-[0.2em] uppercase">
            Restricted Area
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
             <div className="w-2 h-2 bg-red-500"></div>
             <p className="text-xs text-red-500 font-mono uppercase tracking-widest font-bold">
               Biometric Lock Active
             </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-wider font-bold">
               <Key className="w-3 h-3" />
               Security Clearance Code
            </label>
            <div className="relative group">
               <span className="absolute left-4 top-3.5 text-cyan-600 font-mono text-lg font-bold">{">"}</span>
               <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 text-cyan-400 pl-10 pr-4 py-3 font-mono text-xl focus:outline-none focus:border-cyan-500 placeholder-slate-800 tracking-[0.5em] transition-none"
                placeholder="••••"
                autoFocus
              />
            </div>
          </div>

          {authError && (
             <div className="bg-red-950/40 border-l-4 border-red-600 p-3 text-red-500 text-xs font-mono uppercase font-bold flex items-center justify-center gap-2">
               <AlertCircle className="w-4 h-4" />
               {authError}
             </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black py-4 font-mono text-lg uppercase tracking-widest border-2 border-cyan-400 relative overflow-hidden group"
          >
            <span className="relative z-10">Initialize Session</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-none"></div>
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
             Terminal ID: BSCPLC-SECURE-NODE-01
          </p>
          <p className="text-[9px] text-slate-700 font-mono uppercase">
             Unauthorized access is a punishable offense
          </p>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-700 p-10 relative overflow-hidden">
      {/* Decorative corner markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 border border-cyan-500 mb-6">
            <FileUp className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tighter mb-2">UPLOAD SOURCE DATA</h2>
        <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
          Import Cacti Tree Export PDF for Extraction
        </p>
      </div>

      {/* Date Range Config */}
      <div className="bg-slate-950 p-6 border border-slate-800 mb-8 max-w-xl mx-auto">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                 <Terminal className="w-4 h-4 text-cyan-500" />
                 <h3 className="text-sm font-bold text-cyan-500 font-mono uppercase tracking-wider">Parameters: Timeframe</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">Start Timestamp</label>
                    <input 
                        type="datetime-local" 
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-cyan-400 px-3 py-2 font-mono text-sm focus:outline-none focus:border-cyan-500 rounded-none"
                        value={dateRange.start}
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase">End Timestamp</label>
                    <input 
                        type="datetime-local" 
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-cyan-400 px-3 py-2 font-mono text-sm focus:outline-none focus:border-cyan-500 rounded-none"
                        value={dateRange.end}
                        onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    />
                </div>
             </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative group cursor-pointer max-w-xl w-full">
            <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 p-10 hover:border-cyan-500 hover:bg-slate-800 transition-none flex flex-col items-center justify-center">
                <span className="text-cyan-500 font-mono text-sm font-bold uppercase tracking-wider group-hover:text-cyan-300">
                    [ Initiate File Transfer ]
                </span>
                <span className="text-slate-600 font-mono text-xs mt-2 uppercase">Drag & Drop or Click</span>
            </div>
        </div>

        <a 
          href="http://192.168.200.45/graph_view.php?action=tree&tree_id=6" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-cyan-500 hover:text-white font-mono text-xs uppercase tracking-wider border border-cyan-900 bg-cyan-950/20 px-6 py-3 hover:bg-cyan-900/40 hover:border-cyan-500 transition-all group"
        >
          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Access Cacti Graph Tree (ID: 6)
        </a>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-900/20 border border-red-900 text-red-500 font-mono text-sm flex items-start gap-3">
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <p className="uppercase">{error}</p>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-12 text-center relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }}></div>
         </div>
         
         <div className="mb-8">
            <Cpu className="w-16 h-16 text-cyan-500 mx-auto opacity-80" />
         </div>
         
         <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-widest mb-2">{loadingMsg}</h3>
         
         <div className="w-full bg-slate-800 h-6 mt-6 border border-slate-700 relative overflow-hidden">
             {/* Tech style progress bar blocks */}
            <div className="h-full bg-cyan-600 flex items-center overflow-hidden" style={{ width: `${progress}%` }}>
                <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
            </div>
            <div className="absolute top-0 right-2 h-full flex items-center">
                <span className="text-xs font-mono font-bold text-white mix-blend-difference">{Math.round(progress)}%</span>
            </div>
         </div>
         
         <p className="text-slate-500 font-mono text-xs uppercase mt-4 tracking-widest">
            Processing Neural Engine • OCR Analysis Active
         </p>
    </div>
  );

  const renderSelection = () => (
    <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 flex flex-col h-[85vh]">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div>
                <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    Target Identification
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase">
                    Detected {availableNodes.length} data points
                </p>
            </div>
            <div className="flex gap-4">
                 <button 
                    onClick={reset}
                    className="px-6 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-mono text-xs uppercase tracking-wider"
                >
                    Abort
                </button>
                <button 
                    onClick={handleGeneratePDF}
                    disabled={selectedNodeIds.size === 0}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play className="w-3 h-3 fill-current" />
                    Execute Report
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 mb-4 sticky top-0 z-10">
                <button 
                    onClick={toggleSelectAll}
                    className="flex items-center gap-3 text-sm font-bold text-cyan-500 hover:text-cyan-400 font-mono uppercase"
                >
                    {selectedNodeIds.size === availableNodes.length ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
                    Toggle All Systems
                </button>
                <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">Visual Confirm</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {availableNodes.map((node) => {
                    const isSelected = selectedNodeIds.has(node.mapping.id);
                    return (
                        <div 
                            key={node.mapping.id}
                            onClick={() => toggleSelection(node.mapping.id)}
                            className={`relative bg-slate-900 border transition-none cursor-pointer overflow-hidden group 
                                ${isSelected ? 'border-cyan-500 bg-slate-900' : 'border-slate-800 hover:border-slate-600'}
                            `}
                        >
                             {/* Header */}
                             <div className={`px-4 py-3 flex items-start gap-4 border-b ${isSelected ? 'border-cyan-500/30 bg-cyan-900/10' : 'border-slate-800 bg-slate-900'}`}>
                                <div className="mt-1">
                                    {isSelected ? <CheckSquare className="w-5 h-5 text-cyan-500"/> : <Square className="w-5 h-5 text-slate-600"/>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold font-mono uppercase ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                            {node.mapping.clientName}
                                        </h4>
                                        <span className="text-xs font-mono text-cyan-500 bg-cyan-950 px-2 py-0.5 border border-cyan-900">
                                            {node.mapping.bandwidth}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono mt-1 flex gap-4">
                                        <span>DESC: {node.mapping.description}</span>
                                        <span className="text-slate-700">|</span>
                                        <span className="truncate max-w-xs opacity-50">{node.originalTitle}</span>
                                    </div>
                                </div>
                             </div>
                             
                             {/* Image Preview */}
                             <div className="p-2 bg-slate-950 flex justify-center border-t border-slate-900">
                                {/* Use opacity to simulate 'inactive' state if not selected, but keeping it visible is better for UX */}
                                <div className={`relative ${isSelected ? '' : 'opacity-60 grayscale'}`}>
                                    <img src={node.imageUrl} alt="Graph" className="max-h-48 object-contain border border-slate-800" />
                                    {/* Grid Overlay Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                                </div>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );

  const renderFinished = () => (
     <div className="max-w-lg mx-auto bg-slate-900 border border-green-900 p-10 text-center relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-900/20 border border-green-500 mb-8 rounded-none">
            <Download className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white font-mono uppercase tracking-widest mb-2">Operation Complete</h2>
        <p className="text-green-400 font-mono text-xs uppercase mb-10 tracking-wider">
            Report Data Compiled & Exported
        </p>
        <button 
            onClick={reset}
            className="w-full px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono uppercase tracking-wider border border-slate-600 flex items-center justify-center gap-3"
        >
            <RefreshCw className="w-4 h-4" />
            Reset System
        </button>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans flex flex-col text-slate-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative">
      <header className="max-w-7xl mx-auto mb-12 flex items-center justify-between w-full border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 border border-cyan-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tighter font-mono uppercase">
                    BSCPLC IIG <span className="text-cyan-500">Downstream</span> Report
                </h1>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
                    Upload PDF to generate Report
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setShowManual(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 text-slate-500 font-mono text-xs uppercase tracking-wider transition-colors bg-slate-900"
            >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">User Manual</span>
            </button>
            <div className="hidden md:flex gap-2 items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="text-[10px] font-mono text-red-500 uppercase">System Online</div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-grow">
        {step === AppStep.AUTH && renderAuth()}
        {step === AppStep.UPLOAD && renderUpload()}
        {(step === AppStep.PROCESSING || step === AppStep.GENERATING) && renderProcessing()}
        {step === AppStep.SELECTION && renderSelection()}
        {step === AppStep.FINISHED && renderFinished()}
      </main>
      
      <footer className="max-w-7xl mx-auto w-full mt-12 py-6 text-center border-t border-slate-900">
        <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
            Developed by Muminur • Secure Connection
        </p>
      </footer>

      {renderManual()}
    </div>
  );
};

export default App;