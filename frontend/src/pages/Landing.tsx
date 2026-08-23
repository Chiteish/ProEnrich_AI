/**
 * Landing Page - Single Viewport (No Scroll / No Slide)
 * Pixel-perfect match to reference design in a unified single screen.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Search,
  Bell,
  Check,
  CheckCircle2,
  Sparkles,
  Database,
  Brain,
  ShieldCheck,
  UserCheck,
  Package,
  Layers,
  FileSpreadsheet,
  Cpu,
  Boxes,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  X,
  ChevronRight,
  SlidersHorizontal,
  FileCheck2,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleWave } from '../components/common/ParticleWave';

// Futuristic Crystal Polyhedron Logo
const ProEnrichLogo = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon
      points="16,2 29,9.5 29,22.5 16,30 3,22.5 3,9.5"
      stroke="#38BDF8"
      strokeWidth="2"
      strokeLinejoin="round"
      className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
    />
    <polygon
      points="16,7 24,11.5 24,20.5 16,25 8,20.5 8,11.5"
      stroke="#2563EB"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="3" fill="#38BDF8" className="animate-pulse" />
    <line x1="16" y1="2" x2="16" y2="7" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="29" y1="9.5" x2="24" y2="11.5" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="29" y1="22.5" x2="24" y2="20.5" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="16" y1="30" x2="16" y2="25" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="3" y1="22.5" x2="8" y2="20.5" stroke="#38BDF8" strokeWidth="1.5" />
    <line x1="3" y1="9.5" x2="8" y2="11.5" stroke="#38BDF8" strokeWidth="1.5" />
  </svg>
);

// Pipeline Stages Data
const PIPELINE_STAGES = [
  { id: 'ingest', label: 'Ingest', status: 'Completed' },
  { id: 'understand', label: 'Understand', status: 'Completed' },
  { id: 'match', label: 'Match', status: 'Completed' },
  { id: 'classify', label: 'Classify', status: 'Completed' },
  { id: 'ontology', label: 'Ontology', status: 'Completed' },
  { id: 'rag', label: 'RAG Enrich', status: 'In Progress' },
  { id: 'validate', label: 'Validate', status: 'Pending' },
  { id: 'output', label: 'Output', status: 'Pending' },
];

// Product Data
interface ProductItem {
  partNumber: string;
  description: string;
  manufacturer: string;
  completeness1: string;
  completeness2: string;
  status: 'Validated' | 'Review';
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    partNumber: 'DC8518ASTS08G',
    description: 'Diablo 1/2"x18" Sanding Belt 6pc',
    manufacturer: 'Freud Inc',
    completeness1: '94%',
    completeness2: '97%',
    status: 'Validated',
  },
  {
    partNumber: 'VLV-100-SS-BV',
    description: 'Stainless Steel Ball Valve 1"',
    manufacturer: 'ABC Industries',
    completeness1: '92%',
    completeness2: '95%',
    status: 'Validated',
  },
  {
    partNumber: 'BRG-6205-2RS',
    description: 'Deep Groove Ball Bearing',
    manufacturer: 'SKF',
    completeness1: '90%',
    completeness2: '94%',
    status: 'Validated',
  },
  {
    partNumber: 'PMP-25-1-150',
    description: 'Centrifugal Pump 1HP',
    manufacturer: 'Grundfos',
    completeness1: '88%',
    completeness2: '92%',
    status: 'Review',
  },
  {
    partNumber: 'FST-HEX-50-316',
    description: 'Hex Bolt 5/16"x2" SS 316',
    manufacturer: 'Fastenal',
    completeness1: '85%',
    completeness2: '90%',
    status: 'Review',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activePipelineIndex, setActivePipelineIndex] = useState(5); // RAG Enrich active
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isPlatformVideoOpen, setIsPlatformVideoOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Demo Form State
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    company: '',
    catalogSize: '10,000 - 50,000 SKUs',
    message: '',
  });

  // Cycle pipeline active stage gently
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePipelineIndex((prev) => (prev === 7 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filtered Products for Live Search in Mockup Table
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_PRODUCTS;
    const q = searchQuery.toLowerCase();
    return INITIAL_PRODUCTS.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setDemoSubmitted(false);
      setDemoForm({
        name: '',
        email: '',
        company: '',
        catalogSize: '10,000 - 50,000 SKUs',
        message: '',
      });
    }, 2000);
  };

  const navMenuItems = [
    {
      name: 'Platform',
      dropdown: [
        { title: 'Data Ingestion Hub', desc: 'Connect ERPs, PDFs, websites & supplier feeds', href: '/ingest' },
        { title: 'AI Classification Engine', desc: 'Automatic UNSPSC & ETIM taxonomy mapping', href: '/processing' },
        { title: 'Enrichment & RAG Pipeline', desc: 'Extract and validate 250+ technical attributes', href: '/products' },
        { title: 'Human Review & Verification', desc: 'Collaborative approval and exception workflows', href: '/review' },
        { title: 'Quality & Analytics Hub', desc: 'Real-time completeness and confidence metrics', href: '/analytics' },
      ],
    },
    {
      name: 'Solutions',
      dropdown: [
        { title: 'Industrial Distributors', desc: 'Fast-track catalog modernization & SEO' },
        { title: 'B2B Marketplaces', desc: 'Normalize multi-vendor supplier listings seamlessly' },
        { title: 'Manufacturers & Brands', desc: 'Syndicate pristine product spec sheets everywhere' },
        { title: 'E-Commerce Enterprise', desc: 'Boost conversion with rich spec comparison' },
      ],
    },
    {
      name: 'Resources',
      dropdown: [
        { title: 'Documentation & Guides', desc: 'API docs and developer integration kits' },
        { title: 'Taxonomy Standards', desc: 'ETIM, UNSPSC & custom B2B schemas' },
        { title: 'Case Studies', desc: 'How global distributors achieved 99.4% accuracy' },
        { title: 'Product Intelligence Blog', desc: 'Latest research in industrial AI' },
      ],
    },
    {
      name: 'Company',
      dropdown: [
        { title: 'About ProEnrich AI', desc: 'Our mission to redefine industrial commerce' },
        { title: 'Careers', desc: 'Join our AI engineering & product teams' },
        { title: 'Security & Compliance', desc: 'SOC2 Type II, ISO 27001 & data sovereignty' },
        { title: 'Contact Us', desc: 'Get in touch with our solutions specialists' },
      ],
    },
  ];

  return (
    <div className="h-screen w-screen max-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Animated 3D Particle Wave Grid */}
      <ParticleWave />

      {/* Atmospheric Glow Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-gradient-to-b from-blue-600/15 via-blue-900/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[5%] left-[-5%] w-[600px] h-[600px] bg-blue-700/15 blur-[150px] pointer-events-none -z-10" />

      {/* TOP NAVIGATION BAR (Fixed height) */}
      <header className="shrink-0 z-50 w-full backdrop-blur-xl bg-[#030712]/80 border-b border-white/[0.08] h-16 flex items-center">
        <div className="max-w-[1550px] w-full mx-auto px-6 lg:px-10 flex items-center justify-between">
          {/* Left: Brand Logo & Subtitle */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-900/40 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:border-cyan-400/60 transition-all">
              <ProEnrichLogo className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white flex items-center gap-1">
                PROENRICH <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-normal tracking-wide text-slate-400 -mt-1">
                Product Intelligence Redefined
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navMenuItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors py-2">
                  {item.name}
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      openDropdown === item.name ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 p-2.5 rounded-2xl bg-[#081024]/95 backdrop-blur-2xl border border-blue-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(37,99,235,0.2)] z-50"
                    >
                      <div className="space-y-0.5">
                        {item.dropdown.map((subItem, idx) => (
                          <Link
                            key={idx}
                            to={(subItem as any).href || '#'}
                            onClick={() => setOpenDropdown(null)}
                            className="block p-2 rounded-xl hover:bg-blue-600/15 border border-transparent hover:border-blue-500/20 transition-all group"
                          >
                            <p className="text-xs font-semibold text-white group-hover:text-cyan-400 flex items-center justify-between">
                              {subItem.title}
                              <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{subItem.desc}</p>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link
              to="/dashboard"
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Right: Auth & CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all"
            >
              Sign In
            </Link>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(37,99,235,0.45)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center gap-1.5 transition-all group"
            >
              <span>Request Demo</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT: HERO LEFT + DASHBOARD RIGHT (Fits in middle height) */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-6 lg:px-10 py-2 flex items-center overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & CTAs (col-span-5) */}
          <div className="lg:col-span-5 space-y-3.5 xl:space-y-4.5 pr-2">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-[11px] font-semibold tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
              <span>AI-POWERED PRODUCT INTELLIGENCE</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black tracking-tight text-white leading-[1.12]"
            >
              Intelligent Data.
              <br />
              Trusted Commerce.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                Real Impact.
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-lg"
            >
              ProEnrich AI transforms fragmented product information into accurate, enriched, validated, and traceable
              product intelligence—so you can sell with confidence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7)] flex items-center gap-2 transition-all group"
              >
                <span>Get Started</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setIsPlatformVideoOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-[#0a1329]/80 border border-slate-700/80 hover:border-cyan-400/50 hover:bg-[#0f1d3d] flex items-center gap-2 transition-all group shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              >
                <span>Explore Platform</span>
                <div className="w-4.5 h-4.5 rounded-full border border-slate-400 group-hover:border-cyan-400 flex items-center justify-center transition-colors">
                  <Play size={9} className="fill-slate-300 group-hover:fill-cyan-400 text-transparent ml-0.5" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Sleek Glassmorphic Dashboard Window (col-span-7) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl bg-[#060c1d]/90 backdrop-blur-2xl border border-blue-500/25 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(37,99,235,0.22)] overflow-hidden">
              {/* App Top Bar */}
              <div className="px-4 py-2.5 bg-[#091226]/80 border-b border-blue-500/15 flex items-center justify-between gap-3">
                {/* Brand inside window */}
                <div className="flex items-center gap-1.5">
                  <ProEnrichLogo className="w-4 h-4" />
                  <span className="text-[11px] font-bold tracking-wider text-white">PROENRICH AI</span>
                </div>

                {/* Search Bar with live filter */}
                <div className="flex-1 max-w-xs relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, attributes, part numbers..."
                    className="w-full bg-[#050b18] border border-blue-500/20 rounded-lg pl-2.5 pr-7 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-all"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={11} />
                    </button>
                  ) : (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono">
                      ⌘K
                    </span>
                  )}
                </div>

                {/* Top Right Icons & User Avatar */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <button className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/40">
                      <Bell size={14} />
                    </button>
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-200">
                    AM
                  </div>
                </div>
              </div>

              {/* App Body: Sidebar + Main Canvas */}
              <div className="grid grid-cols-12">
                {/* Left Sidebar inside Mockup (col-span-2) */}
                <div className="col-span-3 sm:col-span-2 bg-[#040916]/70 border-r border-blue-500/10 p-2 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    {[
                      { name: 'Dashboard', icon: Layers, path: '/dashboard' },
                      { name: 'Ingest', icon: Database, path: '/ingest' },
                      { name: 'Products', icon: Package, path: '/products' },
                      { name: 'Processing', icon: Cpu, path: '/processing' },
                      { name: 'Review', icon: ShieldCheck, path: '/review' },
                      { name: 'Sources', icon: FileSpreadsheet, path: '/sources' },
                      { name: 'Analytics', icon: Activity, path: '/analytics' },
                      { name: 'Settings', icon: SlidersHorizontal, path: '/settings' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            setActiveTab(item.name);
                            if (item.name !== 'Dashboard') {
                              navigate(item.path);
                            }
                          }}
                          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                          }`}
                        >
                          <Icon size={11} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Content Area inside Mockup (col-span-10) */}
                <div className="col-span-9 sm:col-span-10 p-3 sm:p-3.5 space-y-2.5 overflow-hidden">
                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white">Overview</h3>
                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live Stream Active
                    </span>
                  </div>

                  {/* 5 Stats Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Stat 1: Products Processed */}
                    <div className="bg-[#091328]/80 border border-blue-500/15 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 leading-tight">Products Processed</p>
                      <p className="text-sm font-bold text-white mt-0.5">1,000</p>
                      <p className="text-[8px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingUp size={9} />
                        <span>12.4% vs last 7 days</span>
                      </p>
                    </div>

                    {/* Stat 2: Enrichment Completed */}
                    <div className="bg-[#091328]/80 border border-blue-500/15 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 leading-tight">Enrichment Completed</p>
                      <p className="text-sm font-bold text-white mt-0.5">842</p>
                      <p className="text-[8px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingUp size={9} />
                        <span>11.7% vs last 7 days</span>
                      </p>
                    </div>

                    {/* Stat 3: Metadata Completeness */}
                    <div className="bg-[#091328]/80 border border-blue-500/15 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 leading-tight">Metadata Completeness</p>
                      <p className="text-sm font-bold text-white mt-0.5">93.4%</p>
                      <p className="text-[8px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingUp size={9} />
                        <span>8.9% vs last 7 days</span>
                      </p>
                    </div>

                    {/* Stat 4: Validation Score */}
                    <div className="bg-[#091328]/80 border border-blue-500/15 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 leading-tight">Validation Score</p>
                      <p className="text-sm font-bold text-white mt-0.5">96.8%</p>
                      <p className="text-[8px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingUp size={9} />
                        <span>7.3% vs last 7 days</span>
                      </p>
                    </div>

                    {/* Stat 5: Needs Review */}
                    <div className="bg-[#091328]/80 border border-blue-500/15 rounded-lg p-2 col-span-2 sm:col-span-1">
                      <p className="text-[9px] text-slate-400 leading-tight">Needs Review</p>
                      <p className="text-sm font-bold text-amber-400 mt-0.5">47</p>
                      <p className="text-[8px] text-amber-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingDown size={9} />
                        <span>3.2% vs last 7 days</span>
                      </p>
                    </div>
                  </div>

                  {/* AI Enrichment Pipeline Stepper */}
                  <div className="bg-[#081124]/90 border border-blue-500/15 rounded-lg p-2">
                    <p className="text-[10px] font-semibold text-slate-200 mb-2">AI Enrichment Pipeline</p>
                    <div className="flex items-center justify-between overflow-x-auto pb-0.5 gap-1">
                      {PIPELINE_STAGES.map((stage, idx) => {
                        const isDone = idx < activePipelineIndex;
                        const isActive = idx === activePipelineIndex;

                        return (
                          <div key={stage.id} className="flex items-center flex-1 min-w-[50px]">
                            <button
                              onClick={() => setActivePipelineIndex(idx)}
                              className="flex flex-col items-center text-center w-full group cursor-pointer focus:outline-none"
                            >
                              <div
                                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                  isDone
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                    : isActive
                                    ? 'bg-blue-600 text-white border border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] scale-110 animate-pipeline-active'
                                    : 'bg-slate-800/40 text-slate-500 border border-slate-700/60 border-dashed'
                                }`}
                              >
                                {isDone ? (
                                  <Check size={11} className="text-emerald-400" />
                                ) : isActive ? (
                                  <Sparkles size={11} className="text-cyan-300 animate-spin" />
                                ) : (
                                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                                )}
                              </div>
                              <span
                                className={`text-[9px] mt-1 font-medium leading-none ${
                                  isActive ? 'text-cyan-300 font-semibold' : isDone ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {stage.label}
                              </span>
                              <span
                                className={`text-[7px] mt-0.5 leading-none ${
                                  isActive
                                    ? 'text-cyan-400 font-semibold'
                                    : isDone
                                    ? 'text-emerald-400'
                                    : 'text-slate-600'
                                }`}
                              >
                                {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                              </span>
                            </button>

                            {/* Connecting Line between nodes */}
                            {idx < PIPELINE_STAGES.length - 1 && (
                              <div
                                className={`h-[1.5px] flex-1 mx-0.5 rounded-full transition-colors ${
                                  idx < activePipelineIndex ? 'bg-emerald-500/60' : 'bg-slate-700/40'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Split: Recent Products Table + Quality Insights Donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
                    {/* Left: Recent Products Table (col-span-8) */}
                    <div className="lg:col-span-8 bg-[#081124]/90 border border-blue-500/15 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-slate-200">Recent Products</span>
                        <Link
                          to="/products"
                          className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                        >
                          View all products →
                        </Link>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[9px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="pb-1 font-medium">Part Number</th>
                              <th className="pb-1 font-medium">Description</th>
                              <th className="pb-1 font-medium">Manufacturer</th>
                              <th className="pb-1 font-medium">Completeness</th>
                              <th className="pb-1 font-medium text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {filteredProducts.slice(0, 5).map((p, idx) => (
                              <tr
                                key={idx}
                                onClick={() => navigate('/products/1')}
                                className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                              >
                                <td className="py-1 font-mono text-slate-300">{p.partNumber}</td>
                                <td className="py-1 text-slate-300 truncate max-w-[120px]">{p.description}</td>
                                <td className="py-1 text-slate-400">{p.manufacturer}</td>
                                <td className="py-1 font-mono text-slate-300">
                                  <span className="text-slate-400">{p.completeness1}</span>{' '}
                                  <span className="text-cyan-400 font-semibold">{p.completeness2}</span>
                                </td>
                                <td className="py-1 text-right">
                                  <span
                                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-medium ${
                                      p.status === 'Validated'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Quality Insights Donut Chart (col-span-4) */}
                    <div className="lg:col-span-4 bg-[#081124]/90 border border-blue-500/15 rounded-lg p-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-200">Quality Insights</span>
                      </div>

                      {/* Radial Donut Gauge */}
                      <div className="flex items-center justify-center my-1 relative">
                        <svg className="w-18 h-18 -rotate-90" viewBox="0 0 100 100">
                          {/* Background Ring */}
                          <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="10" fill="none" />
                          {/* Validated Arc (76%) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeDasharray="238.76"
                            strokeDashoffset="57.3"
                            strokeLinecap="round"
                            fill="none"
                            className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                          />
                          {/* Needs Review Arc (18%) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#f59e0b"
                            strokeWidth="10"
                            strokeDasharray="238.76"
                            strokeDashoffset="195"
                            fill="none"
                          />
                          {/* Invalid Arc (6%) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#ef4444"
                            strokeWidth="10"
                            strokeDasharray="238.76"
                            strokeDashoffset="224"
                            fill="none"
                          />
                        </svg>

                        {/* Center Score */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-black text-white leading-none">93%</span>
                          <span className="text-[7px] text-slate-400 mt-0.5">Overall Quality</span>
                        </div>
                      </div>

                      {/* Donut Legend */}
                      <div className="space-y-0.5 text-[8px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            Validated
                          </span>
                          <span className="font-semibold text-slate-200">76%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-400" />
                            Needs Review
                          </span>
                          <span className="font-semibold text-slate-200">18%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-rose-400" />
                            Invalid
                          </span>
                          <span className="font-semibold text-slate-200">6%</span>
                        </div>
                      </div>

                      <div className="pt-1 text-right">
                        <Link
                          to="/analytics"
                          className="text-[8px] text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-0.5"
                        >
                          View full analytics →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* BOTTOM FEATURE CARDS (5 PILLARS - Fixed bottom in single viewport) */}
      <footer className="shrink-0 max-w-[1550px] w-full mx-auto px-6 lg:px-10 pb-3 pt-1">
        <div className="grid grid-cols-5 gap-3">
          {/* Card 1 */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-[#070f23]/75 backdrop-blur-xl border border-blue-500/15 hover:border-cyan-400/40 hover:bg-[#0a1532]/85 transition-all group flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-all">
              <Database size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                Multi-Source Intelligence
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                Aggregate data from catalogs, websites, PDFs, and more.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-[#070f23]/75 backdrop-blur-xl border border-blue-500/15 hover:border-cyan-400/40 hover:bg-[#0a1532]/85 transition-all group flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-all">
              <Brain size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                AI-Powered Enrichment
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                Extract, normalize, and enrich attributes with high accuracy.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-[#070f23]/75 backdrop-blur-xl border border-blue-500/15 hover:border-cyan-400/40 hover:bg-[#0a1532]/85 transition-all group flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-all">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                Evidence You Can Trust
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                Every attribute is backed by verifiable source evidence.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-[#070f23]/75 backdrop-blur-xl border border-blue-500/15 hover:border-cyan-400/40 hover:bg-[#0a1532]/85 transition-all group flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-all">
              <UserCheck size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                Human-in-the-Loop
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                Review, correct, and validate with confidence.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-[#070f23]/75 backdrop-blur-xl border border-blue-500/15 hover:border-cyan-400/40 hover:bg-[#0a1532]/85 transition-all group flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-all">
              <Boxes size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                Commerce-Ready Output
              </h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                Deliver clean, structured data in your required format.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* REQUEST DEMO MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#081024] border border-blue-500/30 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(37,99,235,0.3)] text-white"
            >
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {demoSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Demo Requested!</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Thank you! Our AI catalog intelligence team will contact you within 24 hours with a custom sandbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-[10px] font-semibold">
                      <Sparkles size={11} />
                      CUSTOM ENTERPRISE EVALUATION
                    </div>
                    <h3 className="text-xl font-bold text-white">Request a ProEnrich AI Demo</h3>
                    <p className="text-[11px] text-slate-400">
                      See how our pipeline enriches 10,000+ SKUs with 96%+ verifiable accuracy.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={demoForm.name}
                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                        placeholder="e.g. Alex Mercer"
                        className="w-full bg-[#050b18] border border-blue-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Work Email</label>
                      <input
                        type="email"
                        required
                        value={demoForm.email}
                        onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                        placeholder="alex@enterprise-distributor.com"
                        className="w-full bg-[#050b18] border border-blue-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        required
                        value={demoForm.company}
                        onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                        placeholder="e.g. Apex Industrial Supply"
                        className="w-full bg-[#050b18] border border-blue-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Estimated Catalog Size</label>
                      <select
                        value={demoForm.catalogSize}
                        onChange={(e) => setDemoForm({ ...demoForm, catalogSize: e.target.value })}
                        className="w-full bg-[#050b18] border border-blue-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
                      >
                        <option>1,000 - 10,000 SKUs</option>
                        <option>10,000 - 50,000 SKUs</option>
                        <option>50,000 - 250,000 SKUs</option>
                        <option>250,000+ Enterprise SKUs</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-1.5 mt-3"
                  >
                    <span>Confirm Demo Schedule</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPLORE PLATFORM INTERACTIVE MODAL */}
      <AnimatePresence>
        {isPlatformVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#081024] border border-blue-500/30 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(37,99,235,0.3)] text-white space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ProEnrichLogo className="w-4 h-4" />
                  <span className="font-bold text-xs">ProEnrich AI Interactive Overview</span>
                </div>
                <button
                  onClick={() => setIsPlatformVideoOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive Showcase Preview */}
              <div className="rounded-2xl bg-[#040916] border border-blue-500/20 p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2 z-10">
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                    Full AI Pipeline Active
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    Automated Ingestion → Neural Attribute Extraction → Verifiable Output
                  </h4>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Watch the ProEnrich AI engine ingest PDFs, manufacturer spec sheets, and CAD metadata to output 252
                    standardized commerce fields with confidence scoring.
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10 pt-4">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsPlatformVideoOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all flex items-center gap-1.5"
                  >
                    <span>Launch Live App</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link
                    to="/ingest"
                    onClick={() => setIsPlatformVideoOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Test Ingest Workflow
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
