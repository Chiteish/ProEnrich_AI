/**
 * Output Page - Clean Dark Cyber Aesthetic
 */
import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { mockOutputRecords, mockOutputStats } from '../mock/output';
import { productService } from '../services/productService';
import { useMockData } from '../lib/api';
import type { Product } from '../types';
import {
  Download,
  FileCheck2,
  Boxes,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  SlidersHorizontal,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Output: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeConfidence: true,
    includeEvidence: true,
    includeValidation: false,
  });

  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    const fetchPreviewProducts = async () => {
      try {
        const activeJobId = localStorage.getItem('activeJobId') || undefined;
        const data = await productService.getProducts({ jobId: activeJobId });
        console.log('[DEBUG Output] Number of products received:', data.length);
        if (data.length > 0) {
          console.log('[DEBUG Output] First product keys:', Object.keys(data[0]));
        }
        setPreviewProducts(data);
      } catch (err) {
        console.error('Failed to load products for preview:', err);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreviewProducts();
  }, []);

  const buildDeliveryColumns = () => {
    const cols = [
      "MFR URL", "Ref URL 1", "Ref URL 2", "Ref URL 3", "Ref URL 4", "Ref URL 5", "PART_NUMBER", "Dept", "Class", "Fine", "SKU - MY_PART_NUMBER", "Mfg_Part_Num", "Part_Desc", "E1_Brand", "Unilog_Brand", "DIB_Brand", "Part_Manuf", "MANUFACTURER_NAME", "BRAND_NAME", "TRADE_NAME", "MANUFACTURER_PART_NUMBER", "ALTERNATE_PART_NUMBER", "Classpath", "MOBILE_DESC", "INVOICE_DESC", "SHORT_DESC", "LONG_DESC1", "RETAIL_DESC", "MARKETING_DESCRIPTION", "ITEM_FEATURES_1", "ITEM_FEATURES_2", "ITEM_FEATURES_3", "ITEM_FEATURES_4", "ITEM_FEATURES_5", "ITEM_FEATURES_6", "ITEM_FEATURES_7", "ITEM_FEATURES_8", "ITEM_FEATURES_9", "ITEM_FEATURES_10", "ITEM_FEATURES_11", "ITEM_FEATURES_12", "ITEM_FEATURES_13", "ITEM_FEATURES_14", "ITEM_FEATURES_15", "ITEM_FEATURES_16", "ITEM_FEATURES_17", "ITEM_FEATURES_18", "ITEM_FEATURES_19", "ITEM_FEATURES_20", "With", "Standard/Approvals", "Prop 65", "Application", "Includes", "Product Name"
    ];
    for (let i = 1; i <= 50; i++) {
      cols.push(`ATTRIBUTE_LABEL ${i}`);
      cols.push(`ATTRIBUTE_VALUE ${i}`);
      cols.push(`ATTRIBUTE_UOM ${i}`);
    }
    const trailingCols = [
      "UPC", "EAN", "GTIN", "UNSPSC", "Warranty", "List Price", "Selling Qty", "Selling UOM", "Standard Packaging Information", "LENGTH", "LENGTH_UOM", "HEIGHT", "HEIGHT_UOM", "WIDTH", "WIDTH_UOM", "WEIGHT", "WEIGHT_UOM", "VOLUME", "VOLUME_UOM", "Product Image", "Alternate Image 1", "Alternate Image 2", "Alternate Image 3", "Alternate Image 4", "SDS", "SDS_1", "Warranty Information", "Catalog", "Specification Sheet", "Instruction/Installation Manual", "Service Manual", "Owners/User Manual", "Line Drawing", "MTR", "RoHS", "Full Engineering Drawing", "Energy Star Guide", "Technical Bulletin", "Submittal", "Compatibility Chart", "Size Chart", "Product Label/Insert", "Video Link", "Video Link 1", "Country Of Origin", "Discontinued", "Actual Image (Yes/No)"
    ];
    return cols.concat(trailingCols);
  };

  const formatProductToDeliveryMap = (prod: any) => {
    const map: Record<string, string> = {};
    const deliveryCols = buildDeliveryColumns();
    deliveryCols.forEach(col => {
      map[col] = "";
    });

    const web = prod.web_discovery || {};
    const ai = prod.aiResult || {};
    const attrs = prod.structured_attributes || {};
    const assets = prod.assets || {};

    map["MFR URL"] = web.mfr_url || "";
    if (Array.isArray(web.ref_urls)) {
      for (let i = 0; i < 5; i++) {
        if (web.ref_urls[i]) {
          map[`Ref URL ${i + 1}`] = web.ref_urls[i];
        }
      }
    }

    map["PART_NUMBER"] = prod.mpn || "";
    map["Dept"] = prod.department || "";
    map["Class"] = prod.class || "";
    map["Fine"] = prod.fine || "";
    map["SKU - MY_PART_NUMBER"] = "";
    map["Mfg_Part_Num"] = prod.mpn || "";
    map["Part_Desc"] = prod.part_desc || prod.description || "";
    map["E1_Brand"] = prod.e1_brand || "";
    map["Unilog_Brand"] = prod.unilog_brand || "";
    map["DIB_Brand"] = prod.dib_brand || "";
    map["Part_Manuf"] = prod.part_manuf || "";
    const cleanBrandName = (brand: string) => {
      if (!brand) return "";
      const b = brand.toLowerCase().trim();
      if (
        b.includes("unbranded") || 
        b.includes("no brand") || 
        b.includes("no unilog brand") || 
        b.includes("no dib brand") || 
        b.startsWith("--") || 
        b.endsWith("--")
      ) {
        return "";
      }
      return brand;
    };

    const cleanManufacturerName = (mfr: string) => {
      if (!mfr) return "";
      const m = mfr.toLowerCase().trim();
      if (
        m.includes("no manufacturer") || 
        m.startsWith("--") || 
        m.endsWith("--")
      ) {
        return "";
      }
      return mfr;
    };

    const stripParenthetical = (str: string) => {
      return str.replace(/\s*\([^)]*\)\s*$/, "").trim();
    };

    let brandVal = "";
    if (ai.identity?.brand?.canonical_value) {
      brandVal = ai.identity.brand.canonical_value;
    } else {
      const rawBrand = prod.e1_brand || prod.unilog_brand || prod.dib_brand || "";
      if (rawBrand && !rawBrand.toLowerCase().includes("unbranded") && !rawBrand.toLowerCase().includes("no brand") && !rawBrand.startsWith("--")) {
        brandVal = rawBrand;
      }
    }

    let mfrVal = "";
    if (ai.identity?.manufacturer?.canonical_value) {
      mfrVal = ai.identity.manufacturer.canonical_value;
    } else {
      mfrVal = prod.part_manuf || prod.manufacturer || "";
    }

    map["MANUFACTURER_NAME"] = cleanManufacturerName(stripParenthetical(mfrVal));
    map["BRAND_NAME"] = cleanBrandName(brandVal);
    map["TRADE_NAME"] = ai.identity?.trade_name || "";
    map["MANUFACTURER_PART_NUMBER"] = prod.mpn || "";
    map["ALTERNATE_PART_NUMBER"] = ai.identity?.alternate_part_number || "";
    map["Classpath"] = ai.classification?.classpath || "";
    map["MOBILE_DESC"] = ai.descriptions?.mobile || "";
    map["INVOICE_DESC"] = ai.descriptions?.invoice || "";
    map["SHORT_DESC"] = ai.descriptions?.short || "";
    map["LONG_DESC1"] = ai.descriptions?.long || "";
    map["RETAIL_DESC"] = ai.descriptions?.retail || "";
    map["MARKETING_DESCRIPTION"] = ai.descriptions?.marketing || "";

    if (Array.isArray(ai.features)) {
      for (let i = 0; i < 20; i++) {
        if (ai.features[i]) {
          map[`ITEM_FEATURES_${i + 1}`] = ai.features[i];
        }
      }
    }

    map["With"] = ai.specifications?.with || "";
    map["Standard/Approvals"] = ai.specifications?.standards || "";
    map["Prop 65"] = ai.specifications?.prop65 || "";
    map["Application"] = ai.specifications?.application || "";
    map["Includes"] = ai.specifications?.includes || "";
    map["Product Name"] = ai.understanding?.product_type || attrs.PRODUCT_TYPE || attrs.PRODUCT_NAME || "";

    const attrsList: Array<{label: string, value: string, uom: string}> = [];
    if (ai && Array.isArray(ai.attributes)) {
      ai.attributes.forEach((attr: any) => {
        attrsList.push({
          label: attr.label || "",
          value: String(attr.value !== undefined ? attr.value : ""),
          uom: attr.uom || ""
        });
      });
    } else {
      Object.entries(attrs).forEach(([label, value]) => {
        if (value !== null && value !== undefined && !["LENGTH", "LENGTH_UOM", "HEIGHT", "HEIGHT_UOM", "WIDTH", "WIDTH_UOM", "WEIGHT", "WEIGHT_UOM", "VOLUME", "VOLUME_UOM", "UPC", "EAN", "GTIN", "UNSPSC"].includes(label)) {
          attrsList.push({
            label,
            value: String(value),
            uom: ""
          });
        }
      });
    }

    for (let i = 0; i < 50; i++) {
      if (attrsList[i]) {
        map[`ATTRIBUTE_LABEL ${i + 1}`] = attrsList[i].label;
        map[`ATTRIBUTE_VALUE ${i + 1}`] = attrsList[i].value;
        map[`ATTRIBUTE_UOM ${i + 1}`] = attrsList[i].uom;
      }
    }

    map["UPC"] = attrs.UPC || attrs.upc || "";
    map["EAN"] = attrs.EAN || attrs.ean || "";
    map["GTIN"] = attrs.GTIN || attrs.gtin || "";
    map["UNSPSC"] = attrs.UNSPSC || attrs.unspsc || "";
    map["Warranty"] = attrs.WARRANTY || attrs.warranty || "";
    map["List Price"] = attrs.LIST_PRICE || attrs.list_price || "";
    map["Selling Qty"] = attrs.SELLING_QTY || attrs.selling_qty || (ai.understanding?.quantity !== undefined && ai.understanding.quantity !== null ? String(ai.understanding.quantity) : "") || "";
    map["Selling UOM"] = attrs.SELLING_UOM || attrs.selling_uom || "";
    map["Standard Packaging Information"] = attrs.PACKAGING || attrs.packaging || "";
    map["LENGTH"] = attrs.LENGTH || attrs.length || "";
    map["LENGTH_UOM"] = attrs.LENGTH_UOM || attrs.length_uom || "";
    map["HEIGHT"] = attrs.HEIGHT || attrs.height || "";
    map["HEIGHT_UOM"] = attrs.HEIGHT_UOM || attrs.height_uom || "";
    map["WIDTH"] = attrs.WIDTH || attrs.width || "";
    map["WIDTH_UOM"] = attrs.WIDTH_UOM || attrs.width_uom || "";
    map["WEIGHT"] = attrs.WEIGHT || attrs.weight || "";
    map["WEIGHT_UOM"] = attrs.WEIGHT_UOM || attrs.weight_uom || "";
    map["VOLUME"] = attrs.VOLUME || attrs.volume || "";
    map["VOLUME_UOM"] = attrs.VOLUME_UOM || attrs.volume_uom || "";

    const getAssetUrl = (assetField: any) => {
      if (!assetField) return "";
      return assetField.url || assetField.external_url || "";
    };

    map["Product Image"] = getAssetUrl(assets.product_image) || web.product_image || "";
    if (Array.isArray(assets.alternate_images)) {
      for (let i = 0; i < 4; i++) {
        if (assets.alternate_images[i]) {
          map[`Alternate Image ${i + 1}`] = assets.alternate_images[i].url || assets.alternate_images[i].external_url || "";
        } else if (web.alternate_images?.[i]) {
          map[`Alternate Image ${i + 1}`] = web.alternate_images[i];
        }
      }
    }

    map["SDS"] = getAssetUrl(assets.sds) || web.sds || "";
    map["SDS_1"] = getAssetUrl(assets.sds_1) || web.sds_1 || "";
    map["Warranty Information"] = getAssetUrl(assets.warranty_information) || web.warranty_information || "";
    map["Catalog"] = getAssetUrl(assets.catalog) || web.catalog || "";
    map["Specification Sheet"] = getAssetUrl(assets.specification_sheet) || web.specification_sheet || "";
    map["Instruction/Installation Manual"] = getAssetUrl(assets.instruction_installation_manual || assets.manual) || web.manual || "";
    map["Service Manual"] = getAssetUrl(assets.service_manual) || web.service_manual || "";
    map["Owners/User Manual"] = getAssetUrl(assets.owners_manual) || web.owners_manual || "";
    map["Line Drawing"] = getAssetUrl(assets.line_drawing) || web.line_drawing || "";
    map["MTR"] = getAssetUrl(assets.mtr) || web.mtr || "";
    map["RoHS"] = getAssetUrl(assets.rohs) || web.rohs || "";
    map["Full Engineering Drawing"] = getAssetUrl(assets.full_engineering_drawing) || web.full_engineering_drawing || "";
    map["Energy Star Guide"] = getAssetUrl(assets.energy_star_guide) || web.energy_star_guide || "";
    map["Technical Bulletin"] = getAssetUrl(assets.technical_bulletin) || web.technical_bulletin || "";
    map["Submittal"] = getAssetUrl(assets.submittal) || web.submittal || "";
    map["Compatibility Chart"] = getAssetUrl(assets.compatibility_chart) || web.compatibility_chart || "";
    map["Size Chart"] = getAssetUrl(assets.size_chart) || web.size_chart || "";
    map["Product Label/Insert"] = getAssetUrl(assets.product_label_insert) || web.product_label_insert || "";

    if (Array.isArray(web.video_links)) {
      map["Video Link"] = web.video_links[0] || "";
      map["Video Link 1"] = web.video_links[1] || "";
    }

    map["Country Of Origin"] = attrs.COUNTRY_OF_ORIGIN || attrs.country_of_origin || "";
    map["Discontinued"] = attrs.DISCONTINUED || attrs.discontinued || "";
    map["Actual Image (Yes/No)"] = assets.product_image?.available ? "Yes" : "No";

    return map;
  };

  const getPreviewValue = (product: any, col: string) => {
    if (col === 'COMPLETENESS') {
      return product.completeness !== undefined && product.status !== 'draft' ? `${product.completeness}%` : '0%';
    }
    if (col === 'CONFIDENCE') {
      return product.confidence !== undefined && product.status !== 'draft' ? `${product.confidence}%` : '0%';
    }
    const map = formatProductToDeliveryMap(product);
    return map[col] || '—';
  };

  const handleExport = async () => {
    try {
      const activeJobId = localStorage.getItem('activeJobId') || undefined;
      const products = await productService.getProducts({ jobId: activeJobId });

      if (selectedFormat === 'JSON') {
        const records = products.map((prod: any) => {
          return formatProductToDeliveryMap(prod);
        });

        const jsonString = JSON.stringify(records, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `catalog_export_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const deliveryCols = buildDeliveryColumns();
        const csvRows = [deliveryCols.join(',')];
        
        products.forEach((prod: any) => {
          const map = formatProductToDeliveryMap(prod);
          const rowData = deliveryCols.map(col => {
            const val = map[col] !== null && map[col] !== undefined ? String(map[col]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          });
          csvRows.push(rowData.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `catalog_export_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setShowExportModal(false);
      }, 1500);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message || err}`);
    }
  };

  const columnNames = [
    'PART_NUMBER',
    'Dept',
    'Class',
    'Fine',
    'Mfg_Part_Num',
    'Part_Desc',
    'MANUFACTURER_NAME',
    'BRAND_NAME',
    'COMPLETENESS',
    'CONFIDENCE',
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <FileCheck2 size={14} />
            <span>COMMERCE SYNDICATION & EXPORT</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Commerce-Ready Output
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export 252-field standardized product intelligence for ERPs, PIMs, and e-commerce distributor marketplaces.
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download size={16} />
          <span>Export 252-Field Catalog</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Output Products', value: (previewProducts.length > 0 ? previewProducts.length : mockOutputStats.totalProducts).toLocaleString(), unit: 'SKUs', color: 'text-white' },
          { label: 'Standardized Attributes', value: '252', unit: 'Fields Mapped', color: 'text-cyan-400' },
          { label: 'Validated Quality Rate', value: `${previewProducts.length > 0 ? Math.round((previewProducts.filter(p => p.status === 'validated' || p.status === 'commerce-ready').length / previewProducts.length) * 100) : mockOutputStats.validated}%`, unit: 'Confidence Score', color: 'text-emerald-400' },
          { label: 'Pending Human Review', value: `${previewProducts.length > 0 ? Math.round((previewProducts.filter(p => p.status === 'review' || p.status === 'draft').length / previewProducts.length) * 100) : mockOutputStats.needsReview}%`, unit: 'Non-Blocking', color: 'text-amber-400' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between"
          >
            <span className="text-[11px] font-semibold text-slate-400 leading-tight">{stat.label}</span>
            <div className="mt-2">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{stat.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Preview Table + Export Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Preview Table (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-[#081126]/95 backdrop-blur-2xl border border-blue-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-cyan-400" />
                <span>Export Dataset Preview</span>
              </h3>
              <span className="text-xs text-slate-400">Showing 252-field standardized schema</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#040916] text-slate-400 border-b border-slate-800">
                    {columnNames.map((col) => (
                      <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingPreview ? (
                    <tr>
                      <td colSpan={columnNames.length} className="py-8 text-center text-slate-400">
                        Loading preview records...
                      </td>
                    </tr>
                  ) : previewProducts.length === 0 ? (
                    <tr>
                      <td colSpan={columnNames.length} className="py-8 text-center text-slate-400">
                        No processed products found in catalog.
                      </td>
                    </tr>
                  ) : (
                    previewProducts.slice(0, 10).map((record: any, idx: number) => (
                      <tr key={idx} className="hover:bg-blue-600/10 transition-colors">
                        {columnNames.map((col) => (
                          <td key={col} className="py-2.5 px-3 text-slate-200 whitespace-nowrap font-mono text-[11px]">
                            {getPreviewValue(record, col)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Export Formats & Syndication (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#081126]/90 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.4)] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes size={16} className="text-cyan-400" />
              <span>Syndication Targets</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'CSV / XLSX Format', desc: 'Standard distributor & spreadsheet ingest' },
                { name: 'JSON Schema (ETIM 8.0)', desc: 'Rest API & headless catalog feeds' },
                { name: 'UNSPSC Classification', desc: 'Enterprise procurement taxonomy' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#040916] border border-blue-500/10 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Download size={15} />
              <span>Generate Catalog Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#081024] border border-blue-500/30 rounded-3xl p-7 max-w-md w-full text-white shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(37,99,235,0.3)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download size={18} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Export Commerce Catalog</h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {exportSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Catalog Downloaded!</h4>
                  <p className="text-xs text-slate-300">
                    Exported {mockOutputStats.totalProducts.toLocaleString()} products in 252-field {selectedFormat} format.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Format</label>
                    <div className="flex gap-2">
                      {['CSV', 'JSON'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFormat(fmt as 'CSV' | 'JSON')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedFormat === fmt
                              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                              : 'bg-[#040916] text-slate-400 border border-blue-500/20 hover:border-slate-600'
                          }`}
                        >
                          {fmt} Format
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-300">Export Parameters</label>
                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'includeConfidence', label: 'Include confidence score metrics' },
                        { id: 'includeEvidence', label: 'Include evidence citation URLs' },
                        { id: 'includeValidation', label: 'Include UNSPSC / ETIM metadata' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions[opt.id as keyof typeof exportOptions]}
                            onChange={(e) =>
                              setExportOptions({ ...exportOptions, [opt.id]: e.target.checked })
                            }
                            className="rounded border-slate-700 bg-slate-800 text-blue-600"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download {selectedFormat}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};
