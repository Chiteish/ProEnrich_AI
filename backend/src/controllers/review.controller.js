/**
 * Review Controller
 * Stores review decisions in data/reviews.json (file-based, same pattern as products.json).
 */
const fs = require('fs');
const path = require('path');
const productModel = require('../models/product.model');

const DATA_DIR = path.resolve(__dirname, '../../data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function ensureReviewsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REVIEWS_FILE)) fs.writeFileSync(REVIEWS_FILE, '[]', 'utf-8');
}

function readReviews() {
  ensureReviewsFile();
  try {
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeReviews(reviews) {
  ensureReviewsFile();
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
}

/**
 * Build review items from enriched products + any existing stored decisions.
 * Products with status='review' and confidence < 90 generate pending items.
 */
function buildReviewItems(storedReviews) {
  const products = productModel.getAllProducts();
  const storedMap = new Map(storedReviews.map(r => [r.id, r]));
  const items = [...storedReviews]; // keep existing decisions

  // Auto-generate pending review items from products needing review
  for (const p of products) {
    if (!p.structured_attributes) continue;
    for (const [attrKey, attrVal] of Object.entries(p.structured_attributes)) {
      if (!attrVal) continue;
      const reviewId = 'rv-' + (p.mpn||p.id||'').toLowerCase() + '-' + attrKey.toLowerCase().replace(/\s+/g,'_');
      if (storedMap.has(reviewId)) continue; // already has a decision
      const confidence = p.confidence || 75;
      if (confidence >= 90) continue; // high confidence, skip
      items.push({
        id: reviewId,
        productId: p.mpn || p.id || '',
        productName: p.description || p.mpn || 'Unknown Product',
        attribute: attrKey,
        aiPrediction: String(attrVal),
        confidence: confidence,
        evidence: Array.isArray(p.retrieved_evidence) && p.retrieved_evidence.length > 0
          ? (p.retrieved_evidence[0].content || p.retrieved_evidence[0].text || 'See source evidence')
          : 'AI extracted from product data',
        status: 'pending'
      });
    }
  }
  return items;
}

const getPendingReviews = (req, res) => {
  try {
    const stored = readReviews();
    const all = buildReviewItems(stored);
    return res.json(all.filter(r => r.status === 'pending'));
  } catch (error) {
    console.error('getPendingReviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
};

const getApprovedReviews = (req, res) => {
  try {
    const stored = readReviews();
    return res.json(stored.filter(r => r.status === 'approved'));
  } catch (error) {
    console.error('getApprovedReviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch approved reviews' });
  }
};

const getRejectedReviews = (req, res) => {
  try {
    const stored = readReviews();
    return res.json(stored.filter(r => r.status === 'rejected'));
  } catch (error) {
    console.error('getRejectedReviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch rejected reviews' });
  }
};

const approveReview = (req, res) => {
  try {
    const { reviewId } = req.params;
    const stored = readReviews();
    const existing = stored.find(r => r.id === reviewId);
    if (existing) {
      existing.status = 'approved';
      writeReviews(stored);
      return res.json(existing);
    }
    // Item was auto-generated from products; materialise it
    const allItems = buildReviewItems(stored);
    const item = allItems.find(r => r.id === reviewId);
    if (!item) return res.status(404).json({ error: 'Review item not found' });
    const updated = { ...item, status: 'approved' };
    stored.push(updated);
    writeReviews(stored);
    return res.json(updated);
  } catch (error) {
    console.error('approveReview error:', error);
    return res.status(500).json({ error: 'Failed to approve review' });
  }
};

const rejectReview = (req, res) => {
  try {
    const { reviewId } = req.params;
    const stored = readReviews();
    const existing = stored.find(r => r.id === reviewId);
    if (existing) {
      existing.status = 'rejected';
      writeReviews(stored);
      return res.json(existing);
    }
    const allItems = buildReviewItems(stored);
    const item = allItems.find(r => r.id === reviewId);
    if (!item) return res.status(404).json({ error: 'Review item not found' });
    const updated = { ...item, status: 'rejected' };
    stored.push(updated);
    writeReviews(stored);
    return res.json(updated);
  } catch (error) {
    console.error('rejectReview error:', error);
    return res.status(500).json({ error: 'Failed to reject review' });
  }
};

const submitCorrection = (req, res) => {
  try {
    const { reviewId } = req.params;
    const { correctedValue } = req.body;
    const stored = readReviews();
    const existing = stored.find(r => r.id === reviewId);
    if (existing) {
      existing.status = 'approved';
      existing.correctedValue = correctedValue;
      writeReviews(stored);
      return res.json(existing);
    }
    const allItems = buildReviewItems(stored);
    const item = allItems.find(r => r.id === reviewId);
    if (!item) return res.status(404).json({ error: 'Review item not found' });
    const updated = { ...item, status: 'approved', correctedValue };
    stored.push(updated);
    writeReviews(stored);
    return res.json(updated);
  } catch (error) {
    console.error('submitCorrection error:', error);
    return res.status(500).json({ error: 'Failed to submit correction' });
  }
};

module.exports = { getPendingReviews, getApprovedReviews, getRejectedReviews, approveReview, rejectReview, submitCorrection };
