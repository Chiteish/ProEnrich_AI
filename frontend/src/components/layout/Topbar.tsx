/**
 * Topbar Component - Cyber Dark Aesthetic
 */
import React, { useState } from 'react';
import { Search, Bell, LogOut, Settings, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#060c1d]/90 backdrop-blur-2xl border-b border-blue-500/15 z-30 transition-all">
      <div className="h-full px-8 flex items-center justify-between ml-[80px] lg:ml-[240px]">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search products, attributes, part numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040916] border border-blue-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-800/40 rounded-xl transition-colors text-slate-400 hover:text-white" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full"></span>
          </button>

          {/* AI Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-950/60 border border-blue-500/30 rounded-xl text-xs text-cyan-400">
            <Sparkles size={13} className="text-cyan-400 animate-pulse" />
            <span>AI Pipeline Active</span>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-white text-xs font-bold">
                AM
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">Alex Mercer</p>
                <p className="text-[10px] text-slate-400 leading-tight">Catalog Admin</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#081126] border border-blue-500/25 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 p-2">
                <div className="p-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">Alex Mercer</p>
                  <p className="text-[10px] text-slate-400">alex@enterprise-distributor.com</p>
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-blue-600/15 hover:text-cyan-400 rounded-lg transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
