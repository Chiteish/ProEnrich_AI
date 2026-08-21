/**
 * Mock Processing Data
 */
import type { ProcessingJob } from '../types';

export const mockProcessingJob: ProcessingJob = {
  id: 'job-001',
  status: 'processing',
  totalProducts: 1000,
  processedProducts: 638,
  stages: [
    {
      id: 'stage-1',
      name: 'Data Ingestion',
      status: 'completed',
      progress: 100,
      completedAt: '2024-08-15T08:00:00Z',
    },
    {
      id: 'stage-2',
      name: 'Product Understanding',
      status: 'completed',
      progress: 100,
      completedAt: '2024-08-15T08:15:00Z',
    },
    {
      id: 'stage-3',
      name: 'Product Matching',
      status: 'completed',
      progress: 100,
      completedAt: '2024-08-15T08:30:00Z',
    },
    {
      id: 'stage-4',
      name: 'Classification',
      status: 'completed',
      progress: 100,
      completedAt: '2024-08-15T09:00:00Z',
    },
    {
      id: 'stage-5',
      name: 'Ontology Mapping',
      status: 'completed',
      progress: 100,
      completedAt: '2024-08-15T09:30:00Z',
    },
    {
      id: 'stage-6',
      name: 'RAG Enrichment',
      status: 'processing',
      progress: 63,
      startedAt: '2024-08-15T10:00:00Z',
    },
    {
      id: 'stage-7',
      name: 'Normalization',
      status: 'waiting',
      progress: 0,
    },
    {
      id: 'stage-8',
      name: 'Validation',
      status: 'waiting',
      progress: 0,
    },
    {
      id: 'stage-9',
      name: 'Output Generation',
      status: 'waiting',
      progress: 0,
    },
  ],
  startedAt: '2024-08-15T07:45:00Z',
};

export const mockProcessingStats = {
  productsProcessed: 638,
  totalProducts: 1000,
  attributesExtracted: 7842,
  sourcesRetrieved: 1284,
  highConfidence: 91,
  needsReview: 47,
};
