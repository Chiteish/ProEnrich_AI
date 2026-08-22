/**
 * Mock Analytics Data
 */
import type { AnalyticsData } from '../types';

export const mockAnalyticsData: AnalyticsData = {
  completenessBefore: 48,
  completenessAfter: 93,
  confidenceDistribution: {
    high: 842,
    medium: 128,
    low: 30,
  },
  validationDistribution: {
    validated: 948,
    needsReview: 47,
    failed: 5,
  },
  sourceDistribution: {
    'Manufacturer Website': 245,
    'Manufacturer PDF': 312,
    'Catalog': 198,
    'Technical Document': 156,
    'Other': 89,
  },
  pipelinePerformance: [
    {
      stage: 'Extraction',
      duration: 8.5,
      success: 99,
    },
    {
      stage: 'Matching',
      duration: 12.3,
      success: 97,
    },
    {
      stage: 'Classification',
      duration: 6.8,
      success: 98,
    },
    {
      stage: 'Ontology',
      duration: 9.2,
      success: 95,
    },
    {
      stage: 'RAG',
      duration: 15.5,
      success: 91,
    },
    {
      stage: 'Validation',
      duration: 5.2,
      success: 99,
    },
  ],
};
