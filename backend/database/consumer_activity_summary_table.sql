-- Create consumer_activity_summary table (updated for farmer request system)
CREATE TABLE IF NOT EXISTS consumer_activity_summary (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_requests_sent INTEGER DEFAULT 0,
    accepted_requests INTEGER DEFAULT 0,
    rejected_requests INTEGER DEFAULT 0,
    pending_requests INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    total_orders_placed INTEGER DEFAULT 0,
    total_reviews_given INTEGER DEFAULT 0,
    total_farmers_connected INTEGER DEFAULT 0,
    last_request_sent_at TIMESTAMP,
    last_order_placed_at TIMESTAMP,
    last_review_given_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Success metrics
    request_success_rate DECIMAL(5,2) DEFAULT 0.00,
    average_orders_per_connection DECIMAL(5,2) DEFAULT 0.00,
    
    -- Engagement metrics
    days_since_last_activity INTEGER DEFAULT 0,
    is_active_user BOOLEAN DEFAULT true,
    user_tier VARCHAR(20) DEFAULT 'regular' CHECK (user_tier IN ('regular', 'premium', 'vip')),
    
    -- Platform metrics
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    favorite_farmer_id INTEGER REFERENCES farmer_profiles(id),
    preferred_product_category VARCHAR(100),
    
    UNIQUE(consumer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consumer_activity_consumer_id ON consumer_activity_summary(consumer_id);
CREATE INDEX IF NOT EXISTS idx_consumer_activity_last_activity ON consumer_activity_summary(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_consumer_activity_is_active ON consumer_activity_summary(is_active_user);
CREATE INDEX IF NOT EXISTS idx_consumer_activity_user_tier ON consumer_activity_summary(user_tier);
CREATE INDEX IF NOT EXISTS idx_consumer_activity_success_rate ON consumer_activity_summary(request_success_rate);

-- Add comments for documentation
COMMENT ON TABLE consumer_activity_summary IS 'Comprehensive analytics and activity tracking for consumers';
COMMENT ON COLUMN consumer_activity_summary.consumer_id IS 'Reference to the consumer user';
COMMENT ON COLUMN consumer_activity_summary.total_requests_sent IS 'Total number of requests sent to farmers';
COMMENT ON COLUMN consumer_activity_summary.accepted_requests IS 'Number of requests accepted by farmers';
COMMENT ON COLUMN consumer_activity_summary.rejected_requests IS 'Number of requests rejected by farmers';
COMMENT ON COLUMN consumer_activity_summary.pending_requests IS 'Number of requests currently pending';
COMMENT ON COLUMN consumer_activity_summary.active_connections IS 'Number of active farmer connections';
COMMENT ON COLUMN consumer_activity_summary.total_orders_placed IS 'Total orders placed through the platform';
COMMENT ON COLUMN consumer_activity_summary.total_reviews_given IS 'Number of reviews written by consumer';
COMMENT ON COLUMN consumer_activity_summary.total_farmers_connected IS 'Total unique farmers connected with';
COMMENT ON COLUMN consumer_activity_summary.request_success_rate IS 'Percentage of requests that were accepted';
COMMENT ON COLUMN consumer_activity_summary.average_orders_per_connection IS 'Average orders per active connection';
COMMENT ON COLUMN consumer_activity_summary.days_since_last_activity IS 'Days since last platform activity';
COMMENT ON COLUMN consumer_activity_summary.is_active_user IS 'Whether user is considered active';
COMMENT ON COLUMN consumer_activity_summary.user_tier IS 'Consumer tier level (regular, premium, vip)';
COMMENT ON COLUMN consumer_activity_summary.total_spent IS 'Total amount spent on platform';
COMMENT ON COLUMN consumer_activity_summary.favorite_farmer_id IS 'Most frequently connected farmer';
COMMENT ON COLUMN consumer_activity_summary.preferred_product_category IS 'Most requested product category';
