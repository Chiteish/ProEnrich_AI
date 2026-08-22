/**
 * Source Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { Source } from '../types';
import { mockSources } from '../mock/products';

class SourceService {
  /**
   * Get all sources
   */
  async getSources(): Promise<Source[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockSources);
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<Source[]>('/sources');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sources:', error);
      throw error;
    }
  }

  /**
   * Get sources for a product
   */
  async getProductSources(productId: string): Promise<Source[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockSources);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<Source[]>(`/products/${productId}/sources`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product sources:', error);
      throw error;
    }
  }
}

export const sourceService = new SourceService();
