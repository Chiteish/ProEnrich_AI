/**
 * Dashboard Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { DashboardKPI, PipelineStage, ActivityLog } from '../types';
import {
  mockDashboardKPIs,
  mockPipelineStages,
  mockActivityLog,
  mockQualityMetrics,
} from '../mock/dashboard';

class DashboardService {
  /**
   * Get dashboard KPIs
   */
  async getKPIs(): Promise<DashboardKPI[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDashboardKPIs);
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<DashboardKPI[]>('/dashboard/kpis');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  }

  /**
   * Get pipeline stages
   */
  async getPipelineStages(): Promise<PipelineStage[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockPipelineStages);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<PipelineStage[]>('/dashboard/pipeline');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pipeline stages:', error);
      throw error;
    }
  }

  /**
   * Get activity log
   */
  async getActivityLog(): Promise<ActivityLog[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockActivityLog);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<ActivityLog[]>('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      throw error;
    }
  }

  /**
   * Get quality metrics
   */
  async getQualityMetrics(): Promise<typeof mockQualityMetrics> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockQualityMetrics);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get('/dashboard/quality');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quality metrics:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
