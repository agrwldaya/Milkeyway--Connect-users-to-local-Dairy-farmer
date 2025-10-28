-- =====================================================
-- UPDATE FARMER ACTIVITY SUMMARY FOR REVIEWS
-- Adds review-related metrics to farmer activity tracking
-- =====================================================

-- Add review-related columns to farmer_activity_summary table
ALTER TABLE farmer_activity_summary 
ADD COLUMN IF NOT EXISTS total_reviews_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating_received DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_rating_sum_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_review_received_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviews_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_this_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS positive_reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS negative_reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_response_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_review_responses INTEGER DEFAULT 0;

-- Add constraints for data integrity
ALTER TABLE farmer_activity_summary 
ADD CONSTRAINT check_average_rating_received_range CHECK (average_rating_received >= 0.00 AND average_rating_received <= 5.00),
ADD CONSTRAINT check_total_reviews_received_positive CHECK (total_reviews_received >= 0),
ADD CONSTRAINT check_total_rating_sum_received_positive CHECK (total_rating_sum_received >= 0),
ADD CONSTRAINT check_review_response_rate_range CHECK (review_response_rate >= 0.00 AND review_response_rate <= 100.00);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmer_activity_average_rating ON farmer_activity_summary(average_rating_received);
CREATE INDEX IF NOT EXISTS idx_farmer_activity_total_reviews ON farmer_activity_summary(total_reviews_received);
CREATE INDEX IF NOT EXISTS idx_farmer_activity_last_review ON farmer_activity_summary(last_review_received_at);
CREATE INDEX IF NOT EXISTS idx_farmer_activity_review_response_rate ON farmer_activity_summary(review_response_rate);


-- =====================================================
-- FUNCTION TO UPDATE FARMER REVIEW ACTIVITY STATISTICS
-- =====================================================

-- Function to recalculate farmer review activity statistics
CREATE OR REPLACE FUNCTION update_farmer_review_activity_stats(farmer_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    total_reviews_count INTEGER;
    avg_rating_value DECIMAL(3,2);
    total_rating_sum_value INTEGER;
    last_review_timestamp TIMESTAMP;
    reviews_this_month_count INTEGER;
    reviews_this_week_count INTEGER;
    positive_reviews_count_value INTEGER;
    negative_reviews_count_value INTEGER;
    total_responses_count INTEGER;
    response_rate_value DECIMAL(5,2);
BEGIN
    -- Calculate basic review statistics
    SELECT 
        COUNT(*),
        COALESCE(AVG(rating), 0.00),
        COALESCE(SUM(rating), 0),
        MAX(created_at)
    INTO 
        total_reviews_count,
        avg_rating_value,
        total_rating_sum_value,
        last_review_timestamp
    FROM farmer_reviews 
    WHERE farmer_id = farmer_id_param 
    AND review_status = 'active';
    
    -- Calculate monthly and weekly review counts
    SELECT 
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)),
        COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE))
    INTO 
        reviews_this_month_count,
        reviews_this_week_count
    FROM farmer_reviews 
    WHERE farmer_id = farmer_id_param 
    AND review_status = 'active';
    
    -- Calculate positive and negative review counts
    SELECT 
        COUNT(*) FILTER (WHERE rating >= 4),
        COUNT(*) FILTER (WHERE rating <= 2)
    INTO 
        positive_reviews_count_value,
        negative_reviews_count_value
    FROM farmer_reviews 
    WHERE farmer_id = farmer_id_param 
    AND review_status = 'active';
    
    -- Calculate response statistics
    SELECT 
        COUNT(*),
        CASE 
            WHEN total_reviews_count > 0 THEN 
                ROUND((COUNT(*)::DECIMAL / total_reviews_count) * 100, 2)
            ELSE 0.00
        END
    INTO 
        total_responses_count,
        response_rate_value
    FROM farmer_review_responses frr
    JOIN farmer_reviews fr ON frr.review_id = fr.id
    WHERE fr.farmer_id = farmer_id_param 
    AND fr.review_status = 'active';
    
    -- Update farmer_activity_summary table
    UPDATE farmer_activity_summary 
    SET 
        total_reviews_received = total_reviews_count,
        average_rating_received = avg_rating_value,
        total_rating_sum_received = total_rating_sum_value,
        last_review_received_at = last_review_timestamp,
        reviews_this_month = reviews_this_month_count,
        reviews_this_week = reviews_this_week_count,
        positive_reviews_count = positive_reviews_count_value,
        negative_reviews_count = negative_reviews_count_value,
        review_response_rate = response_rate_value,
        total_review_responses = total_responses_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE farmer_id = farmer_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS TO AUTOMATICALLY UPDATE REVIEW ACTIVITY STATS
-- =====================================================

-- Trigger function to update farmer review activity stats when reviews or responses change
CREATE OR REPLACE FUNCTION trigger_update_farmer_review_activity_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the affected farmer
    IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'farmer_reviews' THEN
            PERFORM update_farmer_review_activity_stats(OLD.farmer_id);
        ELSIF TG_TABLE_NAME = 'farmer_review_responses' THEN
            PERFORM update_farmer_review_activity_stats(OLD.farmer_id);
        END IF;
        RETURN OLD;
    ELSE
        IF TG_TABLE_NAME = 'farmer_reviews' THEN
            PERFORM update_farmer_review_activity_stats(NEW.farmer_id);
        ELSIF TG_TABLE_NAME = 'farmer_review_responses' THEN
            PERFORM update_farmer_review_activity_stats(NEW.farmer_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for farmer_reviews table
DROP TRIGGER IF EXISTS trigger_farmer_reviews_update_activity_stats ON farmer_reviews;
CREATE TRIGGER trigger_farmer_reviews_update_activity_stats
    AFTER INSERT OR UPDATE OR DELETE ON farmer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_farmer_review_activity_stats();

-- Create triggers for farmer_review_responses table
DROP TRIGGER IF EXISTS trigger_farmer_review_responses_update_activity_stats ON farmer_review_responses;
CREATE TRIGGER trigger_farmer_review_responses_update_activity_stats
    AFTER INSERT OR UPDATE OR DELETE ON farmer_review_responses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_farmer_review_activity_stats();

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Update all existing farmers with current review activity statistics
DO $$
DECLARE
    farmer_record RECORD;
BEGIN
    FOR farmer_record IN SELECT id FROM farmer_profiles LOOP
        PERFORM update_farmer_review_activity_stats(farmer_record.id);
    END LOOP;
END $$;
