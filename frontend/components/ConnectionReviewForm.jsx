'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, StarHalf, X, CheckCircle } from 'lucide-react';
import { reviewApi } from '@/lib/reviewApi';
import { toast } from 'sonner';

export default function ConnectionReviewForm({ 
  farmerId, 
  farmerName, 
  connectionId, 
  onReviewSubmitted, 
  onCancel,
  existingReview = null 
}) {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    review_title: existingReview?.review_title || '',
    review_text: existingReview?.review_text || '',
    product_quality_rating: existingReview?.product_quality_rating || 0,
    delivery_rating: existingReview?.delivery_rating || 0,
    communication_rating: existingReview?.communication_rating || 0,
    value_for_money_rating: existingReview?.value_for_money_rating || 0,
    is_anonymous: existingReview?.is_anonymous || false
  });
  
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredSubRating, setHoveredSubRating] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subRatings = [
    { key: 'product_quality_rating', label: 'Product Quality', required: true },
    { key: 'delivery_rating', label: 'Delivery', required: true },
    { key: 'communication_rating', label: 'Communication', required: true },
    { key: 'value_for_money_rating', label: 'Value for Money', required: true }
  ];

  const handleRatingChange = (rating, field = 'rating') => {
    console.log('Rating changed:', rating, field);
    console.log('Form data:', formData);
    console.log('Errors:', errors);
    
    setFormData(prev => ({ ...prev, [field]: rating }));
    setHoveredRating(0);
    setHoveredSubRating(prev => ({ ...prev, [field]: 0 }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating || formData.rating === 0) {
      newErrors.rating = 'Overall rating is required';
    }
    
    if (!formData.review_title?.trim()) {
      newErrors.review_title = 'Review title is required';
    }
    
    if (!formData.review_text?.trim()) {
      newErrors.review_text = 'Review text is required';
    }
    
    // Validate sub-ratings
    subRatings.forEach(({ key, required }) => {
      if (required && (!formData[key] || formData[key] === 0)) {
        newErrors[key] = `${subRatings.find(s => s.key === key)?.label} rating is required`;
      }
    });
    
    setErrors(newErrors);
    
    // Log specific missing fields for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      console.log('Missing required fields:', Object.keys(newErrors));
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form data:', formData);
    console.log('Validation result:', validateForm());
    
    if (!validateForm()) {
      const missingFields = Object.keys(errors).filter(key => errors[key]);
      const fieldNames = missingFields.map(key => {
        if (key === 'rating') return 'Overall Rating';
        if (key === 'review_title') return 'Review Title';
        if (key === 'review_text') return 'Review Text';
        return subRatings.find(s => s.key === key)?.label || key;
      });
      
      toast.error(`Please complete: ${fieldNames.join(', ')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Get consumer ID from authentication
      const consumerResponse = await fetch('/api/v1/consumers/profile', {
        credentials: 'include'
      });
      const consumerData = await consumerResponse.json();
      
      console.log('Consumer profile response:', consumerData);
      
      if (!consumerData.consumerProfile) {
        throw new Error('Failed to get consumer information');
      }
      
      // Get the actual user ID from the consumer profile
      const consumerId = consumerData.consumerProfile.id;
      
      if (!consumerId) {
        throw new Error('Consumer ID not found in profile');
      }
      
      const reviewData = {
        farmer_id: farmerId,
        consumer_id: consumerId,
        active_connection_id: connectionId,
        ...formData
      };
      
      console.log('Submitting review data:', reviewData);
      
      if (existingReview) {
        // Update existing review
        await reviewApi.updateReview(existingReview.id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        await reviewApi.addReview(reviewData);
        toast.success('Review submitted successfully!');
      }
      
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    hovered, 
    onHover, 
    onLeave, 
    size = 'w-5 h-5',
    disabled = false 
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`${size} transition-colors ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
            onMouseEnter={() => !disabled && onHover(star)}
            onMouseLeave={() => !disabled && onLeave()}
            onClick={() => !disabled && onRatingChange(star)}
          >
            <Star
              className={`${
                star <= (hovered || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Review for {farmerName}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-medium">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => handleRatingChange(rating, 'rating')}
                hovered={hoveredRating}
                onHover={setHoveredRating}
                onLeave={() => setHoveredRating(0)}
                size="w-6 h-6"
              />
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Sub-ratings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Detailed Ratings</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subRatings.map(({ key, label, required }) => (
                <div key={key} className={errors[key] ? 'border border-red-200 rounded-lg p-3 bg-red-50' : ''}>
                  <Label className={`text-sm ${errors[key] ? 'text-red-700 font-medium' : ''}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="mt-1">
                    <StarRating
                      rating={formData[key]}
                      onRatingChange={(rating) => handleRatingChange(rating, key)}
                      hovered={hoveredSubRating[key]}
                      onHover={(rating) => setHoveredSubRating(prev => ({ ...prev, [key]: rating }))}
                      onLeave={() => setHoveredSubRating(prev => ({ ...prev, [key]: 0 }))}
                      size="w-4 h-4"
                    />
                  </div>
                  {errors[key] && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor="review_title" className="text-base font-medium">
              Review Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="review_title"
              name="review_title"
              value={formData.review_title}
              onChange={handleInputChange}
              placeholder="Summarize your experience"
              className="mt-2"
              disabled={loading}
            />
            {errors.review_title && (
              <p className="text-red-500 text-sm mt-1">{errors.review_title}</p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review_text" className="text-base font-medium">
              Review Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="review_text"
              name="review_text"
              value={formData.review_text}
              onChange={handleInputChange}
              placeholder="Share your detailed experience with this farmer..."
              rows={4}
              className="mt-2"
              disabled={loading}
            />
            {errors.review_text && (
              <p className="text-red-500 text-sm mt-1">{errors.review_text}</p>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleInputChange}
              className="rounded"
              disabled={loading}
            />
            <Label htmlFor="is_anonymous" className="text-sm">
              Submit anonymously
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {existingReview ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
