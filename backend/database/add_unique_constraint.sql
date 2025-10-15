-- Add unique constraint to prevent duplicate connections
-- This ensures one active connection per consumer-farmer pair

-- First, remove any existing duplicate connections
DELETE FROM active_connections 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM active_connections 
    GROUP BY consumer_id, farmer_id
);

-- Add unique constraint
ALTER TABLE active_connections 
ADD CONSTRAINT unique_consumer_farmer_connection 
UNIQUE (consumer_id, farmer_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT unique_consumer_farmer_connection ON active_connections 
IS 'Ensures only one active connection per consumer-farmer pair';
