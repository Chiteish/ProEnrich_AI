/**
 * Processing Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { ProcessingJob } from '../types';
import { mockProcessingJob } from '../mock/processing';

class ProcessingService {
  /**
   * Start enrichment processing
   */
  async startProcessing(fileId: string): Promise<ProcessingJob> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...mockProcessingJob, id: fileId });
        }, 500);
      });
    }

    try {
      const response = await apiClient.post<ProcessingJob>('/processing/start', { fileId });
      return response.data;
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
      const response = await apiClient.get<ProcessingJob>(`/processing/${jobId}`);
      return response.data;
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
