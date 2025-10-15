import { pool } from "../config/database/database.js";

// Initialize consumer activity summary for new consumer
export const initializeConsumerActivity = async (consumerId) => {
  try {
    await pool.query(`
      INSERT INTO consumer_activity_summary (consumer_id, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      ON CONFLICT (consumer_id) DO NOTHING
    `, [consumerId]);
    
    console.log(`Consumer activity initialized for user ${consumerId}`);
  } catch (error) {
    console.error("Error initializing consumer activity:", error);
  }
};

// Update activity when consumer sends request
export const trackRequestSent = async (consumerId, farmerId) => {
  try {
    await pool.query(`
      INSERT INTO consumer_activity_summary (consumer_id, total_requests_sent, pending_requests, last_request_sent_at, last_activity_at, updated_at)
      VALUES ($1, 1, 1, NOW(), NOW(), NOW())
      ON CONFLICT (consumer_id) DO UPDATE SET
        total_requests_sent = consumer_activity_summary.total_requests_sent + 1,
        pending_requests = consumer_activity_summary.pending_requests + 1,
        last_request_sent_at = NOW(),
        last_activity_at = NOW(),
        updated_at = NOW()
    `, [consumerId]);
    
    console.log(`Request sent tracked for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error tracking request sent:", error);
  }
};

// Update activity when farmer accepts request
export const trackRequestAccepted = async (consumerId, farmerId) => {
  try {
    await pool.query(`
      UPDATE consumer_activity_summary SET
        accepted_requests = accepted_requests + 1,
        pending_requests = pending_requests - 1,
        active_connections = active_connections + 1,
        total_farmers_connected = (
          SELECT COUNT(DISTINCT farmer_id) 
          FROM active_connections 
          WHERE consumer_id = $1 AND is_active = true
        ),
        request_success_rate = ROUND(
          (accepted_requests::DECIMAL / NULLIF(total_requests_sent, 0)) * 100, 2
        ),
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE consumer_id = $1
    `, [consumerId]);
    
    console.log(`Request accepted tracked for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error tracking request accepted:", error);
  }
};

// Update activity when farmer rejects request
export const trackRequestRejected = async (consumerId, farmerId) => {
  try {
    await pool.query(`
      UPDATE consumer_activity_summary SET
        rejected_requests = rejected_requests + 1,
        pending_requests = pending_requests - 1,
        request_success_rate = ROUND(
          (accepted_requests::DECIMAL / NULLIF(total_requests_sent, 0)) * 100, 2
        ),
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE consumer_id = $1
    `, [consumerId]);
    
    console.log(`Request rejected tracked for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error tracking request rejected:", error);
  }
};

// Update activity when order is placed
export const trackOrderPlaced = async (consumerId, orderAmount) => {
  try {
    await pool.query(`
      UPDATE consumer_activity_summary SET
        total_orders_placed = total_orders_placed + 1,
        total_spent = total_spent + $2,
        average_orders_per_connection = ROUND(
          total_orders_placed::DECIMAL / NULLIF(active_connections, 0), 2
        ),
        last_order_placed_at = NOW(),
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE consumer_id = $1
    `, [consumerId, orderAmount || 0]);
    
    console.log(`Order placed tracked for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error tracking order placed:", error);
  }
};

// Update activity when review is given
export const trackReviewGiven = async (consumerId) => {
  try {
    await pool.query(`
      UPDATE consumer_activity_summary SET
        total_reviews_given = total_reviews_given + 1,
        last_review_given_at = NOW(),
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE consumer_id = $1
    `, [consumerId]);
    
    console.log(`Review given tracked for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error tracking review given:", error);
  }
};

// Update user tier based on activity
export const updateUserTier = async (consumerId) => {
  try {
    const result = await pool.query(`
      SELECT 
        total_orders_placed,
        total_spent,
        request_success_rate,
        active_connections
      FROM consumer_activity_summary 
      WHERE consumer_id = $1
    `, [consumerId]);
    
    if (result.rows.length === 0) return;
    
    const activity = result.rows[0];
    let newTier = 'regular';
    
    // Determine tier based on activity
    if (activity.total_orders_placed >= 50 && activity.total_spent >= 5000 && activity.request_success_rate >= 80) {
      newTier = 'vip';
    } else if (activity.total_orders_placed >= 20 && activity.total_spent >= 2000 && activity.request_success_rate >= 70) {
      newTier = 'premium';
    }
    
    await pool.query(`
      UPDATE consumer_activity_summary SET
        user_tier = $2,
        updated_at = NOW()
      WHERE consumer_id = $1
    `, [consumerId, newTier]);
    
    console.log(`User tier updated to ${newTier} for consumer ${consumerId}`);
  } catch (error) {
    console.error("Error updating user tier:", error);
  }
};

// Get consumer analytics
export const getConsumerAnalytics = async (consumerId) => {
  try {
    const result = await pool.query(`
      SELECT 
        total_requests_sent,
        accepted_requests,
        rejected_requests,
        pending_requests,
        active_connections,
        total_orders_placed,
        total_reviews_given,
        total_farmers_connected,
        request_success_rate,
        average_orders_per_connection,
        total_spent,
        user_tier,
        last_activity_at,
        days_since_last_activity
      FROM consumer_activity_summary 
      WHERE consumer_id = $1
    `, [consumerId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting consumer analytics:", error);
    return null;
  }
};

// Update activity status (for daily/weekly jobs)
export const updateActivityStatus = async () => {
  try {
    await pool.query(`
      UPDATE consumer_activity_summary SET
        days_since_last_activity = EXTRACT(DAYS FROM NOW() - last_activity_at),
        is_active_user = CASE 
          WHEN EXTRACT(DAYS FROM NOW() - last_activity_at) <= 30 THEN true
          ELSE false
        END,
        updated_at = NOW()
    `);
    
    console.log("Activity status updated for all consumers");
  } catch (error) {
    console.error("Error updating activity status:", error);
  }
};
