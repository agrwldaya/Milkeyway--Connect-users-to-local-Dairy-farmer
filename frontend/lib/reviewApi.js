// Review API service functions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Review API functions
export const reviewApi = {
  // Add a new review
  addReview: async (reviewData) => {
    return apiCall('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Get reviews for a specific farmer
  getFarmerReviews: async (farmerId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/reviews/farmer/${farmerId}${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(endpoint);
  },

  // Get reviews written by a specific consumer
  getConsumerReviews: async (consumerId, params = {}) => {
    console.log('getConsumerReviews API call with:', { consumerId, params });
    
    // Note: consumerId is not used anymore since we get it from authentication
    // But we keep it for backward compatibility
    
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/reviews/consumer/my-reviews${queryParams ? `?${queryParams}` : ''}`;
    console.log('API endpoint:', endpoint);
    return apiCall(endpoint);
  },

  // Add farmer response to a review
  addFarmerResponse: async (reviewId, responseData) => {
    return apiCall(`/api/v1/reviews/${reviewId}/response`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  // Mark review as helpful/unhelpful
  markReviewHelpful: async (reviewId, helpfulData) => {
    return apiCall(`/api/v1/reviews/${reviewId}/helpful`, {
      method: 'POST',
      body: JSON.stringify(helpfulData),
    });
  },

  // Get top-rated farmers
  getTopRatedFarmers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/reviews/top-rated${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(endpoint);
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    return apiCall(`/api/v1/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete a review
  deleteReview: async (reviewId, consumerId) => {
    // Note: consumerId is not used anymore since we get it from authentication
    return apiCall(`/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Get farmer review statistics
  getFarmerReviewStats: async (farmerId) => {
    return apiCall(`/api/v1/reviews/farmer/${farmerId}/stats`);
  },
};

// Helper functions for common operations
export const reviewHelpers = {
  // Format rating for display
  formatRating: (rating) => {
    return parseFloat(rating).toFixed(1);
  },

  // Generate star display
  generateStars: (rating, maxStars = 5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return {
      fullStars,
      hasHalfStar,
      emptyStars,
      rating: parseFloat(rating)
    };
  },

  // Calculate rating distribution percentage
  calculateRatingDistribution: (distribution, totalReviews) => {
    if (!distribution || totalReviews === 0) return {};
    
    const result = {};
    for (let i = 1; i <= 5; i++) {
      const count = distribution[i] || 0;
      result[i] = {
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      };
    }
    return result;
  },

  // Validate review data
  validateReviewData: (data) => {
    const errors = [];

    if (!data.farmer_id) errors.push('Farmer ID is required');
    if (!data.consumer_id) errors.push('Consumer ID is required');
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
    if (data.review_text && data.review_text.length > 1000) {
      errors.push('Review text must be less than 1000 characters');
    }
    if (data.review_title && data.review_title.length > 255) {
      errors.push('Review title must be less than 255 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format relative time
  formatRelativeTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
};

export default reviewApi;
