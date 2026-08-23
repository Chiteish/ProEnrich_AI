/**
 * Enrichment Service
 */
import { apiClient } from '../lib/api';
import type { EnrichmentRequest, EnrichmentResponse, AssetManifest } from '../types';

class EnrichmentService {
  /**
   * Send a product to the RAG enrichment pipeline
   */
  async enrichProduct(request: EnrichmentRequest): Promise<EnrichmentResponse> {
    try {
      const response = await apiClient.post<EnrichmentResponse>('/ai/enrich', request);
      return response.data;
    } catch (error: any) {
      console.error('Failed to enrich product:', error);
      
      // Parse backend custom errors to pass details to UI
      if (error.response?.data) {
        const errorData = error.response.data;
        const customError = new Error(errorData.message || 'Enrichment failed');
        (customError as any).error = errorData.error;
        (customError as any).status = error.response.status;
        throw customError;
      }
      
      throw error;
    }
  }

  /**
   * Get persisted product enrichment data
   */
  async getProductEnrichment(mpn: string): Promise<EnrichmentResponse> {
    const response = await apiClient.get<EnrichmentResponse>(`/products/${mpn}/enrichment`);
    return response.data;
  }

  /**
   * Get persisted product assets manifest
   */
  async getProductAssets(mpn: string): Promise<AssetManifest> {
    const response = await apiClient.get<AssetManifest>(`/products/${mpn}/assets`);
    return response.data;
  }
}

export const enrichmentService = new EnrichmentService();
