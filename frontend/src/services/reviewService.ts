/**
 * Review Service
 */
import { apiClient, useMockData } from '../lib/api';
import type { ReviewItem } from '../types';
import { mockReviewItems } from '../mock/review';

class ReviewService {
  /**
   * Get pending reviews
   */
  async getPendingReviews(): Promise<ReviewItem[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockReviewItems.filter((r) => r.status === 'pending'));
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<ReviewItem[]>('/review/pending');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
      throw error;
    }
  }

  /**
   * Get approved reviews
   */
  async getApprovedReviews(): Promise<ReviewItem[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockReviewItems.filter((r) => r.status === 'approved'));
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<ReviewItem[]>('/review/approved');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch approved reviews:', error);
      throw error;
    }
  }

  /**
   * Get rejected reviews
   */
  async getRejectedReviews(): Promise<ReviewItem[]> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockReviewItems.filter((r) => r.status === 'rejected'));
        }, 300);
      });
    }

    try {
      const response = await apiClient.get<ReviewItem[]>('/review/rejected');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rejected reviews:', error);
      throw error;
    }
  }

  /**
   * Approve a review
   */
  async approveReview(reviewId: string): Promise<ReviewItem> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const review = mockReviewItems.find((r) => r.id === reviewId);
          if (review) {
            resolve({ ...review, status: 'approved' });
          }
        }, 200);
      });
    }

    try {
      const response = await apiClient.post<ReviewItem>(`/review/${reviewId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Failed to approve review:', error);
      throw error;
    }
  }

  /**
   * Reject a review
   */
  async rejectReview(reviewId: string): Promise<ReviewItem> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const review = mockReviewItems.find((r) => r.id === reviewId);
          if (review) {
            resolve({ ...review, status: 'rejected' });
          }
        }, 200);
      });
    }

    try {
      const response = await apiClient.post<ReviewItem>(`/review/${reviewId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Failed to reject review:', error);
      throw error;
    }
  }

  /**
   * Submit correction
   */
  async submitCorrection(
    reviewId: string,
    correctedValue: string
  ): Promise<ReviewItem> {
    if (useMockData()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const review = mockReviewItems.find((r) => r.id === reviewId);
          if (review) {
            resolve({ ...review, status: 'approved', correctedValue });
          }
        }, 200);
      });
    }

    try {
      const response = await apiClient.post<ReviewItem>(`/review/${reviewId}/correct`, {
        correctedValue,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit correction:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
