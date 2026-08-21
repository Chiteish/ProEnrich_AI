/**
 * Settings Page - Clean Dark Cyber Aesthetic
 */
import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import {
  SlidersHorizontal,
  Save,
  User,
  Cpu,
  Bell,
  Key,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SettingsTab = 'profile' | 'processing' | 'notifications' | 'api';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState({
    humanReviewThreshold: 80,
    confidenceMinimum: 60,
    notificationsEnabled: true,
    autoApproveExact: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { label: string; value: SettingsTab; icon: any }[] = [
    { label: 'Profile & Account', value: 'profile', icon: User },
    { label: 'AI Inference Rules', value: 'processing', icon: Cpu },
    { label: 'Alerts & Webhooks', value: 'notifications', icon: Bell },
    { label: 'API & Keys', value: 'api', icon: Key },
  ];

  return (
    <MainLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-sm font-semibold shadow-[0_0_30px_rgba(56,189,248,0.3)] flex items-center gap-2.5 backdrop-blur-xl"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <SlidersHorizontal size={14} />
            <span>PLATFORM CONFIGURATION</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            System & Organization Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure threshold tolerances, taxonomy mappings, developer API keys, and notification triggers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Nav (col-span-3) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="p-3 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon size={15} className={isSelected ? 'text-cyan-300' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area (col-span-9) */}
        <div className="lg:col-span-9">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-6"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">User & Organization Profile</h3>
                  <p className="text-xs text-slate-400">Manage account details and active catalog authority roles.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Alex Mercer"
                      className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Work Email</label>
                    <input
                      type="email"
                      defaultValue="alex@enterprise-distributor.com"
                      className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Organization / Enterprise</label>
                    <input
                      type="text"
                      defaultValue="Apex Industrial Supply Corp"
                      className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Role</label>
                    <select className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400">
                      <option>Catalog Administrator</option>
                      <option>Product Manager</option>
                      <option>Technical Reviewer</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={15} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Processing Tab */}
            {activeTab === 'processing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">AI Inference Thresholds</h3>
                  <p className="text-xs text-slate-400">Calibrate automatic approval and human review cutoff points.</p>
                </div>

                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-[#040916] border border-blue-500/15 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Human Review Cutoff Threshold</span>
                      <span className="font-mono font-bold text-cyan-400">&lt; {settings.humanReviewThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={settings.humanReviewThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, humanReviewThreshold: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400">
                      Attributes predicted with confidence below {settings.humanReviewThreshold}% will automatically route to the Review Queue.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040916] border border-blue-500/15 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Minimum Usable Confidence</span>
                      <span className="font-mono font-bold text-cyan-400">&gt; {settings.confidenceMinimum}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      value={settings.confidenceMinimum}
                      onChange={(e) =>
                        setSettings({ ...settings, confidenceMinimum: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400">
                      Attributes below this score require mandatory source re-querying.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={15} />
                    <span>Save Inference Rules</span>
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Notification & Alert Triggers</h3>
                  <p className="text-xs text-slate-400">Configure email and in-app event notifications.</p>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Catalog Ingestion & Schema Completed', default: true },
                    { label: 'Human Review Queue Exceeds 25 items', default: true },
                    { label: 'Validation Score Drops Below 90%', default: true },
                    { label: 'Export Download Generated', default: false },
                  ].map((notif, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#040916] border border-blue-500/10 cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.default} className="rounded border-slate-700 bg-slate-800 text-blue-600" />
                      <span className="text-slate-300 font-medium">{notif.label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={15} />
                    <span>Save Notifications</span>
                  </button>
                </div>
              </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Developer API Configuration</h3>
                  <p className="text-xs text-slate-400">Integrate ProEnrich AI into your internal ERP / PIM pipeline.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Production API Endpoint</label>
                    <input
                      type="text"
                      readOnly
                      value="https://api.proenrich.ai/v2/intelligence"
                      className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Live API Key</label>
                    <input
                      type="password"
                      readOnly
                      value="sk_live_proenrich_ai_491823908123"
                      className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={15} />
                    <span>Update API Settings</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
