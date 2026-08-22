/**
 * ProEnrich AI - TypeScript Types and Interfaces
 */

export interface Product {
  id: string;
  mfrPartNum: string;
  description: string;
  manufacturer: string;
  brand: string;
  department: string;
  class: string;
  fine: string;
  completeness: number;
  confidence: number;
  status: 'draft' | 'processing' | 'review' | 'validated' | 'commerce-ready' | 'failed';
  inputFields: number;
  outputFields: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attribute: string;
  value: string;
  uom: string;
  confidence: number;
  source: string;
  status: 'validated' | 'needs_review' | 'rejected';
  evidence?: string;
}

export interface Evidence {
  id: string;
  productId: string;
  attributeId: string;
  attribute: string;
  value: string;
  confidence: number;
  source: string;
  sourceType: 'datasheet' | 'website' | 'catalog' | 'technical_doc' | 'other';
  sourceReliability: 'high' | 'medium' | 'low';
  page?: number;
  evidence: string;
  url?: string;
}

export interface Source {
  id: string;
  name: string;
  type: string;
  relevance: number;
  reliability: 'high' | 'medium' | 'low';
  url?: string;
  attributesSupported: number;
  evidenceCount: number;
}

export interface OntologyNode {
  id: string;
  name: string;
  type: string;
  canonicalId: string;
  mappedValues: string[];
  parentId?: string;
}

export interface OntologyEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface ValidationResult {
  id: string;
  productId: string;
  attribute: string;
  status: 'valid' | 'needs_review' | 'invalid';
  reason?: string;
  suggestedValue?: string;
  validationType: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  attribute: string;
  aiPrediction: string;
  confidence: number;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected';
  correctedValue?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'completed' | 'processing' | 'waiting' | 'needs_review' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessingJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalProducts: number;
  processedProducts: number;
  stages: PipelineStage[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface AnalyticsData {
  completenessBefore: number;
  completenessAfter: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  validationDistribution: {
    validated: number;
    needsReview: number;
    failed: number;
  };
  sourceDistribution: {
    [key: string]: number;
  };
  pipelinePerformance: {
    stage: string;
    duration: number;
    success: number;
  }[];
}

export interface OutputRecord {
  [key: string]: string | number | boolean | null;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  rows: number;
  inputFields: number;
  status: string;
  preview: Product[];
}

export interface DashboardKPI {
  label: string;
  value: number;
  trend: number;
  icon: string;
  unit?: string;
}

export interface ActivityLog {
  id: string;
  icon: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Settings {
  humanReviewThreshold: number;
  confidenceMinimum: number;
  notificationsEnabled: boolean;
  exportFormat: 'csv' | 'json';
}
