/**
 * Ontology Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { OntologyNode, OntologyEdge } from '../types';
import { mockOntologyNodes, mockOntologyEdges } from '../mock/ontology';

class OntologyService {
  /**
   * Get ontology nodes for a product
   */
  async getOntologyNodes(productId: string): Promise<OntologyNode[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockOntologyNodes);
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<OntologyNode[]>(
        `/products/${productId}/ontology/nodes`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ontology nodes:', error);
      throw error;
    }
  }

  /**
   * Get ontology edges for a product
   */
  async getOntologyEdges(productId: string): Promise<OntologyEdge[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockOntologyEdges);
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<OntologyEdge[]>(
        `/products/${productId}/ontology/edges`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ontology edges:', error);
      throw error;
    }
  }
}

export const ontologyService = new OntologyService();
