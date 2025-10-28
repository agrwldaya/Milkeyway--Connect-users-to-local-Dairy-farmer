'use client';

import { useState } from 'react';

export default function TestReviewsPage() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test 1: Check if we can get consumer profile
      console.log('Testing consumer profile...');
      const profileResponse = await fetch('/api/v1/consumers/profile', {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();
      console.log('Profile response:', profileData);
      
      if (profileData.success) {
        setTestResult(`✅ Consumer profile loaded successfully! Consumer ID: ${profileData.consumer.id}`);
        
        // Test 2: Try to get reviews for this consumer
        console.log('Testing consumer reviews...');
        const reviewsResponse = await fetch(`/api/v1/reviews/consumer/${profileData.consumer.id}`, {
          credentials: 'include'
        });
        const reviewsData = await reviewsResponse.json();
        console.log('Reviews response:', reviewsData);
        
        setTestResult(prev => prev + `\n✅ Reviews API working! Found ${reviewsData.reviews?.length || 0} reviews`);
      } else {
        setTestResult(`❌ Failed to get consumer profile: ${profileData.message}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFarmerReviews = async () => {
    setLoading(true);
    setTestResult('Testing farmer reviews...');
    
    try {
      // Test getting reviews for a specific farmer (using farmer ID 1)
      const response = await fetch('/api/v1/reviews/farmer/1');
      const data = await response.json();
      console.log('Farmer reviews response:', data);
      
      if (data.reviews) {
        setTestResult(`✅ Farmer reviews API working! Found ${data.reviews.length} reviews for farmer 1`);
      } else {
        setTestResult(`❌ Farmer reviews API failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Farmer reviews test error:', error);
      setTestResult(`❌ Farmer reviews error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Review System Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Consumer API'}
          </button>
          
          <button
            onClick={testFarmerReviews}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Farmer Reviews API'}
          </button>
        </div>
        
        {testResult && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
