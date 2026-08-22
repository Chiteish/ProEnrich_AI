/**
 * Analytics Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import type { AnalyticsData } from '../types';
import { analyticsService } from '../services/analyticsService';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-16 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const confidenceData = [
    { name: 'High (>=80%)', value: analytics.confidenceDistribution.high },
    { name: 'Medium (60-79%)', value: analytics.confidenceDistribution.medium },
    { name: 'Low (<60%)', value: analytics.confidenceDistribution.low },
  ];

  const validationData = [
    { name: 'Validated', value: analytics.validationDistribution.validated },
    { name: 'Needs Review', value: analytics.validationDistribution.needsReview },
    { name: 'Failed / Discarded', value: analytics.validationDistribution.failed },
  ];

  const sourceData = Object.entries(analytics.sourceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const performanceData = analytics.pipelinePerformance;

  // Clean Theme Palette
  const THEME_COLORS = {
    high: '#10B981', // Emerald
    medium: '#F59E0B', // Amber
    low: '#EF4444', // Red
    primary: '#2563EB', // Blue
    cyan: '#38BDF8', // Sky Cyan
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Activity size={14} />
            <span>INTELLIGENCE QUALITY & TELEMETRY</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Enrichment Analytics & Scorecards
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track completeness transformation, accuracy distributions, and inference latency across all product lines.
          </p>
        </div>
      </div>

      {/* Completeness Transformation Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Metadata Completeness Transformation
          </span>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp size={14} />
            <span>+68.6% Lift</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="p-5 rounded-2xl bg-[#040916] border border-blue-500/15 text-center">
            <p className="text-xs text-slate-400 mb-1">Before AI Enrichment (Raw)</p>
            <p className="text-4xl font-black text-amber-400">{analytics.completenessBefore}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Fragmented ERP export strings</p>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-2">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <p className="text-xs font-bold text-white">ProEnrich AI Pipeline</p>
            <p className="text-[10px] text-slate-400">252 Attributes Mapped</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#040916] border border-emerald-500/30 text-center shadow-[0_0_25px_rgba(16,185,129,0.15)]">
            <p className="text-xs text-slate-400 mb-1">After AI Enrichment (Commerce-Ready)</p>
            <p className="text-4xl font-black text-emerald-400">{analytics.completenessAfter}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Verified with source citations</p>
          </div>
        </div>
      </motion.div>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Confidence Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Confidence Score Distribution</h3>
            <span className="text-[10px] text-slate-400">Based on evidence citations</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={confidenceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={THEME_COLORS.high} />
                <Cell fill={THEME_COLORS.medium} />
                <Cell fill={THEME_COLORS.low} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040916',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 text-xs pt-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              High (&ge;80%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium (60-79%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Low (&lt;60%)
            </span>
          </div>
        </motion.div>

        {/* Chart 2: Validation Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Validation Status Breakdown</h3>
            <span className="text-[10px] text-slate-400">Total verified vs review</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={validationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={THEME_COLORS.high} />
                <Cell fill={THEME_COLORS.medium} />
                <Cell fill={THEME_COLORS.low} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040916',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 text-xs pt-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Validated ({analytics.validationDistribution.validated})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Needs Review ({analytics.validationDistribution.needsReview})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Failed ({analytics.validationDistribution.failed})
            </span>
          </div>
        </motion.div>

        {/* Chart 3: Datasource Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Evidence Source Attribution</h3>
            <span className="text-[10px] text-slate-400">Total citations found</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040916',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" fill={THEME_COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Chart 4: Pipeline Stage Performance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Pipeline Stage Success Rates</h3>
            <span className="text-[10px] text-slate-400">Throughput efficiency</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#040916',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="success" fill={THEME_COLORS.cyan} radius={[6, 6, 0, 0]} name="Success Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </MainLayout>
  );
};
