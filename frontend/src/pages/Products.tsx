/**
 * Products Page - Clean Dark Cyber Aesthetic
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { productService } from '../services/productService';
import type { Product } from '../types';
import {
  Package,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    manufacturer: '',
    brand: '',
    status: '',
  });

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const search = searchParams.get('search') || '';
        const results = await productService.getProducts({
          ...filters,
          search: search || undefined,
        });
        setProducts(results);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchParams]);

  const filteredProducts = products.filter((p) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase();
    return (
      p.mfrPartNum.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const uniqueManufacturers = [...new Set(products.map((p) => p.manufacturer))];
  const uniqueBrands = [...new Set(products.map((p) => p.brand))];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Package size={14} />
            <span>252-FIELD STANDARDIZED CATALOG</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Product Intelligence Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, inspect, and syndicate enriched industrial product specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ingest"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Upload New SKUs</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filter Sidebar (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-cyan-400" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => {
                  setFilters({ manufacturer: '', brand: '', status: '' });
                  setSearchInput('');
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Reset</span>
              </button>
            </div>

            {/* Manufacturer Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Manufacturer</label>
              <select
                value={filters.manufacturer}
                onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
                className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Manufacturers ({uniqueManufacturers.length})</option>
                {uniqueManufacturers.map((mfg) => (
                  <option key={mfg} value={mfg}>
                    {mfg}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Brands ({uniqueBrands.length})</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Validation Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-[#040916] border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Statuses</option>
                <option value="validated">Validated</option>
                <option value="review">Needs Review</option>
                <option value="processing">Processing</option>
                <option value="commerce-ready">Commerce Ready</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Products Table & Search (col-span-9) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Search bar & Counts */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#081126]/90 border border-blue-500/20">
            <div className="relative w-full sm:max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by part number, title, brand..."
                className="w-full bg-[#040916] border border-blue-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <p className="text-xs text-slate-400 shrink-0">
              Showing <strong className="text-white">{paginatedProducts.length}</strong> of{' '}
              <strong className="text-cyan-400">{filteredProducts.length}</strong> products
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-[#081126]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#040916] text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold">Part Number</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Manufacturer</th>
                    <th className="py-3 px-4 font-semibold">Completeness</th>
                    <th className="py-3 px-4 font-semibold">Confidence</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="hover:bg-blue-600/10 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{product.mfrPartNum}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium max-w-[220px] truncate">
                        {product.description}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{product.manufacturer}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                              style={{ width: `${product.completeness}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-300 font-bold">
                            {product.completeness}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            product.confidence >= 80
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : product.confidence >= 60
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {product.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            product.status === 'validated' || product.status === 'commerce-ready'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : product.status === 'review'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-600/15 text-cyan-400 border border-blue-500/30'
                          }`}
                        >
                          {product.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 hover:bg-blue-600 hover:text-white transition-all mx-auto">
                          <ChevronRight size={14} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-[#040916] border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 disabled:opacity-40 disabled:hover:border-slate-700 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-slate-400">
                Page <strong className="text-white">{currentPage}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 disabled:opacity-40 disabled:hover:border-slate-700 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
