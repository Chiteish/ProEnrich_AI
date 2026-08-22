/**
 * Mock Review Data
 */
import type { ReviewItem } from '../types';

export const mockReviewItems: ReviewItem[] = [
  {
    id: 'review-1',
    productId: 'prod-001',
    productName: 'Diablo Sanding Belt',
    attribute: 'Finish',
    aiPrediction: 'Aluminum Oxide',
    confidence: 87,
    evidence: 'Manufacturer website mentions oxide abrasive',
    status: 'pending',
  },
  {
    id: 'review-2',
    productId: 'prod-004',
    productName: 'DeWalt Drill Kit',
    attribute: 'Voltage',
    aiPrediction: '20V',
    confidence: 61,
    evidence: 'Found in product listing on retailer website',
    status: 'pending',
    correctedValue: '20V (Correct)',
  },
  {
    id: 'review-3',
    productId: 'prod-008',
    productName: 'Electrical Connector',
    attribute: 'Pin Count',
    aiPrediction: '25',
    confidence: 78,
    evidence: 'Model number indicates 25 pin configuration',
    status: 'pending',
  },
  {
    id: 'review-4',
    productId: 'prod-006',
    productName: 'HSS Drill Bit',
    attribute: 'Material',
    aiPrediction: 'High Speed Steel',
    confidence: 95,
    evidence: 'Product designation explicitly states HSS',
    status: 'approved',
  },
  {
    id: 'review-5',
    productId: 'prod-002',
    productName: 'Ball Valve',
    attribute: 'Pressure Rating',
    aiPrediction: '300 PSI',
    confidence: 91,
    evidence: 'Manufacturer datasheet page 2',
    status: 'approved',
  },
];

export const mockReviewStats = {
  totalPending: 47,
  totalApproved: 156,
  totalRejected: 3,
  pendingByProduct: 5,
};
