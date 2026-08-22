/**
 * Sources Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import type { Source } from '../types';
import { sourceService } from '../services/sourceService';
import {
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Globe,
  FileText,
  Search,
  Sparkles,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sources: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const data = await sourceService.getSources();
        setSources(data);
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  const filteredSources = sources.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FileSpreadsheet size={14} />
            <span>VERIFIABLE EVIDENCE REPOSITORY</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Retrieved Evidence Sources
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative manufacturer portals, datasheets, CAD documents, and technical PDFs supporting enriched attributes.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter datasources..."
            className="w-full bg-[#040916] border border-blue-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 hover:border-cyan-400/40 hover:bg-[#0a1532]/90 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                      {source.type.toLowerCase().includes('pdf') ? (
                        <FileText size={18} />
                      ) : (
                        <Globe size={18} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{source.name}</h3>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">{source.type}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      source.reliability === 'high'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {source.reliability.toUpperCase()} RELIABILITY
                  </span>
                </div>

                {/* Relevance progress */}
                <div className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 space-y-1.5 my-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Relevance Match</span>
                    <span className="font-mono font-bold text-cyan-400">{source.relevance}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                      style={{ width: `${source.relevance}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#040916]/60 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Attributes Supported</p>
                    <p className="font-bold text-white text-sm mt-0.5">{source.attributesSupported}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#040916]/60 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Evidence Snippets</p>
                    <p className="font-bold text-cyan-300 text-sm mt-0.5">{source.evidenceCount}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                <button className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600/20 text-cyan-300 border border-cyan-400/30 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                  Inspect Snippets
                </button>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs rounded-xl bg-[#040916] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
