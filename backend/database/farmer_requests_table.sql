-- Create farmer_requests table
CREATE TABLE IF NOT EXISTS farmer_requests (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    consumer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_interest VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    preferred_time VARCHAR(100),
    contact_method VARCHAR(50) DEFAULT 'phone',
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farmer_response TEXT,
    response_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmer_requests_farmer_id ON farmer_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_consumer_id ON farmer_requests(consumer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_status ON farmer_requests(status);
CREATE INDEX IF NOT EXISTS idx_farmer_requests_created_at ON farmer_requests(created_at);

-- Add comments for documentation
COMMENT ON TABLE farmer_requests IS 'Stores requests from consumers to farmers for dairy products';
COMMENT ON COLUMN farmer_requests.farmer_id IS 'Reference to the farmer who received the request';
COMMENT ON COLUMN farmer_requests.consumer_id IS 'Reference to the consumer who sent the request';
COMMENT ON COLUMN farmer_requests.product_interest IS 'Type of product the consumer is interested in';
COMMENT ON COLUMN farmer_requests.quantity IS 'Amount/quantity requested by consumer';
COMMENT ON COLUMN farmer_requests.preferred_time IS 'Consumer preferred time for delivery/contact';
COMMENT ON COLUMN farmer_requests.contact_method IS 'Preferred method of contact (phone, whatsapp, email)';
COMMENT ON COLUMN farmer_requests.message IS 'Additional message from consumer';
COMMENT ON COLUMN farmer_requests.status IS 'Current status of the request';
COMMENT ON COLUMN farmer_requests.farmer_response IS 'Response message from farmer';
COMMENT ON COLUMN farmer_requests.response_at IS 'Timestamp when farmer responded';
