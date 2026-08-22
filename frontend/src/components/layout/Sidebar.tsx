/**
 * Sidebar Component - Cyber Dark Aesthetic
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Layers,
  Database,
  Package,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  FileCheck2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProEnrichLogo = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
    <circle cx="16" cy="16" r="3" fill="#38BDF8" />
  </svg>
);

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: Layers },
  { label: 'Ingest', path: '/ingest', icon: Database },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Processing', path: '/processing', icon: Cpu },
  { label: 'Review', path: '/review', icon: ShieldCheck },
  { label: 'Sources', path: '/sources', icon: FileSpreadsheet },
  { label: 'Analytics', path: '/analytics', icon: Activity },
  { label: 'Output', path: '/output', icon: FileCheck2 },
  { label: 'Settings', path: '/settings', icon: SlidersHorizontal },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.25 }}
      className="fixed left-0 top-0 h-screen bg-[#060c1d]/95 backdrop-blur-2xl border-r border-blue-500/15 z-40 flex flex-col justify-between"
    >
      {/* Top Brand Area */}
      <div className="h-20 px-4 flex items-center justify-between border-b border-blue-500/15">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ProEnrichLogo className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-black tracking-wider text-white">
                PROENRICH <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5">Product Intelligence</span>
            </div>
          )}
        </Link>
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-medium'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={18} className={active ? 'text-cyan-400' : 'text-slate-400'} />
              {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-blue-500/15">
        <div className={`text-center ${isCollapsed ? 'text-[10px]' : 'text-xs text-slate-400'}`}>
          {!isCollapsed && <p className="font-semibold text-slate-300">ProEnrich AI v2.4</p>}
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Online
          </span>
        </div>
      </div>
    </motion.aside>
  );
};
