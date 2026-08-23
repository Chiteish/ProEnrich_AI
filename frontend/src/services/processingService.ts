/**
 * Processing Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { ProcessingJob } from '../types';
import { mockProcessingJob } from '../mock/processing';

const mapBackendJobToFrontend = (backendJob: any): ProcessingJob => {
  if (!backendJob) throw new Error('No job object returned');
  const progress = backendJob.total > 0 ? Math.round((backendJob.processed / backendJob.total) * 100) : 0;
  
  let status: 'queued' | 'processing' | 'completed' | 'failed' = 'queued';
  if (backendJob.status === 'PROCESSING') status = 'processing';
  else if (backendJob.status === 'COMPLETED') status = 'completed';
  else if (backendJob.status === 'FAILED') status = 'failed';

  const stages = [
    {
      id: 'stage-1',
      name: 'Data Ingestion',
      status: (status === 'completed' || status === 'processing' || backendJob.status === 'QUEUED') ? 'completed' : 'processing',
      progress: (status === 'completed' || status === 'processing' || backendJob.status === 'QUEUED') ? 100 : progress,
      completedAt: backendJob.createdAt
    },
    {
      id: 'stage-2',
      name: 'Product Understanding',
      status: (status === 'completed' || status === 'processing') ? 'completed' : (backendJob.status === 'QUEUED' ? 'processing' : 'waiting'),
      progress: (status === 'completed' || status === 'processing') ? 100 : 0,
      completedAt: backendJob.createdAt
    },
    {
      id: 'stage-3',
      name: 'Product Matching',
      status: (status === 'completed') ? 'completed' : (status === 'processing' ? 'processing' : 'waiting'),
      progress: (status === 'completed') ? 100 : (status === 'processing' ? progress : 0)
    },
    {
      id: 'stage-4',
      name: 'Classification',
      status: (status === 'completed') ? 'completed' : (status === 'processing' ? 'processing' : 'waiting'),
      progress: (status === 'completed') ? 100 : (status === 'processing' ? progress : 0)
    },
    {
      id: 'stage-5',
      name: 'Ontology Mapping',
      status: (status === 'completed') ? 'completed' : (status === 'processing' ? 'processing' : 'waiting'),
      progress: (status === 'completed') ? 100 : (status === 'processing' ? progress : 0)
    },
    {
      id: 'stage-6',
      name: 'RAG Enrichment',
      status: (status === 'completed') ? 'completed' : (status === 'processing' ? 'processing' : 'waiting'),
      progress: (status === 'completed') ? 100 : (status === 'processing' ? progress : 0)
    },
    {
      id: 'stage-7',
      name: 'Normalization',
      status: (status === 'completed') ? 'completed' : 'waiting',
      progress: (status === 'completed') ? 100 : 0
    },
    {
      id: 'stage-8',
      name: 'Validation',
      status: (status === 'completed') ? 'completed' : 'waiting',
      progress: (status === 'completed') ? 100 : 0
    },
    {
      id: 'stage-9',
      name: 'Output Generation',
      status: (status === 'completed') ? 'completed' : 'waiting',
      progress: (status === 'completed') ? 100 : 0
    }
  ];

  return {
    id: backendJob.jobId,
    status: status,
    totalProducts: backendJob.total || 0,
    processedProducts: backendJob.processed || 0,
    stages: stages as any,
    startedAt: backendJob.createdAt,
    completedAt: backendJob.completedAt,
    errorMessage: backendJob.error
  };
};

class ProcessingService {
  /**
   * Start enrichment processing
   */
  async startProcessing(jobId: string): Promise<ProcessingJob> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...mockProcessingJob, id: jobId });
        }, 500);
      });
    }

    try {
      const response = await apiClient.post<any>(`/jobs/${jobId}/process`, {});
      return mapBackendJobToFrontend(response.data.job);
    } catch (error) {
      console.error('Failed to start processing:', error);
      throw error;
    }
  }

  /**
   * Get processing job status
   */
  async getJobStatus(jobId: string): Promise<ProcessingJob> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockProcessingJob);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<any>(`/jobs/${jobId}/status`);
      return mapBackendJobToFrontend(response.data.job);
    } catch (error) {
      console.error('Failed to get job status:', error);
      throw error;
    }
  }

  /**
   * Poll for job updates
   */
  async pollJobStatus(jobId: string, interval: number = 2000): Promise<ProcessingJob> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const job = await this.getJobStatus(jobId);
          if (job.status === 'completed' || job.status === 'failed') {
            resolve(job);
          } else {
            setTimeout(checkStatus, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      checkStatus();
    });
  }
}

export const processingService = new ProcessingService();
