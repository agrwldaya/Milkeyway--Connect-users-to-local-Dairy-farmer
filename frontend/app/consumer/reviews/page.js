'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsumerNav } from '@/components/consumer-nav';
import { reviewApi, reviewHelpers } from '@/lib/reviewApi';
import { Star, StarHalf, Edit, Trash2, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ConsumerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    // Fetch reviews directly since we get consumer ID from authentication
    fetchReviews();
  }, [filters]);


  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching reviews...');
      
      // We don't need consumerId anymore since the API gets it from authentication
      const data = await reviewApi.getConsumerReviews(null, filters);
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

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewApi.deleteReview(reviewId, null); // consumerId not needed anymore
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
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

    const canEdit = () => {
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      const diffInHours = (now - reviewDate) / (1000 * 60 * 60);
      return diffInHours <= 24; // Can edit within 24 hours
    };

    return (
      <Card className="p-4 space-y-3">
        {/* Review Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                href={`/consumer/farmer/${review.farmer_id}`}
                className="font-medium hover:text-blue-600 transition-colors"
              >
                {review.farmer_name}
              </Link>
              {review.farm_name && (
                <span className="text-sm text-gray-500">({review.farm_name})</span>
              )}
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
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {canEdit() && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // TODO: Implement edit functionality
                  alert('Edit functionality coming soon!');
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteReview(review.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
              <span className="font-medium text-blue-900">Farmer Response</span>
            </div>
            <p className="text-blue-800 text-sm">{review.farmer_response}</p>
            <p className="text-blue-600 text-xs mt-1">
              {reviewHelpers.formatRelativeTime(review.response_date)}
            </p>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="text-center p-4">
              <p className="text-gray-600">Loading reviews...</p>
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
        <ConsumerNav />
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
      <ConsumerNav />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold">My Reviews</h1>
              <p className="text-gray-600">
                Reviews you've written for farmers
              </p>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
              <Link href="/consumer/farmers">
                <Button>Browse Farmers</Button>
              </Link>
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
      </div>
    </div>
  );
}
