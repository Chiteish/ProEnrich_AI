/**
 * Product Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { Product, ProductAttribute, Evidence, FileUploadResponse } from '../types';
import { mockProducts, mockProductAttributes, mockEvidence } from '../mock/products';

const PRODUCTS_ENDPOINT = '/products';

class ProductService {
  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: {
    manufacturer?: string;
    brand?: string;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<Product[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results = [...mockProducts];

          if (filters?.search) {
            const search = filters.search.toLowerCase();
            results = results.filter(
              (p) =>
                p.mfrPartNum.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search) ||
                p.manufacturer.toLowerCase().includes(search)
            );
          }

          if (filters?.manufacturer) {
            results = results.filter((p) => p.manufacturer === filters.manufacturer);
          }

          if (filters?.brand) {
            results = results.filter((p) => p.brand === filters.brand);
          }

          if (filters?.status) {
            results = results.filter((p) => p.status === filters.status);
          }

          resolve(results);
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<Product[]>(PRODUCTS_ENDPOINT, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    if (useMockData()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const product = mockProducts.find((p) => p.id === productId);
          if (product) {
            resolve(product);
          } else {
            reject(new Error('Product not found'));
          }
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<Product>(`${PRODUCTS_ENDPOINT}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }

  /**
   * Get product attributes
   */
  async getProductAttributes(productId: string): Promise<ProductAttribute[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockProductAttributes.filter((a) => a.productId === productId));
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<ProductAttribute[]>(
        `${PRODUCTS_ENDPOINT}/${productId}/attributes`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      throw error;
    }
  }

  /**
   * Get evidence for product
   */
  async getProductEvidence(productId: string): Promise<Evidence[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockEvidence.filter((e) => e.productId === productId));
        }, 200);
      });
    }

    try {
      const response = await apiClient.get<Evidence[]>(`${PRODUCTS_ENDPOINT}/${productId}/evidence`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const product = mockProducts.find((p) => p.id === productId);
          if (product) {
            resolve({ ...product, ...data });
          }
        }, 200);
      });
    }

    try {
      const response = await apiClient.put<Product>(`${PRODUCTS_ENDPOINT}/${productId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  /**
   * Upload file for ingestion
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            fileId: 'file-' + Date.now(),
            fileName: file.name,
            rows: 1000,
            inputFields: 6,
            status: 'ready',
            preview: mockProducts.slice(0, 10),
          });
        }, 800);
      });
    }

    try {
      const response = await apiClient.post<FileUploadResponse>('/ingestion/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
