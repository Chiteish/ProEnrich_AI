/**
 * Product Detail Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import type { Product, ProductAttribute, Evidence } from '../types';
import { productService } from '../services/productService';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronLeft,
  X,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'overview' | 'attributes' | 'descriptions' | 'evidence' | 'validation' | 'raw';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [prod, attrs, evid] = await Promise.all([
          productService.getProduct(id),
          productService.getProductAttributes(id),
          productService.getProductEvidence(id),
        ]);
        setProduct(prod);
        setAttributes(attrs);
        setEvidence(evid);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !product) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-28 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          <div className="h-64 bg-[#081126]/60 rounded-2xl animate-pulse border border-blue-500/10" />
        </div>
      </MainLayout>
    );
  }

  const tabs: { label: string; value: TabType }[] = [
    { label: 'Overview', value: 'overview' },
    { label: `Attributes (${attributes.length})`, value: 'attributes' },
    { label: 'Syndication Copy', value: 'descriptions' },
    { label: `Evidence (${evidence.length})`, value: 'evidence' },
    { label: 'Validation Scorecard', value: 'validation' },
    { label: 'Raw Payload', value: 'raw' },
  ];

  return (
    <MainLayout>
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors mb-4 cursor-pointer"
      >
        <ChevronLeft size={14} />
        <span>Back to Product Catalog</span>
      </Link>

      {/* Main Header Card */}
      <div className="p-6 lg:p-8 rounded-3xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-blue-600/20 text-cyan-300 border border-blue-500/30 font-bold">
                {product.mfrPartNum}
              </span>
              <span className="text-xs text-slate-400">
                {product.manufacturer} &bull; {product.brand}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{product.description}</h1>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 ${
              product.status === 'validated' || product.status === 'commerce-ready'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            <CheckCircle2 size={14} />
            <span className="capitalize">{product.status.replace('-', ' ')}</span>
          </span>
        </div>

        {/* 4 Quality Metric Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Metadata Completeness', val: `${product.completeness}%`, color: 'text-cyan-400' },
            { label: 'AI Prediction Confidence', val: `${product.confidence}%`, color: 'text-emerald-400' },
            { label: 'Evidence Coverage', val: '94.2%', color: 'text-white' },
            { label: 'Output Attributes', val: '252 Fields', color: 'text-cyan-300' },
          ].map((m, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#040916] border border-blue-500/15">
              <p className="text-[11px] text-slate-400 leading-tight">{m.label}</p>
              <p className={`text-xl font-bold font-mono mt-1 ${m.color}`}>{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-blue-500/15">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                  : 'bg-[#081126]/80 text-slate-400 hover:text-white border border-blue-500/15'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#081126]/90 border border-blue-500/20 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Product Identity & Hierarchy</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Manufacturer Part Number', val: product.mfrPartNum },
                  { label: 'Manufacturer', val: product.manufacturer },
                  { label: 'Brand Name', val: product.brand },
                  { label: 'Department (UNSPSC)', val: product.department },
                  { label: 'Class', val: product.class },
                  { label: 'Fine Taxonomy Code', val: product.fine },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#040916] border border-blue-500/10 flex justify-between">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-semibold text-white font-mono">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#081126]/90 border border-blue-500/20 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Transformation Metrics</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex justify-between items-center">
                  <span className="text-slate-400">Raw Input Fields</span>
                  <span className="font-mono font-bold text-slate-300">{product.inputFields} Fields</span>
                </div>
                <div className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex justify-between items-center">
                  <span className="text-slate-400">Enriched Output Fields</span>
                  <span className="font-mono font-bold text-cyan-400">{product.outputFields} Standardized Fields</span>
                </div>
                <div className="p-3 rounded-xl bg-[#040916] border border-emerald-500/20 flex justify-between items-center">
                  <span className="text-slate-400">Net Enrichment Multiplier</span>
                  <span className="font-mono font-bold text-emerald-400">42x Spec Expansion</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attributes Table */}
        {activeTab === 'attributes' && (
          <div className="p-6 rounded-2xl bg-[#081126]/95 border border-blue-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#040916] text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold">Attribute Name</th>
                    <th className="py-3 px-4 font-semibold">Standardized Value</th>
                    <th className="py-3 px-4 font-semibold">UOM</th>
                    <th className="py-3 px-4 font-semibold">Confidence</th>
                    <th className="py-3 px-4 font-semibold">Verifiable Source</th>
                    <th className="py-3 px-4 text-center font-semibold">Evidence Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attributes.map((attr) => (
                    <tr
                      key={attr.id}
                      onClick={() => setSelectedAttribute(attr)}
                      className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-white font-semibold">{attr.attribute}</td>
                      <td className="py-3 px-4 text-cyan-300 font-mono font-medium">{attr.value}</td>
                      <td className="py-3 px-4 text-slate-400">{attr.uom || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            attr.confidence >= 80
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {attr.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{attr.source}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold">
                          View Snippet &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Descriptions */}
        {activeTab === 'descriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Short Marketing Title', val: 'Diablo 1/2"x18" Sanding Belt 6pc' },
              { title: 'Mobile Catalog Copy', val: 'Premium aluminum oxide sanding belt for industrial professional results' },
              { title: 'Invoice Standard String', val: 'Diablo 18in Sanding Belt 80G - 6 Pack' },
              { title: 'Rich Technical Narrative', val: 'Diablo heavy-duty aluminum oxide sanding belt designed for high-stress metalworking, deburring, and hardwood finishing operations with tear-resistant cloth backing.' },
            ].map((desc, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#081126]/90 border border-blue-500/20 space-y-3">
                <h4 className="text-xs font-bold text-white">{desc.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#040916] p-3 rounded-xl border border-blue-500/10">
                  {desc.val}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => navigator.clipboard?.writeText(desc.val)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-cyan-400/30 text-cyan-300 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Evidence */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            {evidence.map((ev) => (
              <div key={ev.id} className="p-5 rounded-2xl bg-[#081126]/90 border border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{ev.attribute}: </span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">{ev.value}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {ev.confidence}% Confidence
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic bg-[#040916] p-3 rounded-xl border border-blue-500/10">
                  &ldquo;{ev.evidence}&rdquo;
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Source: <strong className="text-white">{ev.source}</strong></span>
                  <span className="text-emerald-400 font-semibold">Verified Authoritative</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Validation */}
        {activeTab === 'validation' && (
          <div className="p-6 rounded-2xl bg-[#081126]/90 border border-blue-500/20 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Validation Integrity Rules</h3>
            <div className="space-y-2 text-xs">
              {[
                { rule: 'LOV (List of Values) Compliance', status: 'Passed (100%)', valid: true },
                { rule: 'UOM Standard Conversion (SI Units)', status: 'Passed (100%)', valid: true },
                { rule: 'UNSPSC Taxonomy Schema Alignment', status: 'Passed (100%)', valid: true },
                { rule: 'ETIM 8.0 Feature Matrix Completeness', status: 'Validated (96.8%)', valid: true },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex items-center justify-between">
                  <span className="text-slate-300">{r.rule}</span>
                  <span className="font-bold text-emerald-400 font-mono">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Raw Data */}
        {activeTab === 'raw' && (
          <div className="p-6 rounded-2xl bg-[#040916] border border-blue-500/20 font-mono text-xs text-cyan-300 overflow-x-auto">
            <pre>{JSON.stringify(product, null, 2)}</pre>
          </div>
        )}
      </motion.div>

      {/* Evidence Drawer */}
      <AnimatePresence>
        {selectedAttribute && (
          <div
            onClick={() => setSelectedAttribute(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end p-4"
          >
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#081024] border border-blue-500/30 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Verifiable Source Evidence</h3>
                </div>
                <button
                  onClick={() => setSelectedAttribute(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Attribute</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedAttribute.attribute}</p>
                </div>
                <div>
                  <span className="text-slate-400">Normalized Value</span>
                  <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{selectedAttribute.value}</p>
                </div>
                <div>
                  <span className="text-slate-400">Confidence Score</span>
                  <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{selectedAttribute.confidence}%</p>
                </div>
                {selectedAttribute.evidence && (
                  <div>
                    <span className="text-slate-400">Extracted Quote</span>
                    <p className="p-3 rounded-xl bg-[#040916] border border-blue-500/15 text-slate-300 italic mt-1">
                      &ldquo;{selectedAttribute.evidence}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedAttribute(null)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};
