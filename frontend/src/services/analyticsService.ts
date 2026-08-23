/**
 * Analytics Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { AnalyticsData } from '../types';
import { mockAnalyticsData } from '../mock/analytics';

class AnalyticsService {
  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockAnalyticsData);
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<AnalyticsData>('/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
