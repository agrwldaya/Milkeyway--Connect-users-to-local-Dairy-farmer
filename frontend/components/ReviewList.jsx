'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { reviewApi, reviewHelpers } from '../lib/reviewApi';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Calendar } from 'lucide-react';

const ReviewList = ({ farmerId, showAddReview = false, onAddReview, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    order: 'desc',
    rating_filter: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [farmerId, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getFarmerReviews(farmerId, filters);
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

  const handleHelpfulVote = async (reviewId, isHelpful) => {
    if (!currentUserId) return;

    try {
      await reviewApi.markReviewHelpful(reviewId, {
        consumer_id: currentUserId,
        is_helpful: isHelpful
      });
      // Refresh reviews to get updated helpful counts
      fetchReviews();
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const StarDisplay = ({ rating, size = 'w-4 h-4' }) => {
    const { fullStars, hasHalfStar, emptyStars } = reviewHelpers.generateStars(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${size} text-yellow-400 fill-current`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${size} text-yellow-400 fill-current`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className={`${size} text-gray-300`} />
        ))}
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
        {review.farmer_response && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Farmer Response</span>
            </div>
            <p className="text-blue-800 text-sm">{review.farmer_response}</p>
            <p className="text-blue-600 text-xs mt-1">
              {reviewHelpers.formatRelativeTime(review.response_date)}
            </p>
          </div>
        )}

        {/* Helpful Votes */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Was this review helpful?</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleHelpfulVote(review.id, true)}
              className="flex items-center space-x-1 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes ({review.helpful_count || 0})</span>
            </button>
            <button
              onClick={() => handleHelpfulVote(review.id, false)}
              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchReviews} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold">Reviews ({pagination.total_reviews || 0})</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.rating_filter}
            onChange={(e) => handleFilterChange({ rating_filter: e.target.value })}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={`${filters.sort_by}-${filters.order}`}
            onChange={(e) => {
              const [sort_by, order] = e.target.value.split('-');
              handleFilterChange({ sort_by, order });
            }}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
            <option value="helpful_count-desc">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Add Review Button */}
      {showAddReview && onAddReview && (
        <div className="flex justify-end">
          <Button onClick={onAddReview}>
            Write a Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No reviews yet. Be the first to review this farmer!</p>
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
    </div>
  );
};

export default ReviewList;
