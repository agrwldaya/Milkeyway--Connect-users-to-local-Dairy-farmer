'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FarmerNav } from '@/components/farmer-nav';
import { reviewApi, reviewHelpers } from '@/lib/reviewApi';
import { Star, StarHalf, MessageCircle, ThumbsUp, ThumbsDown, Reply, Calendar } from 'lucide-react';
import FarmerResponseForm from '@/components/FarmerResponseForm';

export default function FarmerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerId, setFarmerId] = useState(null);
  const [respondingToReview, setRespondingToReview] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    order: 'desc'
  });

  useEffect(() => {
    getFarmerId();
  }, []);

  useEffect(() => {
    if (farmerId) {
      fetchReviews();
    } else if (farmerId === null) {
      // If farmerId is explicitly null (not undefined), it means we tried to get it but failed
      setLoading(false);
    }
  }, [farmerId, filters]);

  const getFarmerId = async () => {
    try {
      console.log('Fetching farmer profile...');
      const response = await fetch('/api/v1/farmers/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Farmer profile response status:', response.status);
      const data = await response.json();
      console.log('Farmer profile response data:', data);
      
      if (data.farmerProfile) {
        setFarmerId(data.farmerProfile.id);
        console.log('Farmer ID set to:', data.farmerProfile.id);
      } else {
        console.error('Failed to get farmer profile:', data.message);
        setError(data.message || 'Failed to get farmer profile. Please make sure you are logged in.');
        setFarmerId(null);
      }
    } catch (error) {
      console.error('Error getting farmer ID:', error);
      setError(`Failed to get farmer profile: ${error.message}`);
      setFarmerId(null);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching reviews for farmer ID:', farmerId);
      console.log('Farmer ID type:', typeof farmerId);
      console.log('Farmer ID value:', farmerId);
      
      if (!farmerId || farmerId === null || farmerId === 'null') {
        console.error('Invalid farmer ID:', farmerId);
        setError('Invalid farmer ID');
        setLoading(false);
        return;
      }
      
      const data = await reviewApi.getFarmerReviews(farmerId, filters);
      console.log('Reviews data:', data);
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleResponseAdded = () => {
    setRespondingToReview(null);
    fetchReviews(); // Refresh reviews to show the new response
  };

  const StarDisplay = ({ rating, size = 'w-4 h-4' }) => {
    const { fullStars, hasHalfStar } = reviewHelpers.generateStars(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${size} text-yellow-400 fill-current`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${size} text-yellow-400 fill-current`} />
        )}
        <span className="ml-1 text-sm font-medium">{reviewHelpers.formatRating(rating)}</span>
      </div>
    );
  };

  const ReviewCard = ({ review }) => {
    const [showFullText, setShowFullText] = useState(false);
    const isLongText = review.review_text && review.review_text.length > 200;
    const displayText = showFullText || !isLongText 
      ? review.review_text 
      : review.review_text.substring(0, 200) + '...';

    return (
      <Card className="p-4 space-y-3">
        {/* Review Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium">
                {review.is_anonymous ? 'Anonymous' : review.consumer_name}
              </h4>
              <Badge variant="secondary" className="text-xs">
                Verified Purchase
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <StarDisplay rating={review.rating} />
              <span>•</span>
              <span>{reviewHelpers.formatRelativeTime(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Review Title */}
        {review.review_title && (
          <h5 className="font-medium text-gray-900">{review.review_title}</h5>
        )}

        {/* Review Text */}
        <div className="text-gray-700">
          <p className="whitespace-pre-wrap">{displayText}</p>
          {isLongText && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-600 hover:text-blue-800 text-sm mt-1"
            >
              {showFullText ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Detailed Ratings */}
        {(review.product_quality_rating || review.delivery_rating || 
          review.communication_rating || review.value_for_money_rating) && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {review.product_quality_rating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Product Quality:</span>
                <StarDisplay rating={review.product_quality_rating} size="w-3 h-3" />
              </div>
            )}
            {review.delivery_rating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <StarDisplay rating={review.delivery_rating} size="w-3 h-3" />
              </div>
            )}
            {review.communication_rating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Communication:</span>
                <StarDisplay rating={review.communication_rating} size="w-3 h-3" />
              </div>
            )}
            {review.value_for_money_rating && (
              <div className="flex justify-between">
                <span className="text-gray-600">Value for Money:</span>
                <StarDisplay rating={review.value_for_money_rating} size="w-3 h-3" />
              </div>
            )}
          </div>
        )}

        {/* Farmer Response */}
        {review.farmer_response ? (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Your Response</span>
            </div>
            <p className="text-blue-800 text-sm">{review.farmer_response}</p>
            <p className="text-blue-600 text-xs mt-1">
              {reviewHelpers.formatRelativeTime(review.response_date)}
            </p>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRespondingToReview(review.id)}
            >
              <Reply className="w-4 h-4 mr-1" />
              Respond
            </Button>
          </div>
        )}

        {/* Helpful Votes */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Helpful votes: {review.helpful_count || 0}</span>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="text-center p-4">
              <p className="text-gray-600">Loading reviews...</p>
              <p className="text-sm text-gray-500">Farmer ID: {farmerId || 'Not loaded yet'}</p>
            </div>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReviews} variant="outline">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerNav />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">Customer Reviews</h1>
              <p className="text-gray-600">
                Manage and respond to customer reviews
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="created_at">Newest First</option>
                <option value="rating">Highest Rating</option>
                <option value="helpful_count">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No reviews yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Response Form Modal */}
          {respondingToReview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                  <FarmerResponseForm
                    reviewId={respondingToReview}
                    farmerId={farmerId}
                    onResponseAdded={handleResponseAdded}
                    onCancel={() => setRespondingToReview(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
