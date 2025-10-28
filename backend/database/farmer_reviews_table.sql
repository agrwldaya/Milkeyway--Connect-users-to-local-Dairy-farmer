-- =====================================================
-- FARMER REVIEWS TABLE
-- Allows consumers to review and rate farmers after connections
-- =====================================================

-- 1. FARMER REVIEWS TABLE (Consumer Reviews & Ratings)
CREATE TABLE IF NOT EXISTS farmer_reviews (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_connection_id INTEGER REFERENCES active_connections(id) ON DELETE SET NULL,
    
    -- Rating system (1-5 stars)
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review content
    review_title VARCHAR(255),
    review_text TEXT,
    
    -- Review categories (optional detailed ratings)
    product_quality_rating INTEGER CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
    
    -- Review metadata
    is_verified_purchase BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    review_status VARCHAR(20) DEFAULT 'active' CHECK (review_status IN ('active', 'hidden', 'reported', 'deleted')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one review per consumer per farmer
    UNIQUE(consumer_id, farmer_id)
);

-- 2. FARMER REVIEW RESPONSES TABLE (Farmer can respond to reviews)
CREATE TABLE IF NOT EXISTS farmer_review_responses (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES farmer_reviews(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. REVIEW HELPFULNESS TABLE (Consumers can mark reviews as helpful)
CREATE TABLE IF NOT EXISTS review_helpfulness (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES farmer_reviews(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one helpfulness vote per consumer per review
    UNIQUE(review_id, consumer_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Farmer Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_farmer_id ON farmer_reviews(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_consumer_id ON farmer_reviews(consumer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_rating ON farmer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_created_at ON farmer_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_status ON farmer_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_farmer_reviews_verified ON farmer_reviews(is_verified_purchase);

-- Review Responses Indexes
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON farmer_review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_farmer_id ON farmer_review_responses(farmer_id);

-- Review Helpfulness Indexes
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_consumer_id ON review_helpfulness(consumer_id);

 