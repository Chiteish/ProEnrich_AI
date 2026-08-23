/**
 * Dashboard Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { dashboardService } from '../services/dashboardService';
import type { DashboardKPI, PipelineStage, ActivityLog } from '../types';
import {
  Package,
  CheckCircle2,
  Target,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowRight,
  Boxes,
  Cpu,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpisData, stagesData, activitiesData, qualityData] = await Promise.all([
          dashboardService.getKPIs(),
          dashboardService.getPipelineStages(),
          dashboardService.getActivityLog(),
          dashboardService.getQualityMetrics(),
        ]);
        setKpis(kpisData);
        setStages(stagesData);
        setActivities(activitiesData);
        setQualityMetrics(qualityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const iconMap: { [key: string]: React.ReactNode } = {
    package: <Package size={20} className="text-cyan-400" />,
    checkCircle: <CheckCircle2 size={20} className="text-emerald-400" />,
    target: <Target size={20} className="text-cyan-400" />,
    shield: <ShieldCheck size={20} className="text-cyan-400" />,
    alertCircle: <AlertCircle size={20} className="text-amber-400" />,
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-16 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Layers size={14} />
            <span>OPERATIONAL COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Product Intelligence Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor enrichment throughput, catalog metadata completeness, validation rates, and syndication readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ingest"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Ingest New Catalog</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        {kpis.map((kpi, index) => {
          const isNegative = kpi.trend !== undefined && kpi.trend < 0;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 hover:border-cyan-400/40 hover:bg-[#0a1532]/90 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400 leading-tight">{kpi.label}</span>
                <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                  {iconMap[kpi.icon] || <Boxes size={16} className="text-cyan-400" />}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{kpi.value}</span>
                  {kpi.unit && <span className="text-xs text-slate-400">{kpi.unit}</span>}
                </div>

                {kpi.trend !== undefined && (
                  <p
                    className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${
                      isNegative ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isNegative ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                    <span>{Math.abs(kpi.trend)}% vs last 7 days</span>
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Pipeline Progress + Catalog Quality Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left: AI Enrichment Pipeline Stages (col-span-7) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={16} className="text-cyan-400" />
              <span>AI Enrichment Pipeline Status</span>
            </h2>
            <Link to="/processing" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View live execution &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => {
              const isComplete = stage.status === 'completed';
              const isProcessing = stage.status === 'processing';
              const isReview = stage.status === 'needs_review';

              return (
                <div
                  key={stage.id}
                  className="p-3.5 rounded-xl bg-[#040916]/80 border border-blue-500/15 hover:border-blue-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isComplete
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isProcessing
                            ? 'bg-blue-600 text-white border border-cyan-400 animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isComplete ? '✓' : isProcessing ? '●' : '○'}
                      </div>
                      <span className="font-semibold text-white">{stage.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-semibold ${
                          isComplete
                            ? 'text-emerald-400'
                            : isProcessing
                            ? 'text-cyan-400'
                            : isReview
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isComplete ? 'Complete' : isProcessing ? 'Processing' : isReview ? 'Needs Review' : 'Waiting'}
                      </span>
                      <span className="font-mono text-slate-300 font-bold">{stage.progress}%</span>
                    </div>
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
        </motion.div>

        {/* Right: Catalog Quality Scorecard (col-span-5) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Catalog Quality Metrics</span>
            </h2>
            <Link to="/analytics" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {qualityMetrics &&
              Object.entries(qualityMetrics).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 capitalize">
                      {key
                        .split(/(?=[A-Z])/)
                        .join(' ')
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{value}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Overall Readiness Score</p>
              <p className="text-[11px] text-slate-400">96.8% of attributes validated</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
              Commerce Ready
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Ingestion & Enrichment Activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <span>Recent System Activity</span>
          </h2>
          <span className="text-[10px] text-slate-400">Real-time event stream</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activities.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No recent activity — upload a catalog to begin enrichment.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-base leading-none">{activity.icon}</span>
                  <p className="text-xs text-slate-200">{activity.message}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{activity.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};
