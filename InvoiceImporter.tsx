
import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ArrowRight, Loader2, Edit3, RotateCcw, Plus, X, Calculator } from 'lucide-react';
import { OrderBatch, ProductEntry } from './types';

// PDF.js loading
const PDFJS_CDN = "https://esm.sh/pdfjs-dist@4.10.38";
let pdfjsLib: any = null;

const loadPdfJs = async () => {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import(PDFJS_CDN);
  mod.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;
  pdfjsLib = mod;
  return pdfjsLib;
};

interface ParsedSlip {
  id: string;
  products: string[];
  amountDue: number;
  isUnclear: boolean;
  rawText?: string;
}

const InvoiceImporter: React.FC<{ setEntries: React.Dispatch<React.SetStateAction<any[]>>, managedPages: string[] }> = ({ setEntries, managedPages }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSlips, setOriginalSlips] = useState<ParsedSlip[]>([]);
  const [currentSlips, setCurrentSlips] = useState<ParsedSlip[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPage, setSelectedPage] = useState(managedPages[0] || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const parsePDF = async (file: File): Promise<ParsedSlip[]> => {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n---PAGE---\n";
    }

    const slips = fullText.split(/(?=Order ID:|Invoice ID:)/i).filter(s => s.trim().length > 10);
    
    return slips.map(text => {
      const idMatch = text.match(/(?:Order ID|Invoice ID):\s*(\w+)/i);
      const amountMatch = text.match(/Amount Due:\s*৳?\s*([\d,.]+)/i);
      const productBlock = text.match(/Product Details[:\s]*([\s\S]*?)(?=Order Summary|Amount Due|Customer Detail)/i);
      const products: string[] = [];
      
      if (productBlock) {
        const lines = productBlock[1].split(/\n/).map(l => l.trim()).filter(l => l.length > 2);
        lines.forEach(l => {
            const code = l.split(/\s+/)[0];
            if (code && !["#", "SKU", "Qty", "Product"].includes(code)) {
                products.push(code);
            }
        });
      }

      const id = idMatch ? idMatch[1] : "";
      const amountDue = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      
      return {
        id,
        products: Array.from(new Set(products)).sort(),
        amountDue,
        isUnclear: !id || amountDue <= 0 || products.length === 0,
        rawText: text
      };
    });
  };

  const processFiles = async () => {
    setIsProcessing(true);
    let allParsed: ParsedSlip[] = [];
    for (const file of files) {
      try {
        const results = await parsePDF(file);
        allParsed = [...allParsed, ...results];
      } catch (e) { console.error("Failed to parse", file.name, e); }
    }
    const uniqueSlips = Array.from(new Map(allParsed.map(s => [s.id || Math.random().toString(), s])).values());
    setOriginalSlips(uniqueSlips);
    setCurrentSlips(JSON.parse(JSON.stringify(uniqueSlips)));
    setIsProcessing(false);
  };

  // Manual Edit Handlers
  const updateSlip = (idx: number, field: keyof ParsedSlip, val: any) => {
    const updated = [...currentSlips];
    updated[idx] = { ...updated[idx], [field]: val };
    // Re-check clarity
    updated[idx].isUnclear = !updated[idx].id || updated[idx].amountDue <= 0 || updated[idx].products.length === 0;
    setCurrentSlips(updated);
  };

  const addProductToSlip = (idx: number) => {
    const code = prompt("Enter Product Code:");
    if (code) {
      const updated = [...currentSlips];
      updated[idx].products = Array.from(new Set([...updated[idx].products, code])).sort();
      updated[idx].isUnclear = !updated[idx].id || updated[idx].amountDue <= 0 || updated[idx].products.length === 0;
      setCurrentSlips(updated);
    }
  };

  const removeProductFromSlip = (slipIdx: number, prodIdx: number) => {
    const updated = [...currentSlips];
    updated[slipIdx].products = updated[slipIdx].products.filter((_, i) => i !== prodIdx);
    updated[slipIdx].isUnclear = !updated[slipIdx].id || updated[slipIdx].amountDue <= 0 || updated[slipIdx].products.length === 0;
    setCurrentSlips(updated);
  };

  const resetToExtracted = () => {
    if (confirm("Discard all manual edits?")) {
      setCurrentSlips(JSON.parse(JSON.stringify(originalSlips)));
    }
  };

  // Summaries based on current (possibly edited) slips
  const summaries = useMemo(() => {
    const uniqueMap = new Map<string, ParsedSlip>();
    currentSlips.forEach(s => {
      if (s.id) uniqueMap.set(s.id, s);
      else uniqueMap.set("unnamed_" + Math.random(), s);
    });
    const deduped = Array.from(uniqueMap.values());

    const singles: Record<string, { qty: number, total: number }> = {};
    const combos: Record<string, { qty: number, total: number }> = {};
    const unclear: ParsedSlip[] = [];

    deduped.forEach(slip => {
      if (slip.isUnclear) {
        unclear.push(slip);
      } else if (slip.products.length > 1) {
        const key = slip.products.join(" + ");
        if (!combos[key]) combos[key] = { qty: 0, total: 0 };
        combos[key].qty++;
        combos[key].total += slip.amountDue;
      } else {
        const key = slip.products[0];
        if (!singles[key]) singles[key] = { qty: 0, total: 0 };
        singles[key].qty++;
        singles[key].total += slip.amountDue;
      }
    });

    return { singles, combos, unclear, totalUnique: deduped.length };
  }, [currentSlips]);

  const totals = useMemo(() => {
    const sCount = (Object.values(summaries.singles) as any[]).reduce((a, b) => a + (b.qty || 0), 0);
    const sAmount = (Object.values(summaries.singles) as any[]).reduce((a, b) => a + (b.total || 0), 0);
    const cCount = (Object.values(summaries.combos) as any[]).reduce((a, b) => a + (b.qty || 0), 0);
    const cAmount = (Object.values(summaries.combos) as any[]).reduce((a, b) => a + (b.total || 0), 0);
    const uCount = summaries.unclear.length;
    const overall = (sAmount as number) + (cAmount as number);
    return { sCount, sAmount, cCount, cAmount, uCount, overall };
  }, [summaries]);

  const pushToSheet = () => {
    if (!confirm(`Push ${totals.sCount + totals.cCount} verified orders to sheet?`)) return;
    const newBatches: OrderBatch[] = [];
    
    [...Object.entries(summaries.singles), ...Object.entries(summaries.combos)].forEach(([name, data]: [string, any]) => {
        newBatches.push({
            id: "IMP_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            date: selectedDate,
            pageName: selectedPage,
            products: [{ id: "1", name, quantity: data.qty, salePrice: data.total / data.qty, buyPrice: 0 }],
            sharedCosts: { dollar: 0, rate: 0, adCost: 0, salary: 0, returnExpected: 20 },
            officeCosts: { totalOrders: data.qty, mngSalary: 0, officeCost: 0, bonus: 0, manualAdjust: 0 },
            logistics: { deliveryCharge: 120, packingCost: 10, codPercentage: 1 }
        });
    });

    setEntries(prev => [...newBatches, ...prev]);
    alert("Batch pushed successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Invoice Importer</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Order Extraction & Validation Suite</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><RotateCcw size={20}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Controls</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Page</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm" value={selectedPage} onChange={e => setSelectedPage(e.target.value)}>
                  {managedPages.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            
            <label className="group relative w-full h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <Upload className="text-slate-300 group-hover:text-indigo-500 mb-1" size={20} />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 uppercase">Upload PDF</span>
                <input type="file" multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
            </label>

            <button disabled={files.length === 0 || isProcessing} onClick={processFiles} className="w-full py-4 bg-[#1e293b] text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Calculator size={18} />} Extract Slips
            </button>
          </div>

          {currentSlips.length > 0 && (
            <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 space-y-4">
              <h3 className="font-black tracking-tight text-sm uppercase">Batch Ready</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 p-3 rounded-xl">
                    <p className="text-[9px] font-black uppercase opacity-60">Verified</p>
                    <p className="text-lg font-black">{totals.sCount + totals.cCount}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                    <p className="text-[9px] font-black uppercase opacity-60">Unclear</p>
                    <p className="text-lg font-black">{totals.uCount}</p>
                </div>
              </div>
              <button onClick={pushToSheet} disabled={totals.sCount + totals.cCount === 0} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                Push Verified Orders <ArrowRight size={14} />
              </button>
              <button onClick={resetToExtracted} className="w-full py-2 bg-transparent border border-white/20 text-white/80 rounded-xl font-black text-[10px] hover:bg-white/10 transition-all">Reset to Extracted</button>
            </div>
          )}
        </div>

        {/* Right Column: Editable Slips & Summaries */}
        <div className="lg:col-span-9 space-y-8">
           {currentSlips.length === 0 ? (
             <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
                <FileText size={64} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="font-black text-xs uppercase tracking-[0.2em] opacity-40">Awaiting Extraction...</p>
             </div>
           ) : (
             <>
                {/* Manual Edit Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase text-slate-600 tracking-widest">Extraction Workbench (Manual Review)</h3>
                        <span className="text-[10px] font-bold text-slate-400">Unique IDs: {summaries.totalUnique}</span>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead className="text-slate-400 font-black uppercase text-[10px] tracking-tighter border-b border-slate-50 sticky top-0 bg-white z-10">
                                <tr>
                                    <th className="px-6 py-4 w-12">#</th>
                                    <th className="px-6 py-4">Invoice / Order ID</th>
                                    <th className="px-6 py-4">Amount Due</th>
                                    <th className="px-6 py-4">Product Line Items</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentSlips.map((slip, sIdx) => (
                                    <tr key={sIdx} className={`hover:bg-slate-50/50 transition-colors ${slip.isUnclear ? 'bg-rose-50/20' : ''}`}>
                                        <td className="px-6 py-4 text-slate-400 font-bold">{sIdx + 1}</td>
                                        <td className="px-6 py-4">
                                            <input className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-black text-slate-700 w-full" value={slip.id} onChange={e => updateSlip(sIdx, 'id', e.target.value)} placeholder="Missing ID" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-black text-emerald-600">
                                                <span>৳</span>
                                                <input type="number" className="bg-transparent border-b border-transparent focus:border-emerald-500 outline-none w-20" value={slip.amountDue || ''} onChange={e => updateSlip(sIdx, 'amountDue', parseFloat(e.target.value) || 0)} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {slip.products.map((code, pIdx) => (
                                                    <span key={pIdx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[9px]">
                                                        {code}
                                                        <button onClick={() => removeProductFromSlip(sIdx, pIdx)} className="hover:text-rose-500"><X size={10}/></button>
                                                    </span>
                                                ))}
                                                <button onClick={() => addProductToSlip(sIdx)} className="p-1 text-indigo-400 hover:text-indigo-600 transition-colors"><Plus size={14}/></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {slip.isUnclear ? <AlertCircle className="text-rose-400 mx-auto" size={16}/> : <CheckCircle2 className="text-emerald-400 mx-auto" size={16}/>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Single Orders Summary */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xs font-black uppercase text-slate-600">Single Orders</h3></div>
                        <table className="w-full text-left text-[11px] font-bold text-slate-700">
                            <thead className="bg-slate-50 text-slate-400 uppercase text-[9px]"><tr className="border-b"><th className="px-6 py-3">Product</th><th className="px-6 py-3 text-center">Qty</th><th className="px-6 py-3 text-right">Total</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(summaries.singles).map(([code, data]: [string, any]) => (
                                    <tr key={code}><td className="px-6 py-3 font-black">{code}</td><td className="px-6 py-3 text-center">{data.qty}</td><td className="px-6 py-3 text-right">৳{data.total.toLocaleString()}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Combo Orders Summary */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/30"><h3 className="text-xs font-black uppercase text-amber-700">Combo Orders</h3></div>
                        <table className="w-full text-left text-[11px] font-bold text-slate-700">
                            <thead className="bg-slate-50 text-slate-400 uppercase text-[9px]"><tr className="border-b"><th className="px-6 py-3">Combo</th><th className="px-6 py-3 text-center">Qty</th><th className="px-6 py-3 text-right">Total</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(summaries.combos).map(([config, data]: [string, any]) => (
                                    <tr key={config}><td className="px-6 py-3 font-black text-indigo-600">{config}</td><td className="px-6 py-3 text-center">{data.qty}</td><td className="px-6 py-3 text-right">৳{data.total.toLocaleString()}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grand Total Metric Box */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryMetric label="Single Orders" val={totals.sCount} sub={`৳${totals.sAmount.toLocaleString()}`} />
                    <SummaryMetric label="Combo Orders" val={totals.cCount} sub={`৳${totals.cAmount.toLocaleString()}`} />
                    <SummaryMetric label="Unclear" val={totals.uCount} sub="Missing fields" danger={totals.uCount > 0} />
                    <SummaryMetric label="Amount Due" val={`৳${totals.overall.toLocaleString()}`} sub={`Validation: ${totals.sCount + totals.cCount + totals.uCount === summaries.totalUnique ? "PASS" : "FAIL"}`} highlight />
                </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const SummaryMetric = ({ label, val, sub, highlight, danger }: any) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${highlight ? 'bg-slate-900 text-white border-black shadow-xl shadow-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
    <h4 className={`text-xl font-black ${danger ? 'text-rose-500 animate-pulse' : ''}`}>{val}</h4>
    <p className={`text-[10px] font-bold mt-1 ${highlight ? 'text-indigo-400' : 'text-slate-400'}`}>{sub}</p>
  </div>
);

export default InvoiceImporter;
