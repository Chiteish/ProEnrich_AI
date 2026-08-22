/**
 * Output Page - Clean Dark Cyber Aesthetic
 */
import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { mockOutputRecords, mockOutputStats } from '../mock/output';
import {
  Download,
  FileCheck2,
  Boxes,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  SlidersHorizontal,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Output: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeConfidence: true,
    includeEvidence: true,
    includeValidation: false,
  });

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      setShowExportModal(false);
    }, 1500);
  };

  const columnNames = [
    'PART_NUMBER',
    'Dept',
    'Class',
    'Fine',
    'Mfg_Part_Num',
    'Part_Desc',
    'MANUFACTURER_NAME',
    'BRAND_NAME',
    'COMPLETENESS',
    'CONFIDENCE',
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FileCheck2 size={14} />
            <span>COMMERCE SYNDICATION & EXPORT</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Commerce-Ready Output
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export 252-field standardized product intelligence for ERPs, PIMs, and e-commerce distributor marketplaces.
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download size={16} />
          <span>Export 252-Field Catalog</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Output Products', value: mockOutputStats.totalProducts.toLocaleString(), unit: 'SKUs', color: 'text-white' },
          { label: 'Standardized Attributes', value: '252', unit: 'Fields Mapped', color: 'text-cyan-400' },
          { label: 'Validated Quality Rate', value: `${mockOutputStats.validated}%`, unit: 'Confidence Score', color: 'text-emerald-400' },
          { label: 'Pending Human Review', value: `${mockOutputStats.needsReview}%`, unit: 'Non-Blocking', color: 'text-amber-400' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between"
          >
            <span className="text-[11px] font-semibold text-slate-400 leading-tight">{stat.label}</span>
            <div className="mt-2">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{stat.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Preview Table + Export Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Preview Table (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-cyan-400" />
                <span>Export Dataset Preview</span>
              </h3>
              <span className="text-xs text-slate-400">Showing 252-field standardized schema</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#040916] text-slate-400 border-b border-slate-800">
                    {columnNames.map((col) => (
                      <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {mockOutputRecords.map((record: any, idx: number) => (
                    <tr key={idx} className="hover:bg-blue-600/10 transition-colors">
                      {columnNames.map((col) => (
                        <td key={col} className="py-2.5 px-3 text-slate-200 whitespace-nowrap font-mono text-[11px]">
                          {record[col.toUpperCase().replace(/\s+/g, '_')] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Export Formats & Syndication (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes size={16} className="text-cyan-400" />
              <span>Syndication Targets</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'CSV / XLSX Format', desc: 'Standard distributor & spreadsheet ingest' },
                { name: 'JSON Schema (ETIM 8.0)', desc: 'Rest API & headless catalog feeds' },
                { name: 'UNSPSC Classification', desc: 'Enterprise procurement taxonomy' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Download size={15} />
              <span>Generate Catalog Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#081024] border border-blue-500/30 rounded-3xl p-7 max-w-md w-full text-white shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(37,99,235,0.3)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download size={18} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Export Commerce Catalog</h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {exportSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Catalog Downloaded!</h4>
                  <p className="text-xs text-slate-300">
                    Exported {mockOutputStats.totalProducts.toLocaleString()} products in 252-field {selectedFormat} format.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Format</label>
                    <div className="flex gap-2">
                      {['CSV', 'JSON'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFormat(fmt as 'CSV' | 'JSON')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedFormat === fmt
                              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                              : 'bg-[#040916] text-slate-400 border border-blue-500/20 hover:border-slate-600'
                          }`}
                        >
                          {fmt} Format
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-300">Export Parameters</label>
                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'includeConfidence', label: 'Include confidence score metrics' },
                        { id: 'includeEvidence', label: 'Include evidence citation URLs' },
                        { id: 'includeValidation', label: 'Include UNSPSC / ETIM metadata' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions[opt.id as keyof typeof exportOptions]}
                            onChange={(e) =>
                              setExportOptions({ ...exportOptions, [opt.id]: e.target.checked })
                            }
                            className="rounded border-slate-700 bg-slate-800 text-blue-600"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download {selectedFormat}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};
