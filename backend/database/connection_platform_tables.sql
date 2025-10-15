-- =====================================================
-- DAIRY CONNECTION PLATFORM - ESSENTIAL TABLES
-- Focus: Farmer-Consumer Connection & Communication
-- =====================================================

-- 1. FARMER REQUESTS TABLE (Connection Requests)
CREATE TABLE IF NOT EXISTS farmer_requests (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_interest VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    preferred_time VARCHAR(100),
    contact_method VARCHAR(50) DEFAULT 'phone',
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farmer_response TEXT,
    response_at TIMESTAMP
);

-- 2. ACTIVE CONNECTIONS TABLE (Established Relationships)
CREATE TABLE IF NOT EXISTS active_connections (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    farmer_request_id INTEGER REFERENCES farmer_requests(id) ON DELETE SET NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    connection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique connection per consumer-farmer pair
    UNIQUE(consumer_id, farmer_id)
);

-- 3. CONSUMER ACTIVITY SUMMARY (Simple Analytics)
CREATE TABLE IF NOT EXISTS consumer_activity_summary (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_requests_sent INTEGER DEFAULT 0,
    accepted_requests INTEGER DEFAULT 0,
    rejected_requests INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Simple success rate calculation
    request_success_rate DECIMAL(5,2) DEFAULT 0.00,
    
    UNIQUE(consumer_id)
);

-- 4. FARMER ACTIVITY SUMMARY (Farmer Analytics)
CREATE TABLE IF NOT EXISTS farmer_activity_summary (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    total_requests_received INTEGER DEFAULT 0,
    accepted_requests INTEGER DEFAULT 0,
    rejected_requests INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Farmer response rate
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    
    UNIQUE(farmer_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Farmer Requests Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_requests_farmer_id ON farmer_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_consumer_id ON farmer_requests(consumer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_status ON farmer_requests(status);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_created_at ON farmer_requests(created_at);

-- Active Connections Indexes
CREATE INDEX IF NOT EXISTS idx_active_connections_consumer_id ON active_connections(consumer_id);
CREATE INDEX IF NOT EXISTS idx_active_connections_farmer_id ON active_connections(farmer_id);
CREATE INDEX IF NOT EXISTS idx_active_connections_is_active ON active_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_active_connections_last_interaction ON active_connections(last_interaction_at);

-- Consumer Activity Indexes
CREATE INDEX IF NOT EXISTS idx_consumer_activity_consumer_id ON consumer_activity_summary(consumer_id);
CREATE INDEX IF NOT EXISTS idx_consumer_activity_last_activity ON consumer_activity_summary(last_activity_at);

-- Farmer Activity Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_activity_farmer_id ON farmer_activity_summary(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_activity_last_activity ON farmer_activity_summary(last_activity_at);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE farmer_requests IS 'Connection requests from consumers to farmers';
COMMENT ON TABLE active_connections IS 'Established connections between consumers and farmers';
COMMENT ON TABLE consumer_activity_summary IS 'Consumer engagement and success metrics';
COMMENT ON TABLE farmer_activity_summary IS 'Farmer response and connection metrics';
