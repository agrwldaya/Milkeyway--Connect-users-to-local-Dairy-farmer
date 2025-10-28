'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { reviewApi, reviewHelpers } from '../lib/reviewApi';
import { Star, StarHalf, TrendingUp, MessageCircle, ThumbsUp } from 'lucide-react';

const ReviewStats = ({ farmerId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [farmerId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getFarmerReviewStats(farmerId);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Failed to load review statistics</p>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const ratingDistribution = reviewHelpers.calculateRatingDistribution(
    stats.rating_distribution,
    stats.total_reviews
  );

  const StarDisplay = ({ rating, size = 'w-5 h-5' }) => {
    const { fullStars, hasHalfStar } = reviewHelpers.generateStars(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className={`${size} text-yellow-400 fill-current`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${size} text-yellow-400 fill-current`} />
        )}
        <span className="ml-1 text-lg font-semibold">{reviewHelpers.formatRating(rating)}</span>
      </div>
    );
  };

  const RatingBar = ({ rating, count, percentage }) => (
    <div className="flex items-center space-x-2">
      <span className="w-8 text-sm font-medium">{rating}</span>
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Rating</h3>
          <Badge variant="secondary" className="text-sm">
            {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-6">
          <StarDisplay rating={stats.average_rating} size="w-8 h-8" />
          <div className="text-sm text-gray-600">
            <p>Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}</p>
            {stats.last_review_at && (
              <p>Last review: {reviewHelpers.formatRelativeTime(stats.last_review_at)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingBar
              key={rating}
              rating={rating}
              count={ratingDistribution[rating]?.count || 0}
              percentage={ratingDistribution[rating]?.percentage || 0}
            />
          ))}
        </div>
      </Card>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-medium">Positive Reviews</h4>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.positive_reviews_count || 0}
          </div>
          <p className="text-sm text-gray-600">
            {stats.total_reviews > 0 
              ? Math.round((stats.positive_reviews_count / stats.total_reviews) * 100)
              : 0
            }% of total reviews
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium">Response Rate</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.review_response_rate || 0}%
          </div>
          <p className="text-sm text-gray-600">
            {stats.total_review_responses || 0} responses to reviews
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      {(stats.reviews_this_month > 0 || stats.reviews_this_week > 0) && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Recent Activity</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">This Week</p>
              <p className="text-lg font-semibold">{stats.reviews_this_week || 0}</p>
            </div>
            <div>
              <p className="text-gray-600">This Month</p>
              <p className="text-lg font-semibold">{stats.reviews_this_month || 0}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewStats;
