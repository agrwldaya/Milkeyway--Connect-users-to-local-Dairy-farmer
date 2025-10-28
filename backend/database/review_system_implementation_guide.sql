-- =====================================================
-- REVIEW SYSTEM IMPLEMENTATION GUIDE
-- Complete SQL script to implement the review system
-- =====================================================

-- This file contains all the SQL modifications needed to implement
-- the review system in your dairy project. Execute these files in order:

-- 1. First, create the main review tables
--    Source: farmer_reviews_table.sql

-- 2. Add rating columns to farmer_profiles
--    Source: add_rating_columns_to_farmer_profiles.sql

-- 3. Update farmer activity summary for reviews
--    Source: update_farmer_activity_summary_for_reviews.sql

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Consumer adds a review for a farmer
/*
INSERT INTO farmer_reviews (
    farmer_id, 
    consumer_id, 
    active_connection_id,
    rating, 
    review_title, 
    review_text,
    product_quality_rating,
    delivery_rating,
    communication_rating,
    value_for_money_rating,
    is_verified_purchase
) VALUES (
    1, -- farmer_id
    2, -- consumer_id
    3, -- active_connection_id
    5, -- rating
    'Excellent fresh milk!',
    'The milk quality is outstanding and delivery was on time. Highly recommended!',
    5, -- product_quality_rating
    4, -- delivery_rating
    5, -- communication_rating
    5, -- value_for_money_rating
    true -- is_verified_purchase
);
*/

-- Example 2: Farmer responds to a review
/*
INSERT INTO farmer_review_responses (
    review_id,
    farmer_id,
    response_text
) VALUES (
    1, -- review_id
    1, -- farmer_id
    'Thank you for your kind words! We appreciate your business.'
);
*/

-- Example 3: Consumer marks a review as helpful
/*
INSERT INTO review_helpfulness (
    review_id,
    consumer_id,
    is_helpful
) VALUES (
    1, -- review_id
    3, -- consumer_id
    true -- is_helpful
);
*/

-- Example 4: Get farmer's review statistics
/*
SELECT 
    fp.name,
    fp.average_rating,
    fp.total_reviews,
    fp.rating_distribution,
    fas.positive_reviews_count,
    fas.negative_reviews_count,
    fas.review_response_rate
FROM farmer_profiles fp
LEFT JOIN farmer_activity_summary fas ON fp.id = fas.farmer_id
WHERE fp.id = 1;
*/

-- Example 5: Get all reviews for a farmer with responses
/*
SELECT 
    fr.id,
    fr.rating,
    fr.review_title,
    fr.review_text,
    fr.created_at,
    u.name as consumer_name,
    frr.response_text as farmer_response,
    frr.created_at as response_date
FROM farmer_reviews fr
JOIN users u ON fr.consumer_id = u.id
LEFT JOIN farmer_review_responses frr ON fr.id = frr.review_id
WHERE fr.farmer_id = 1
AND fr.review_status = 'active'
ORDER BY fr.created_at DESC;
*/

-- Example 6: Get top-rated farmers
/*
SELECT 
    fp.id,
    fp.name,
    fp.average_rating,
    fp.total_reviews,
    fp.rating_distribution->>'5' as five_star_count
FROM farmer_profiles fp
WHERE fp.total_reviews >= 5  -- Only farmers with at least 5 reviews
ORDER BY fp.average_rating DESC, fp.total_reviews DESC
LIMIT 10;
*/

-- =====================================================
-- API ENDPOINT SUGGESTIONS
-- =====================================================

/*
Suggested API endpoints for the review system:

1. POST /api/reviews
   - Add a new review
   - Body: { farmer_id, consumer_id, rating, review_text, etc. }

2. GET /api/farmers/:id/reviews
   - Get all reviews for a farmer
   - Query params: page, limit, sort_by, rating_filter

3. POST /api/reviews/:id/response
   - Farmer responds to a review
   - Body: { response_text }

4. POST /api/reviews/:id/helpful
   - Mark review as helpful/unhelpful
   - Body: { is_helpful }

5. GET /api/farmers/top-rated
   - Get top-rated farmers
   - Query params: limit, min_reviews

6. GET /api/consumers/:id/reviews
   - Get all reviews written by a consumer

7. PUT /api/reviews/:id
   - Update a review (if allowed)

8. DELETE /api/reviews/:id
   - Delete a review (soft delete by changing status)
*/

-- =====================================================
-- BUSINESS RULES IMPLEMENTATION
-- =====================================================

-- Rule 1: Only consumers with active connections can review
-- This is enforced by the active_connection_id foreign key

-- Rule 2: One review per consumer per farmer
-- This is enforced by the UNIQUE constraint on (consumer_id, farmer_id)

-- Rule 3: Reviews are automatically verified if from active connection
-- This can be implemented in the application logic

-- Rule 4: Rating must be between 1-5
-- This is enforced by CHECK constraints

-- Rule 5: Review statistics are automatically updated
-- This is handled by triggers

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Update all farmer rating statistics (run periodically)
/*
DO $$
DECLARE
    farmer_record RECORD;
BEGIN
    FOR farmer_record IN SELECT id FROM farmer_profiles LOOP
        PERFORM update_farmer_rating_stats(farmer_record.id);
        PERFORM update_farmer_review_activity_stats(farmer_record.id);
    END LOOP;
END $$;
*/

-- Clean up old soft-deleted reviews (run periodically)
/*
UPDATE farmer_reviews 
SET review_status = 'deleted' 
WHERE review_status = 'hidden' 
AND created_at < CURRENT_DATE - INTERVAL '1 year';
*/
