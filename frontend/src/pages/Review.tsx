/**
 * Human Review Page - High-Visibility Action Buttons & Cyber Theme
 */
import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import type { ReviewItem } from '../types';
import { reviewService } from '../services/reviewService';
import { ConfidenceBadge } from '../components/common/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Edit3,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Save,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ReviewTab = 'pending' | 'approved' | 'rejected';

export const Review: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewTab>('pending');
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewItem[]>([]);
  const [rejectedReviews, setRejectedReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [pending, approved, rejected] = await Promise.all([
          reviewService.getPendingReviews(),
          reviewService.getApprovedReviews(),
          reviewService.getRejectedReviews(),
        ]);
        setPendingReviews(pending);
        setApprovedReviews(approved);
        setRejectedReviews(rejected);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleApprove = async (reviewId: string) => {
    try {
      const item = pendingReviews.find((r) => r.id === reviewId);
      await reviewService.approveReview(reviewId);
      if (item) {
        setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setApprovedReviews((prev) => [{ ...item, status: 'approved' }, ...prev]);
        showToast(`Approved attribute "${item.attribute}" for ${item.productName}`);
      }
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const item = pendingReviews.find((r) => r.id === reviewId);
      await reviewService.rejectReview(reviewId);
      if (item) {
        setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setRejectedReviews((prev) => [{ ...item, status: 'rejected' }, ...prev]);
        showToast(`Rejected attribute "${item.attribute}" for ${item.productName}`);
      }
    } catch (error) {
      console.error('Failed to reject review:', error);
    }
  };

  const handleBatchApproveHighConfidence = () => {
    const highConfidence = pendingReviews.filter((r) => r.confidence >= 80);
    if (highConfidence.length === 0) {
      showToast('No pending items with confidence >= 80%');
      return;
    }
    setPendingReviews((prev) => prev.filter((r) => r.confidence < 80));
    setApprovedReviews((prev) => [
      ...highConfidence.map((r) => ({ ...r, status: 'approved' as const })),
      ...prev,
    ]);
    showToast(`Batch approved ${highConfidence.length} high-confidence attributes!`);
  };

  const handleSubmitCorrection = async (reviewId: string) => {
    if (!editValue.trim()) return;
    try {
      const item = pendingReviews.find((r) => r.id === reviewId);
      await reviewService.submitCorrection(reviewId, editValue);
      if (item) {
        setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setApprovedReviews((prev) => [
          { ...item, status: 'approved', correctedValue: editValue },
          ...prev,
        ]);
        showToast(`Corrected and approved "${item.attribute}" to "${editValue}"`);
      }
      setEditingReviewId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to submit correction:', error);
    }
  };

  const reviewsMap = {
    pending: pendingReviews,
    approved: approvedReviews,
    rejected: rejectedReviews,
  };

  const currentList = reviewsMap[activeTab].filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.attribute.toLowerCase().includes(q) ||
      item.aiPrediction.toLowerCase().includes(q) ||
      item.evidence.toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-sm font-semibold shadow-[0_0_30px_rgba(56,189,248,0.3)] flex items-center gap-2.5 backdrop-blur-xl"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <ShieldCheck size={14} />
            <span>HUMAN-IN-THE-LOOP VERIFICATION</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Human Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and calibrate AI-extracted product attributes backed by verifiable source evidence.
          </p>
        </div>

        {/* Quick Batch Actions */}
        {pendingReviews.length > 0 && (
          <button
            onClick={handleBatchApproveHighConfidence}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Approve All High Confidence (&ge;80%)</span>
          </button>
        )}
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Pending Card */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#0b1632] border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-[#070f23]/80 border-blue-500/15 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Needs Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">{pendingReviews.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Attributes awaiting validation</p>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setActiveTab('approved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-[#0b1632] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              : 'bg-[#070f23]/80 border-blue-500/15 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{approvedReviews.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for commerce output</p>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setActiveTab('rejected')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-[#0b1632] border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
              : 'bg-[#070f23]/80 border-blue-500/15 hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 mt-2">{rejectedReviews.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Flagged / discarded items</p>
        </div>
      </div>

      {/* Tabs & Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-500/15">
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as ReviewTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            const count = reviewsMap[tab].length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                    : 'bg-[#070f23]/80 text-slate-400 hover:text-white border border-blue-500/15'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter / Search Input */}
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search product, attribute, evidence..."
            className="w-full bg-[#040916] border border-blue-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Review Item Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#070f23]/60 rounded-2xl animate-pulse border border-blue-500/10" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((review) => {
            const isEditing = editingReviewId === review.id;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#081126]/90 backdrop-blur-2xl border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all space-y-4"
              >
                {/* 5 Column Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-12 gap-4 items-start">
                  {/* Product */}
                  <div className="sm:col-span-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Product</p>
                    <p className="font-bold text-white text-sm sm:text-base">{review.productName}</p>
                    <span className="text-[10px] font-mono text-cyan-400">ID: {review.productId}</span>
                  </div>

                  {/* Attribute */}
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Attribute</p>
                    <p className="font-bold text-white text-sm sm:text-base">{review.attribute}</p>
                  </div>

                  {/* AI Prediction */}
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">AI Prediction</p>
                    <p className="font-bold text-cyan-400 text-sm sm:text-base">{review.aiPrediction}</p>
                  </div>

                  {/* Confidence */}
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          review.confidence >= 80
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : review.confidence >= 60
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {review.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Evidence</p>
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-[#040916]/60 p-2 rounded-lg border border-blue-500/10">
                      &ldquo;{review.evidence}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Inline Editing Form */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-[#040916] border border-cyan-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Edit3 size={13} />
                        Edit Attribute Value for &ldquo;{review.attribute}&rdquo;
                      </span>
                      <span className="text-[11px] text-slate-400">Original: {review.aiPrediction}</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter verified correct value..."
                        className="flex-1 bg-[#081126] border border-cyan-500/40 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-300"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSubmitCorrection(review.id)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Save & Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingReviewId(null);
                          setEditValue('');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* HIGH-VISIBILITY ACTION BUTTONS (Separately visible & distinct) */}
                {activeTab === 'pending' && !isEditing && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Status: <span className="text-amber-400 font-semibold">Pending Review</span>
                    </span>

                    {/* 3 Distinct Action Buttons */}
                    <div className="flex items-center gap-3">
                      {/* 1. APPROVE BUTTON (Vibrant Emerald Green) */}
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] border border-emerald-400/50 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Check size={15} className="stroke-[2.5]" />
                        <span>Approve</span>
                      </button>

                      {/* 2. EDIT BUTTON (Vibrant Blue/Cyan) */}
                      <button
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setEditValue(review.aiPrediction);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-blue-600/25 hover:bg-blue-600/40 hover:text-white shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-cyan-400/50 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>

                      {/* 3. REJECT BUTTON (Vibrant Rose Red) */}
                      <button
                        onClick={() => handleReject(review.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/35 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-500/50 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <X size={15} className="stroke-[2.5]" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved Tag Detail */}
                {activeTab === 'approved' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} />
                      Validated & Approved for Commerce Syndication
                    </span>
                    {review.correctedValue && (
                      <span className="text-slate-400">
                        Corrected to: <strong className="text-cyan-300">{review.correctedValue}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Rejected Tag Detail */}
                {activeTab === 'rejected' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                      <XCircle size={15} />
                      Excluded from Commerce Catalog
                    </span>
                    <button
                      onClick={() => {
                        setRejectedReviews((prev) => prev.filter((r) => r.id !== review.id));
                        setPendingReviews((prev) => [{ ...review, status: 'pending' }, ...prev]);
                        showToast(`Restored "${review.attribute}" to Pending queue`);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Reopen for Review</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {currentList.length === 0 && (
            <div className="text-center py-16 bg-[#070f23]/60 rounded-3xl border border-blue-500/15">
              <ShieldCheck size={40} className="text-cyan-400/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No {activeTab} attributes found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {activeTab === 'pending'
                  ? 'All pending attributes have been reviewed! Head over to the output page to generate exports.'
                  : `There are currently no items in the ${activeTab} queue.`}
              </p>
              {activeTab === 'pending' && (
                <Link
                  to="/output"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                >
                  <span>Go to Output Syndication</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};
