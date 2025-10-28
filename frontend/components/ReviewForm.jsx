'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { reviewApi, reviewHelpers } from '../lib/reviewApi';
import { Star, StarHalf } from 'lucide-react';

const ReviewForm = ({ farmerId, consumerId, activeConnectionId, onReviewAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    farmer_id: farmerId,
    consumer_id: consumerId,
    active_connection_id: activeConnectionId,
    rating: 0,
    review_title: '',
    review_text: '',
    product_quality_rating: 0,
    delivery_rating: 0,
    communication_rating: 0,
    value_for_money_rating: 0,
    is_anonymous: false
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleRatingChange = (rating, field = 'rating') => {
    handleInputChange(field, rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form data
    const validation = reviewHelpers.validateReviewData(formData);
    if (!validation.isValid) {
      const errorObj = {};
      validation.errors.forEach(error => {
        if (error.includes('Rating')) errorObj.rating = error;
        if (error.includes('Review text')) errorObj.review_text = error;
        if (error.includes('Review title')) errorObj.review_title = error;
      });
      setErrors(errorObj);
      setIsSubmitting(false);
      return;
    }

    try {
      await reviewApi.addReview(formData);
      onReviewAdded?.();
    } catch (error) {
      console.error('Error adding review:', error);
      setErrors({ submit: error.message || 'Failed to add review' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, hoveredRating, onHover, onLeave, size = 'w-6 h-6' }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${size} transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const CategoryRating = ({ label, field, rating, onRatingChange }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <StarRating
          rating={rating}
          onRatingChange={(rating) => onRatingChange(rating, field)}
          size="w-4 h-4"
        />
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Overall Rating *</Label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => handleRatingChange(rating, 'rating')}
            hoveredRating={hoveredRating}
            onHover={setHoveredRating}
            onLeave={() => setHoveredRating(0)}
          />
          {errors.rating && (
            <p className="text-sm text-red-500">{errors.rating}</p>
          )}
        </div>

        {/* Detailed Ratings */}
        <div className="grid grid-cols-2 gap-4">
          <CategoryRating
            label="Product Quality"
            field="product_quality_rating"
            rating={formData.product_quality_rating}
            onRatingChange={handleRatingChange}
          />
          <CategoryRating
            label="Delivery"
            field="delivery_rating"
            rating={formData.delivery_rating}
            onRatingChange={handleRatingChange}
          />
          <CategoryRating
            label="Communication"
            field="communication_rating"
            rating={formData.communication_rating}
            onRatingChange={handleRatingChange}
          />
          <CategoryRating
            label="Value for Money"
            field="value_for_money_rating"
            rating={formData.value_for_money_rating}
            onRatingChange={handleRatingChange}
          />
        </div>

        {/* Review Title */}
        <div className="space-y-2">
          <Label htmlFor="review_title">Review Title (Optional)</Label>
          <Input
            id="review_title"
            value={formData.review_title}
            onChange={(e) => handleInputChange('review_title', e.target.value)}
            placeholder="Summarize your experience"
            maxLength={255}
          />
          {errors.review_title && (
            <p className="text-sm text-red-500">{errors.review_title}</p>
          )}
        </div>

        {/* Review Text */}
        <div className="space-y-2">
          <Label htmlFor="review_text">Your Review *</Label>
          <Textarea
            id="review_text"
            value={formData.review_text}
            onChange={(e) => handleInputChange('review_text', e.target.value)}
            placeholder="Tell others about your experience with this farmer..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formData.review_text.length}/1000 characters</span>
          </div>
          {errors.review_text && (
            <p className="text-sm text-red-500">{errors.review_text}</p>
          )}
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_anonymous" className="text-sm">
            Post this review anonymously
          </Label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default ReviewForm;
