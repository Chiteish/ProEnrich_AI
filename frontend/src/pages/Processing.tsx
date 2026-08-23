/**
 * Processing Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import type { ProcessingJob } from '../types';
import { processingService } from '../services/processingService';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Processing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeJobId = searchParams.get('jobId') || localStorage.getItem('activeJobId');
    if (!activeJobId) {
      setLoading(false);
      return;
    }

    let intervalId: any = null;

    const fetchJob = async () => {
      try {
        const result = await processingService.getJobStatus(activeJobId);
        setJob(result);

        intervalId = setInterval(async () => {
          try {
            const updated = await processingService.getJobStatus(activeJobId);
            setJob(updated);

            if (updated.status === 'completed' || updated.status === 'failed') {
              clearInterval(intervalId);
            }
          } catch (intervalErr) {
            console.error('Failed to update job status inside interval:', intervalErr);
          }
        }, 2500);
      } catch (error) {
        console.error('Failed to fetch job status on mount:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searchParams]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-16 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          <div className="h-40 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-16 bg-[#081126]/80 rounded-3xl border border-blue-500/20 max-w-lg mx-auto p-8">
          <Cpu size={40} className="text-cyan-400/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Active Enrichment Job</h3>
          <p className="text-xs text-slate-400 mb-6">
            Upload a product catalog file to launch the 252-field AI enrichment pipeline.
          </p>
          <Link
            to="/ingest"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>Ingest Product Catalog</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const percentage = job.totalProducts > 0 ? Math.round((job.processedProducts / job.totalProducts) * 100) : 0;

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Cpu size={14} />
            <span>NEURAL EXTRACTION ENGINE</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            AI Enrichment in Progress
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Transforming raw SKU descriptions into verified, structured 252-field product intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/review"
            className="px-5 py-2.5 rounded-xl bg-[#081126] border border-blue-500/30 hover:border-cyan-400/50 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ShieldCheck size={15} />
            <span>Open Review Queue</span>
          </Link>
        </div>
      </div>

      {/* Main Banner Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 lg:p-8 rounded-3xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] mb-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Job Completion</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-white">{percentage}%</span>
              <span className="text-sm font-semibold text-cyan-400">
                {job.processedProducts.toLocaleString()} / {job.totalProducts.toLocaleString()} Products Processed
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.25)] shrink-0 self-start sm:self-auto">
            <Sparkles size={14} className="animate-spin text-cyan-400" />
            <span>Live Neural Inference Active</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-blue-500/20">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(56,189,248,0.7)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </motion.div>

      {/* Grid: Pipeline Stages (col-span-8) + Live Stats (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pipeline Stages (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              <span>Multi-Stage Neural Pipeline</span>
            </h3>

            <div className="space-y-3">
              {job.stages.map((stage) => {
                const isComplete = stage.status === 'completed';
                const isProcessing = stage.status === 'processing';

                return (
                  <div
                    key={stage.id}
                    className="p-4 rounded-xl bg-[#040916]/80 border border-blue-500/15 hover:border-blue-500/30 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isComplete
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : isProcessing
                              ? 'bg-blue-600 text-white border border-cyan-400 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.6)]'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isComplete ? '✓' : isProcessing ? '●' : '○'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">{stage.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {isComplete ? 'Completed' : isProcessing ? 'In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-cyan-400 text-xs sm:text-sm">
                        {stage.progress}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isComplete
                            ? 'bg-emerald-500'
                            : isProcessing
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Statistics (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <span>Real-Time Job Telemetry</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Products Processed', val: '1,000 / 1,000', color: 'text-white' },
                { label: 'Attributes Extracted', val: '7,842 Total', color: 'text-cyan-300' },
                { label: 'Datasources Retrieved', val: '1,284 Verified', color: 'text-white' },
                { label: 'High Confidence Rate', val: '96.8%', color: 'text-emerald-400' },
                { label: 'Flagged for Human Review', val: '47 Attributes', color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex items-center justify-between">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className={`font-mono font-bold ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/products"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Enriched Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
