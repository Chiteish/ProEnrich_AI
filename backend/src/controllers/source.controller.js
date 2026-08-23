/**
 * Sources Controller
 * Derives evidence sources from enriched product data (retrieved_evidence fields).
 */
const productModel = require('../models/product.model');

const getSources = (req, res) => {
  try {
    const products = productModel.getAllProducts();
    const sourceMap = new Map();

    for (const p of products) {
      const evidence = Array.isArray(p.retrieved_evidence) ? p.retrieved_evidence : [];
      for (const ev of evidence) {
        const sourceUrl = ev.source_url || ev.url || '';
        const sourceName = ev.source_name || ev.source || ev.title || 'Evidence Source';
        const sourceType = ev.source_type || (sourceUrl.endsWith('.pdf') ? 'PDF Datasheet' : 'Web Content');
        const key = sourceUrl || sourceName;

        if (sourceMap.has(key)) {
          const existing = sourceMap.get(key);
          existing.evidenceCount += 1;
          existing.attributesSupported = Math.max(existing.attributesSupported, (p.structured_attributes ? Object.keys(p.structured_attributes).length : 0));
        } else {
          sourceMap.set(key, {
            id: 'src-' + Buffer.from(key).toString('base64').slice(0,12).replace(/[^a-zA-Z0-9]/g,''),
            name: sourceName,
            type: sourceType,
            relevance: ev.confidence !== undefined ? Math.round(ev.confidence * 100) : 85,
            reliability: (ev.confidence !== undefined && ev.confidence >= 0.8) ? 'high' : 'medium',
            url: sourceUrl || undefined,
            attributesSupported: p.structured_attributes ? Object.keys(p.structured_attributes).length : 0,
            evidenceCount: 1
          });
        }
      }

      // Also surface web_discovery sources
      const wd = p.web_discovery || {};
      for (const [siteName, siteData] of Object.entries(wd)) {
        if (!siteData || typeof siteData !== 'object') continue;
        const key = siteData.url || siteName;
        if (!sourceMap.has(key)) {
          sourceMap.set(key, {
            id: 'src-wd-' + siteName.toLowerCase().replace(/\s+/g,'-').slice(0,20),
            name: siteData.title || siteName,
            type: 'Web Content',
            relevance: 82,
            reliability: 'medium',
            url: siteData.url || undefined,
            attributesSupported: 4,
            evidenceCount: 1
          });
        }
      }
    }

    const sources = Array.from(sourceMap.values());
    return res.json(sources);
  } catch (error) {
    console.error('getSources error:', error);
    return res.status(500).json({ error: 'Failed to fetch sources' });
  }
};

module.exports = { getSources };
