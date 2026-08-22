/**
 * Login Page - Matching ProEnrich AI Theme
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { ParticleWave } from '../components/common/ParticleWave';

const ProEnrichLogo = ({ className = 'w-8 h-8' }: { className?: string }) => (
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
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@proenrich.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('authToken', 'mock-token-' + Date.now());
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex relative overflow-hidden">
      <ParticleWave />

      {/* Atmospheric Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-blue-600/15 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-cyan-500/15 blur-[140px] pointer-events-none -z-10" />

      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-blue-500/15 bg-[#060c1c]/70 backdrop-blur-2xl z-10"
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <ProEnrichLogo />
          </div>
          <div>
            <p className="text-lg font-black tracking-wider text-white">
              PROENRICH <span className="text-cyan-400">AI</span>
            </p>
            <p className="text-xs text-slate-400">Product Intelligence Redefined</p>
          </div>
        </Link>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles size={14} className="text-cyan-400" />
            ENTERPRISE CATALOG INTELLIGENCE
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Intelligent Data.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Trusted Commerce.
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Log in to manage your ingestion pipelines, review AI-enriched attributes with verifiable evidence, and
            export 252-field standardized catalogs.
          </p>

          <div className="space-y-3 pt-4">
            {[
              'Automated taxonomy classification (ETIM / UNSPSC)',
              'Evidence-backed confidence scoring on every attribute',
              'Collaborative human-in-the-loop review interface',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} ProEnrich AI. All rights reserved.
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10"
      >
        <div className="w-full max-w-md">
          <div className="bg-[#081126]/90 backdrop-blur-2xl border border-blue-500/25 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(37,99,235,0.25)]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1.5">Welcome back</h2>
              <p className="text-sm text-slate-400">Sign in to your ProEnrich AI platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#040916] border border-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#040916] border border-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-blue-600" />
                  Remember me
                </label>
                <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Demo Credentials: <span className="font-mono text-cyan-300">admin@proenrich.ai / password123</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
