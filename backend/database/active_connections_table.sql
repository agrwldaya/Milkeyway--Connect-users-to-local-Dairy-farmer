-- Create active_connections table (updated to work with farmer_requests)
CREATE TABLE IF NOT EXISTS active_connections (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    farmer_request_id INTEGER REFERENCES farmer_requests(id) ON DELETE SET NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    connection_notes TEXT,
    total_orders INTEGER DEFAULT 0,
    last_order_at TIMESTAMP,
    relationship_type VARCHAR(50) DEFAULT 'regular' CHECK (relationship_type IN ('regular', 'premium', 'subscription')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_active_connections_consumer_id ON active_connections(consumer_id);
CREATE INDEX IF NOT EXISTS idx_active_connections_farmer_id ON active_connections(farmer_id);
CREATE INDEX IF NOT EXISTS idx_active_connections_farmer_request_id ON active_connections(farmer_request_id);
CREATE INDEX IF NOT EXISTS idx_active_connections_is_active ON active_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_active_connections_last_interaction ON active_connections(last_interaction_at);

-- Add comments for documentation
COMMENT ON TABLE active_connections IS 'Tracks established relationships between consumers and farmers';
COMMENT ON COLUMN active_connections.consumer_id IS 'Reference to the consumer in the relationship';
COMMENT ON COLUMN active_connections.farmer_id IS 'Reference to the farmer in the relationship';
COMMENT ON COLUMN active_connections.farmer_request_id IS 'Reference to the original farmer request that started this connection';
COMMENT ON COLUMN active_connections.connected_at IS 'When the relationship was established';
COMMENT ON COLUMN active_connections.last_interaction_at IS 'Last time there was activity in this relationship';
COMMENT ON COLUMN active_connections.is_active IS 'Whether the relationship is currently active';
COMMENT ON COLUMN active_connections.connection_notes IS 'Additional notes about the relationship';
COMMENT ON COLUMN active_connections.total_orders IS 'Total number of orders placed in this relationship';
COMMENT ON COLUMN active_connections.last_order_at IS 'Timestamp of the most recent order';
COMMENT ON COLUMN active_connections.relationship_type IS 'Type of relationship (regular, premium, subscription)';
