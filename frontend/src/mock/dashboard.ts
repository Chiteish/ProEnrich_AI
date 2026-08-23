/**
 * Mock Dashboard Data
 */
import type { DashboardKPI, PipelineStage, ActivityLog } from '../types';

export const mockDashboardKPIs: DashboardKPI[] = [
  {
    label: 'Products Processed',
    value: 1000,
    trend: 12,
    icon: 'package',
    unit: 'total',
  },
  {
    label: 'Enrichment Completed',
    value: 842,
    trend: 8,
    icon: 'checkCircle',
    unit: 'products',
  },
  {
    label: 'Metadata Completeness',
    value: 93.4,
    trend: 2.1,
    icon: 'target',
    unit: '%',
  },
  {
    label: 'Validation Score',
    value: 96.8,
    trend: 1.5,
    icon: 'shield',
    unit: '%',
  },
  {
    label: 'Needs Review',
    value: 47,
    trend: -3,
    icon: 'alertCircle',
    unit: 'items',
  },
];

export const mockPipelineStages: PipelineStage[] = [
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
];

export const mockActivityLog: ActivityLog[] = [
  {
    id: 'log-1',
    icon: 'checkCircle',
    message: '842 products enriched',
    timestamp: '2 min ago',
    type: 'success',
  },
  {
    id: 'log-2',
    icon: 'alertCircle',
    message: '47 attributes require review',
    timestamp: '5 min ago',
    type: 'warning',
  },
  {
    id: 'log-3',
    icon: 'checkCircle',
    message: 'Ontology mapping completed',
    timestamp: '8 min ago',
    type: 'success',
  },
  {
    id: 'log-4',
    icon: 'checkCircle',
    message: 'Catalog validation completed',
    timestamp: '12 min ago',
    type: 'success',
  },
];

export const mockQualityMetrics = {
  metadataCompleteness: 93,
  evidenceCoverage: 91,
  aiConfidence: 95,
  lovCompliance: 98,
  uomCompliance: 97,
};
