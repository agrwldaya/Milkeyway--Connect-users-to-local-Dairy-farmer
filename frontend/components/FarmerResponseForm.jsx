'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { reviewApi } from '../lib/reviewApi';
import { MessageCircle } from 'lucide-react';

const FarmerResponseForm = ({ reviewId, farmerId, onResponseAdded, onCancel }) => {
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      setError('Response text is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewApi.addFarmerResponse(reviewId, {
        farmer_id: farmerId,
        response_text: responseText.trim()
      });
      
      onResponseAdded?.();
      setResponseText('');
    } catch (error) {
      console.error('Error adding response:', error);
      setError(error.message || 'Failed to add response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 border-l-4 border-blue-400 bg-blue-50">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-blue-900">Respond to Review</h4>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="response_text">Your Response</Label>
          <Textarea
            id="response_text"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Thank the customer for their feedback and address any concerns..."
            rows={3}
            maxLength={500}
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Keep it professional and helpful</span>
            <span>{responseText.length}/500 characters</span>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting || !responseText.trim()}
            size="sm"
          >
            {isSubmitting ? 'Posting...' : 'Post Response'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
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

export default FarmerResponseForm;
