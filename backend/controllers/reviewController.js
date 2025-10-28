import { pool } from "../config/database/database.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const {
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
      is_anonymous = false
    } = req.body;

    // Validate required fields
    if (!farmer_id || !consumer_id || !rating) {
      return res.status(400).json({
        message: "Farmer ID, Consumer ID, and rating are required"
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Check if consumer has an active connection with the farmer
    const connectionCheck = await pool.query(
      `SELECT id FROM active_connections 
       WHERE consumer_id = $1 AND farmer_id = $2 AND is_active = true`,
      [consumer_id, farmer_id]
    );

    if (connectionCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You can only review farmers you have an active connection with"
      });
    }

    // Check if consumer has already reviewed this farmer
    const existingReview = await pool.query(
      `SELECT id FROM farmer_reviews 
       WHERE consumer_id = $1 AND farmer_id = $2`,
      [consumer_id, farmer_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        message: "You have already reviewed this farmer"
      });
    }

    // Insert the review
    const result = await pool.query(
      `INSERT INTO farmer_reviews (
        farmer_id, consumer_id, active_connection_id, rating, review_title, 
        review_text, product_quality_rating, delivery_rating, 
        communication_rating, value_for_money_rating, is_verified_purchase, 
        is_anonymous, review_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        farmer_id,
        consumer_id,
        active_connection_id || connectionCheck.rows[0].id,
        rating,
        review_title,
        review_text,
        product_quality_rating,
        delivery_rating,
        communication_rating,
        value_for_money_rating,
        true, // is_verified_purchase since they have active connection
        is_anonymous,
        'active'
      ]
    );

    res.status(201).json({
      message: "Review added successfully",
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get reviews for a specific farmer
export const getFarmerReviews = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 10, sort_by = 'created_at', order = 'desc', rating_filter } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        fr.*,
        u.name as consumer_name,
        u.email as consumer_email,
        frr.response_text as farmer_response,
        frr.created_at as response_date,
        (SELECT COUNT(*) FROM review_helpfulness rh WHERE rh.review_id = fr.id AND rh.is_helpful = true) as helpful_count
      FROM farmer_reviews fr
      JOIN users u ON fr.consumer_id = u.id
      LEFT JOIN farmer_review_responses frr ON fr.id = frr.review_id
      WHERE fr.farmer_id = $1 AND fr.review_status = 'active'
    `;

    const queryParams = [farmerId];
    let paramCount = 1;

    // Add rating filter if provided
    if (rating_filter) {
      paramCount++;
      query += ` AND fr.rating = $${paramCount}`;
      queryParams.push(rating_filter);
    }

    // Add sorting
    const validSortFields = ['created_at', 'rating', 'helpful_count'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY fr.${sortField} ${sortOrder}`;

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM farmer_reviews fr 
      WHERE fr.farmer_id = $1 AND fr.review_status = 'active'
    `;
    const countParams = [farmerId];

    if (rating_filter) {
      countQuery += ` AND fr.rating = $2`;
      countParams.push(rating_filter);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalReviews = parseInt(countResult.rows[0].total);

    res.json({
      reviews: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalReviews / limit),
        total_reviews: totalReviews,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching farmer reviews:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get reviews written by a specific consumer
export const getConsumerReviews = async (req, res) => {
  try {
    // Get consumer ID from authenticated user instead of URL parameter
    const consumerId = req.user.user_id;
    const { page = 1, limit = 10 } = req.query;

    console.log('getConsumerReviews called with:', { consumerId, page, limit });
    console.log('req.user:', req.user);

    // Validate consumerId
    if (!consumerId || consumerId === 'null' || consumerId === 'undefined') {
      return res.status(400).json({
        message: "Invalid consumer ID from authentication"
      });
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        fr.*,
        u.name as farmer_name,
        fp.farm_name,
        frr.response_text as farmer_response,
        frr.created_at as response_date
      FROM farmer_reviews fr
      JOIN farmer_profiles fp ON fr.farmer_id = fp.id
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN farmer_review_responses frr ON fr.id = frr.review_id
      WHERE fr.consumer_id = $1 AND fr.review_status = 'active'
      ORDER BY fr.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [consumerId, parseInt(limit), offset]);

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM farmer_reviews WHERE consumer_id = $1 AND review_status = 'active'`,
      [consumerId]
    );

    const totalReviews = parseInt(countResult.rows[0].total);

    res.json({
      reviews: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalReviews / limit),
        total_reviews: totalReviews,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching consumer reviews:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add farmer response to a review
export const addFarmerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { farmer_id, response_text } = req.body;

    if (!response_text || !farmer_id) {
      return res.status(400).json({
        message: "Response text and farmer ID are required"
      });
    }

    // Verify the review exists and belongs to this farmer
    const reviewCheck = await pool.query(
      `SELECT id FROM farmer_reviews WHERE id = $1 AND farmer_id = $2`,
      [reviewId, farmer_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to respond"
      });
    }

    // Check if farmer has already responded
    const existingResponse = await pool.query(
      `SELECT id FROM farmer_review_responses WHERE review_id = $1`,
      [reviewId]
    );

    if (existingResponse.rows.length > 0) {
      return res.status(400).json({
        message: "You have already responded to this review"
      });
    }

    // Insert the response
    const result = await pool.query(
      `INSERT INTO farmer_review_responses (review_id, farmer_id, response_text)
       VALUES ($1, $2, $3) RETURNING *`,
      [reviewId, farmer_id, response_text]
    );

    res.status(201).json({
      message: "Response added successfully",
      response: result.rows[0]
    });

  } catch (error) {
    console.error("Error adding farmer response:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Mark review as helpful/unhelpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { consumer_id, is_helpful } = req.body;

    if (typeof is_helpful !== 'boolean') {
      return res.status(400).json({
        message: "is_helpful must be a boolean value"
      });
    }

    // Check if review exists
    const reviewCheck = await pool.query(
      `SELECT id FROM farmer_reviews WHERE id = $1 AND review_status = 'active'`,
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Insert or update helpfulness vote
    const result = await pool.query(
      `INSERT INTO review_helpfulness (review_id, consumer_id, is_helpful)
       VALUES ($1, $2, $3)
       ON CONFLICT (review_id, consumer_id)
       DO UPDATE SET is_helpful = $3, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [reviewId, consumer_id, is_helpful]
    );

    res.json({
      message: "Review helpfulness updated successfully",
      helpfulness: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating review helpfulness:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get top-rated farmers
export const getTopRatedFarmers = async (req, res) => {
  try {
    const { limit = 10, min_reviews = 5 } = req.query;

    const query = `
      SELECT 
        fp.id,
        fp.name,
        fp.farm_name,
        fp.average_rating,
        fp.total_reviews,
        fp.rating_distribution,
        fp.last_review_at
      FROM farmer_profiles fp
      WHERE fp.total_reviews >= $1
      ORDER BY fp.average_rating DESC, fp.total_reviews DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [parseInt(min_reviews), parseInt(limit)]);

    res.json({
      farmers: result.rows
    });

  } catch (error) {
    console.error("Error fetching top-rated farmers:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update a review (if allowed)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { consumer_id, rating, review_title, review_text, product_quality_rating, delivery_rating, communication_rating, value_for_money_rating } = req.body;

    // Verify the review exists and belongs to this consumer
    const reviewCheck = await pool.query(
      `SELECT id, created_at FROM farmer_reviews 
       WHERE id = $1 AND consumer_id = $2 AND review_status = 'active'`,
      [reviewId, consumer_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to update it"
      });
    }

    // Check if review is too old to update (e.g., more than 24 hours)
    const reviewAge = new Date() - new Date(reviewCheck.rows[0].created_at);
    const maxUpdateAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (reviewAge > maxUpdateAge) {
      return res.status(400).json({
        message: "Review is too old to update"
      });
    }

    // Update the review
    const result = await pool.query(
      `UPDATE farmer_reviews 
       SET rating = $1, review_title = $2, review_text = $3, 
           product_quality_rating = $4, delivery_rating = $5, 
           communication_rating = $6, value_for_money_rating = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [rating, review_title, review_text, product_quality_rating, delivery_rating, communication_rating, value_for_money_rating, reviewId]
    );

    res.json({
      message: "Review updated successfully",
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Soft delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const consumer_id = req.user.user_id; // Get from authentication

    console.log('deleteReview called with:', { reviewId, consumer_id });

    // Verify the review exists and belongs to this consumer
    const reviewCheck = await pool.query(
      `SELECT id FROM farmer_reviews 
       WHERE id = $1 AND consumer_id = $2 AND review_status = 'active'`,
      [reviewId, consumer_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to delete it"
      });
    }

    // Soft delete by changing status
    await pool.query(
      `UPDATE farmer_reviews 
       SET review_status = 'deleted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [reviewId]
    );

    res.json({
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get farmer review statistics
export const getFarmerReviewStats = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const query = `
      SELECT 
        fp.average_rating,
        fp.total_reviews,
        fp.rating_distribution,
        fp.last_review_at,
        fas.positive_reviews_count,
        fas.negative_reviews_count,
        fas.review_response_rate,
        fas.total_review_responses
      FROM farmer_profiles fp
      LEFT JOIN farmer_activity_summary fas ON fp.id = fas.farmer_id
      WHERE fp.id = $1
    `;

    const result = await pool.query(query, [farmerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found"
      });
    }

    res.json({
      stats: result.rows[0]
    });

  } catch (error) {
    console.error("Error fetching farmer review stats:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
