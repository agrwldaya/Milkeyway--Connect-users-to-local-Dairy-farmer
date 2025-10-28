'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConsumerNav } from '@/components/consumer-nav';

export default function SimpleConsumerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consumerId, setConsumerId] = useState(null);

  useEffect(() => {
    // Try to get consumer ID first
    fetchConsumerId();
  }, []);

  const fetchConsumerId = async () => {
    try {
      console.log('Fetching consumer profile...');
      const response = await fetch('/api/v1/consumers/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Consumer profile data:', data);
      
      if (data.success && data.consumer) {
        setConsumerId(data.consumer.id);
        // Now fetch reviews
        fetchReviews(data.consumer.id);
      } else {
        setError(`Failed to get consumer profile: ${data.message || 'Unknown error'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching consumer profile:', error);
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchReviews = async (id) => {
    try {
      console.log('Fetching reviews for consumer ID:', id);
      const response = await fetch(`/api/v1/reviews/consumer/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Reviews response status:', response.status);
      const data = await response.json();
      console.log('Reviews data:', data);
      
      if (data.reviews) {
        setReviews(data.reviews);
      } else {
        setError(`Failed to fetch reviews: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(`Error fetching reviews: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
            <p className="text-gray-600">Loading...</p>
            <p className="text-sm text-gray-500 mt-2">Consumer ID: {consumerId || 'Not loaded yet'}</p>
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
            <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
          <div>
            <h1 className="text-2xl font-bold">My Reviews</h1>
            <p className="text-gray-600">Consumer ID: {consumerId}</p>
          </div>

          {reviews.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
              <Button onClick={() => window.location.href = '/consumer/farmers'}>
                Browse Farmers
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{review.farmer_name}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                    </div>
                    {review.review_title && (
                      <h4 className="font-medium text-gray-900">{review.review_title}</h4>
                    )}
                    {review.review_text && (
                      <p className="text-gray-700">{review.review_text}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
