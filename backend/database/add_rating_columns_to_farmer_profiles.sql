-- =====================================================
-- ADD RATING COLUMNS TO FARMER_PROFILES TABLE
-- Adds aggregated rating data to farmer profiles for quick access
-- =====================================================

-- Add rating-related columns to farmer_profiles table
ALTER TABLE farmer_profiles 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_rating_sum INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_review_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb;

-- Add constraints for data integrity
ALTER TABLE farmer_profiles 
ADD CONSTRAINT check_average_rating_range CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
ADD CONSTRAINT check_total_reviews_positive CHECK (total_reviews >= 0),
ADD CONSTRAINT check_total_rating_sum_positive CHECK (total_rating_sum >= 0);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_average_rating ON farmer_profiles(average_rating);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_total_reviews ON farmer_profiles(total_reviews);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_last_review ON farmer_profiles(last_review_at);


-- =====================================================
-- FUNCTION TO UPDATE FARMER RATING STATISTICS
-- =====================================================

-- Function to recalculate farmer rating statistics
CREATE OR REPLACE FUNCTION update_farmer_rating_stats(farmer_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews_count INTEGER;
    total_rating_sum_value INTEGER;
    last_review_timestamp TIMESTAMP;
    rating_dist JSONB;
BEGIN
    -- Calculate statistics from farmer_reviews table
    SELECT 
        COALESCE(AVG(rating), 0.00),
        COUNT(*),
        COALESCE(SUM(rating), 0),
        MAX(created_at)
    INTO 
        avg_rating,
        total_reviews_count,
        total_rating_sum_value,
        last_review_timestamp
    FROM farmer_reviews 
    WHERE farmer_id = farmer_id_param 
    AND review_status = 'active';
    
    -- Calculate rating distribution
    SELECT jsonb_build_object(
        '1', COALESCE((SELECT COUNT(*) FROM farmer_reviews WHERE farmer_id = farmer_id_param AND rating = 1 AND review_status = 'active'), 0),
        '2', COALESCE((SELECT COUNT(*) FROM farmer_reviews WHERE farmer_id = farmer_id_param AND rating = 2 AND review_status = 'active'), 0),
        '3', COALESCE((SELECT COUNT(*) FROM farmer_reviews WHERE farmer_id = farmer_id_param AND rating = 3 AND review_status = 'active'), 0),
        '4', COALESCE((SELECT COUNT(*) FROM farmer_reviews WHERE farmer_id = farmer_id_param AND rating = 4 AND review_status = 'active'), 0),
        '5', COALESCE((SELECT COUNT(*) FROM farmer_reviews WHERE farmer_id = farmer_id_param AND rating = 5 AND review_status = 'active'), 0)
    ) INTO rating_dist;
    
    -- Update farmer_profiles table
    UPDATE farmer_profiles 
    SET 
        average_rating = avg_rating,
        total_reviews = total_reviews_count,
        total_rating_sum = total_rating_sum_value,
        last_review_at = last_review_timestamp,
        rating_distribution = rating_dist,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = farmer_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS TO AUTOMATICALLY UPDATE RATING STATISTICS
-- =====================================================

-- Trigger function to update farmer rating stats when reviews change
CREATE OR REPLACE FUNCTION trigger_update_farmer_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the affected farmer
    IF TG_OP = 'DELETE' THEN
        PERFORM update_farmer_rating_stats(OLD.farmer_id);
        RETURN OLD;
    ELSE
        PERFORM update_farmer_rating_stats(NEW.farmer_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_farmer_reviews_update_stats ON farmer_reviews;
CREATE TRIGGER trigger_farmer_reviews_update_stats
    AFTER INSERT OR UPDATE OR DELETE ON farmer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_farmer_rating_stats();

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Update all existing farmers with current review statistics
-- (This will be empty initially but useful for future data migration)
DO $$
DECLARE
    farmer_record RECORD;
BEGIN
    FOR farmer_record IN SELECT id FROM farmer_profiles LOOP
        PERFORM update_farmer_rating_stats(farmer_record.id);
    END LOOP;
END $$;
