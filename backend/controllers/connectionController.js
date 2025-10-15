import { pool } from "../config/database/database.js";

// =====================================================
// CONSUMER CONNECTION FUNCTIONS
// =====================================================

// Send connection request to farmer
export const sendConnectionRequest = async (req, res) => {
  try {
    const { farmerId, productInterest, quantity, preferredTime, contactMethod, message } = req.body;
    const consumerId = req.user.user_id;

    // Validate required fields
    if (!farmerId || !productInterest || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Farmer ID, product interest, and quantity are required" 
      });
    }

    // Check if farmer exists and is approved
    const farmerCheck = await pool.query(
      "SELECT id FROM farmer_profiles WHERE id = $1 AND status = 'approved'",
      [farmerId]
    );

    if (farmerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer not found or not approved" 
      });
    }

    // Check if connection already exists
    const existingConnection = await pool.query(
      "SELECT id FROM active_connections WHERE consumer_id = $1 AND farmer_id = $2 AND is_active = true",
      [consumerId, farmerId]
    );

    if (existingConnection.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "You are already connected to this farmer" 
      });
    }

    // Insert connection request
    const insertQuery = `
      INSERT INTO farmer_requests (
        farmer_id, consumer_id, product_interest, quantity, 
        preferred_time, contact_method, message, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      farmerId, consumerId, productInterest, quantity,
      preferredTime || null, contactMethod || 'phone', message || null
    ]);

    const requestId = result.rows[0].id;

    // Update consumer activity
    await pool.query(`
      INSERT INTO consumer_activity_summary (consumer_id, total_requests_sent, last_activity_at, updated_at)
      VALUES ($1, 1, NOW(), NOW())
      ON CONFLICT (consumer_id) DO UPDATE SET
        total_requests_sent = consumer_activity_summary.total_requests_sent + 1,
        last_activity_at = NOW(),
        updated_at = NOW()
    `, [consumerId]);

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      requestId: requestId
    });

  } catch (error) {
    console.error("Send Connection Request Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get consumer's active connections
export const getMyConnections = async (req, res) => {
  try {
    const consumerId = req.user.user_id;

    const connectionsQuery = `
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.connection_notes,
        f.id as farmer_id,
        f.farm_name,
        f.address,
        f.delivery_radius_km,
        u.name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone,
        fd.farm_image_url,
        fd.farmer_image_url
      FROM active_connections ac
      JOIN farmer_profiles f ON ac.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      LEFT JOIN farmer_docs fd ON f.id = fd.farmer_id
      WHERE ac.consumer_id = $1 AND ac.is_active = true
      ORDER BY ac.connected_at DESC
    `;

    const result = await pool.query(connectionsQuery, [consumerId]);

    res.status(200).json({
      success: true,
      connections: result.rows
    });

  } catch (error) {
    console.error("Get My Connections Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get consumer's sent requests
export const getConnectionRequests = async (req, res) => {
  try {
    const consumerId = req.user.user_id;

    const requestsQuery = `
      SELECT 
        fr.id,
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message,
        fr.status,
        fr.created_at,
        fr.farmer_response,
        fr.response_at,
        f.farm_name,
        u.name as farmer_name
      FROM farmer_requests fr
      JOIN farmer_profiles f ON fr.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE fr.consumer_id = $1
      ORDER BY fr.created_at DESC
    `;

    const result = await pool.query(requestsQuery, [consumerId]);

    res.status(200).json({
      success: true,
      requests: result.rows
    });

  } catch (error) {
    console.error("Get Connection Requests Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// FARMER CONNECTION FUNCTIONS
// =====================================================

// Get all requests for a farmer with filtering and pagination
export const getFarmerRequests = async (req, res) => {
  try {
    const farmerId = req.user.user_id;
    const { 
      status = '', 
      search = '', 
      limit = 20, 
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Get farmer profile ID
    const farmerProfile = await pool.query(
      "SELECT id FROM farmer_profiles WHERE user_id = $1",
      [farmerId]
    );

    if (farmerProfile.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer profile not found" 
      });
    }

    const farmerProfileId = farmerProfile.rows[0].id;

    // Build WHERE clause
    let whereClause = 'WHERE fr.farmer_id = $1';
    let queryParams = [farmerProfileId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND fr.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR fr.product_interest ILIKE $${paramCount} OR fr.message ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'status', 'product_interest', 'consumer_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const requestsQuery = `
      SELECT 
        fr.id,
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message,
        fr.status,
        fr.created_at,
        fr.farmer_response,
        fr.response_at,
        u.name as consumer_name,
        u.email as consumer_email,
        u.phone as consumer_phone
      FROM farmer_requests fr
      JOIN users u ON fr.consumer_id = u.id
      ${whereClause}
      ORDER BY fr.${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(requestsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM farmer_requests fr
      JOIN users u ON fr.consumer_id = u.id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get status summary
    const statusSummaryQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM farmer_requests fr
      WHERE fr.farmer_id = $1
      GROUP BY status
    `;

    const statusResult = await pool.query(statusSummaryQuery, [farmerProfileId]);
    const statusSummary = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      requests: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < total
      },
      status_summary: statusSummary
    });

  } catch (error) {
    console.error("Get Farmer Requests Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Respond to connection request
export const respondToConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, responseMessage } = req.body;

    const farmerId = req.user.user_id;
    console.log(requestId, action, responseMessage);
    
    if (!requestId || !action) {
      return res.status(400).json({ 
        success: false, 
        message: "Request ID and action are required" 
      });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Action must be 'accept' or 'reject'" 
      });
    }

    // Get farmer profile ID
    const farmerProfile = await pool.query(
      "SELECT id FROM farmer_profiles WHERE user_id = $1",
      [farmerId]
    );

    if (farmerProfile.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer profile not found" 
      });
    }

    const farmerProfileId = farmerProfile.rows[0].id;

    // Check if request exists and belongs to this farmer
    const requestCheck = await pool.query(
      "SELECT * FROM farmer_requests WHERE id = $1 AND farmer_id = $2",
      [requestId, farmerProfileId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Request not found or doesn't belong to this farmer" 
      });
    }

    const request = requestCheck.rows[0];

    // Update request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await pool.query(
      "UPDATE farmer_requests SET status = $1, farmer_response = $2, response_at = NOW() WHERE id = $3",
      [newStatus, responseMessage || null, requestId]
    );

    // If accepted, create active connection
    if (action === 'accept') {
      try {
        // Check if connection already exists
        const existingConnection = await pool.query(
          "SELECT id FROM active_connections WHERE consumer_id = $1 AND farmer_id = $2",
          [request.consumer_id, farmerProfileId]
        );

        if (existingConnection.rows.length === 0) {
          // Create new connection
          await pool.query(`
            INSERT INTO active_connections (
              consumer_id, farmer_id, farmer_request_id, 
              connected_at, is_active, connection_notes
            ) VALUES ($1, $2, $3, NOW(), true, $4)
          `, [request.consumer_id, farmerProfileId, requestId, responseMessage || null]);
        } else {
          // Update existing connection
          await pool.query(`
            UPDATE active_connections SET
              farmer_request_id = $3,
              last_interaction_at = NOW(),
              is_active = true,
              connection_notes = $4,
              updated_at = NOW()
            WHERE consumer_id = $1 AND farmer_id = $2
          `, [request.consumer_id, farmerProfileId, requestId, responseMessage || null]);
        }
        
        // Update consumer activity summary
        const consumerActivityExists = await pool.query(
          "SELECT id FROM consumer_activity_summary WHERE consumer_id = $1",
          [request.consumer_id]
        );

        if (consumerActivityExists.rows.length === 0) {
          // Create new consumer activity record
          await pool.query(`
            INSERT INTO consumer_activity_summary (
              consumer_id, accepted_requests, active_connections, 
              last_activity_at, updated_at
            ) VALUES ($1, 1, 1, NOW(), NOW())
          `, [request.consumer_id]);
        } else {
          // Update existing consumer activity
          await pool.query(`
            UPDATE consumer_activity_summary SET
              accepted_requests = accepted_requests + 1,
              active_connections = active_connections + 1,
              request_success_rate = ROUND(
                (accepted_requests::DECIMAL / NULLIF(total_requests_sent, 0)) * 100, 2
              ),
              last_activity_at = NOW(),
              updated_at = NOW()
            WHERE consumer_id = $1
          `, [request.consumer_id]);
        }

        // Update farmer activity summary
        const farmerActivityExists = await pool.query(
          "SELECT id FROM farmer_activity_summary WHERE farmer_id = $1",
          [farmerProfileId]
        );

        if (farmerActivityExists.rows.length === 0) {
          // Create new farmer activity record
          await pool.query(`
            INSERT INTO farmer_activity_summary (
              farmer_id, total_requests_received, accepted_requests, active_connections,
              last_activity_at, updated_at
            ) VALUES ($1, 1, 1, 1, NOW(), NOW())
          `, [farmerProfileId]);
        } else {
          // Update existing farmer activity
          await pool.query(`
            UPDATE farmer_activity_summary SET
              total_requests_received = total_requests_received + 1,
              accepted_requests = accepted_requests + 1,
              active_connections = active_connections + 1,
              response_rate = ROUND(
                (accepted_requests::DECIMAL / NULLIF(total_requests_received, 0)) * 100, 2
              ),
              last_activity_at = NOW(),
              updated_at = NOW()
            WHERE farmer_id = $1
          `, [farmerProfileId]);
        }
        
      } catch (error) {
        console.error("Error creating active connection:", error);
      }
    } else {
      // Update activity for rejected request
      const consumerActivityExists = await pool.query(
        "SELECT id FROM consumer_activity_summary WHERE consumer_id = $1",
        [request.consumer_id]
      );

      if (consumerActivityExists.rows.length === 0) {
        // Create new consumer activity record
        await pool.query(`
          INSERT INTO consumer_activity_summary (
            consumer_id, rejected_requests, last_activity_at, updated_at
          ) VALUES ($1, 1, NOW(), NOW())
        `, [request.consumer_id]);
      } else {
        // Update existing consumer activity
        await pool.query(`
          UPDATE consumer_activity_summary SET
            rejected_requests = rejected_requests + 1,
            request_success_rate = ROUND(
              (accepted_requests::DECIMAL / NULLIF(total_requests_sent, 0)) * 100, 2
            ),
            last_activity_at = NOW(),
            updated_at = NOW()
          WHERE consumer_id = $1
        `, [request.consumer_id]);
      }

      // Update farmer activity for rejected request
      const farmerActivityExists = await pool.query(
        "SELECT id FROM farmer_activity_summary WHERE farmer_id = $1",
        [farmerProfileId]
      );

      if (farmerActivityExists.rows.length === 0) {
        // Create new farmer activity record
        await pool.query(`
          INSERT INTO farmer_activity_summary (
            farmer_id, total_requests_received, rejected_requests,
            last_activity_at, updated_at
          ) VALUES ($1, 1, 1, NOW(), NOW())
        `, [farmerProfileId]);
      } else {
        // Update existing farmer activity
        await pool.query(`
          UPDATE farmer_activity_summary SET
            total_requests_received = total_requests_received + 1,
            rejected_requests = rejected_requests + 1,
            response_rate = ROUND(
              (accepted_requests::DECIMAL / NULLIF(total_requests_received, 0)) * 100, 2
            ),
            last_activity_at = NOW(),
            updated_at = NOW()
          WHERE farmer_id = $1
        `, [farmerProfileId]);
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${action}ed successfully`,
      requestId: requestId,
      status: newStatus
    });

  } catch (error) {
    console.error("Respond to Connection Request Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get farmer's active connections
export const getFarmerConnections = async (req, res) => {
  try {
    const farmerId = req.user.user_id;

    // Get farmer profile ID
    const farmerProfile = await pool.query(
      "SELECT id FROM farmer_profiles WHERE user_id = $1",
      [farmerId]
    );

    if (farmerProfile.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer profile not found" 
      });
    }

    const farmerProfileId = farmerProfile.rows[0].id;

    const connectionsQuery = `
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.connection_notes,
        u.id as consumer_id,
        u.name as consumer_name,
        u.email as consumer_email,
        u.phone as consumer_phone
      FROM active_connections ac
      JOIN users u ON ac.consumer_id = u.id
      WHERE ac.farmer_id = $1 AND ac.is_active = true
      ORDER BY ac.connected_at DESC
    `;

    const result = await pool.query(connectionsQuery, [farmerProfileId]);

    res.status(200).json({
      success: true,
      connections: result.rows
    });

  } catch (error) {
    console.error("Get Farmer Connections Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// CONNECTION MANAGEMENT FUNCTIONS
// =====================================================

// Update connection notes
export const updateConnectionNotes = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { notes } = req.body;
    const userId = req.user.user_id;

    // Check if user has access to this connection
    const connectionCheck = await pool.query(`
      SELECT id FROM active_connections 
      WHERE id = $1 AND (consumer_id = $2 OR farmer_id = $2) AND is_active = true
    `, [connectionId, userId]);

    if (connectionCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found or access denied" 
      });
    }

    await pool.query(
      "UPDATE active_connections SET connection_notes = $1, last_interaction_at = NOW() WHERE id = $2",
      [notes, connectionId]
    );

    res.status(200).json({
      success: true,
      message: "Connection notes updated successfully"
    });

  } catch (error) {
    console.error("Update Connection Notes Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Deactivate connection
export const deactivateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.user_id;

    // Check if user has access to this connection
    const connectionCheck = await pool.query(`
      SELECT id FROM active_connections 
      WHERE id = $1 AND (consumer_id = $2 OR farmer_id = $2) AND is_active = true
    `, [connectionId, userId]);

    if (connectionCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found or access denied" 
      });
    }

    await pool.query(
      "UPDATE active_connections SET is_active = false, last_interaction_at = NOW() WHERE id = $1",
      [connectionId]
    );

    res.status(200).json({
      success: true,
      message: "Connection deactivated successfully"
    });

  } catch (error) {
    console.error("Deactivate Connection Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// CONNECTION DETAILS & SEARCH FUNCTIONS
// =====================================================

// Get detailed connection information
export const getConnectionDetails = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.user_id;

    const connectionQuery = `
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.connection_notes,
        ac.relationship_type,
        ac.total_orders,
        ac.last_order_at,
        fr.id as request_id,
        fr.product_interest,
        fr.quantity,
        fr.preferred_time,
        fr.contact_method,
        fr.message,
        fr.farmer_response,
        fr.response_at,
        f.id as farmer_id,
        f.farm_name,
        f.address,
        f.delivery_radius_km,
        u_farmer.name as farmer_name,
        u_farmer.email as farmer_email,
        u_farmer.phone as farmer_phone,
        u_consumer.id as consumer_id,
        u_consumer.name as consumer_name,
        u_consumer.email as consumer_email,
        u_consumer.phone as consumer_phone,
        fd.farm_image_url,
        fd.farmer_image_url
      FROM active_connections ac
      JOIN farmer_profiles f ON ac.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      JOIN users u_consumer ON ac.consumer_id = u_consumer.id
      LEFT JOIN farmer_docs fd ON f.id = fd.farmer_id
      LEFT JOIN farmer_requests fr ON ac.farmer_request_id = fr.id
      WHERE ac.id = $1 AND (ac.consumer_id = $2 OR ac.farmer_id = $2) AND ac.is_active = true
    `;

    const result = await pool.query(connectionQuery, [connectionId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found or access denied" 
      });
    }

    res.status(200).json({
      success: true,
      connection: result.rows[0]
    });

  } catch (error) {
    console.error("Get Connection Details Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Search connections with filters
export const searchConnections = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      search = '', 
      status = 'active', 
      relationship_type = '', 
      limit = 20, 
      offset = 0,
      sort_by = 'connected_at',
      sort_order = 'DESC'
    } = req.query;

    let whereClause = '';
    let queryParams = [userId];
    let paramCount = 1;

    // Build WHERE clause based on filters
    if (search) {
      paramCount++;
      whereClause += ` AND (f.farm_name ILIKE $${paramCount} OR u_farmer.name ILIKE $${paramCount} OR u_consumer.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (relationship_type) {
      paramCount++;
      whereClause += ` AND ac.relationship_type = $${paramCount}`;
      queryParams.push(relationship_type);
    }

    if (status === 'active') {
      whereClause += ` AND ac.is_active = true`;
    } else if (status === 'inactive') {
      whereClause += ` AND ac.is_active = false`;
    }

    // Validate sort parameters
    const validSortColumns = ['connected_at', 'last_interaction_at', 'farm_name', 'consumer_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'connected_at';
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const searchQuery = `
      SELECT 
        ac.id as connection_id,
        ac.connected_at,
        ac.last_interaction_at,
        ac.relationship_type,
        ac.is_active,
        f.id as farmer_id,
        f.farm_name,
        f.address,
        u_farmer.name as farmer_name,
        u_consumer.id as consumer_id,
        u_consumer.name as consumer_name,
        fd.farm_image_url
      FROM active_connections ac
      JOIN farmer_profiles f ON ac.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      JOIN users u_consumer ON ac.consumer_id = u_consumer.id
      LEFT JOIN farmer_docs fd ON f.id = fd.farmer_id
      WHERE (ac.consumer_id = $1 OR ac.farmer_id = $1) ${whereClause}
      ORDER BY ac.${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(searchQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM active_connections ac
      JOIN farmer_profiles f ON ac.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      JOIN users u_consumer ON ac.consumer_id = u_consumer.id
      WHERE (ac.consumer_id = $1 OR ac.farmer_id = $1) ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      connections: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error("Search Connections Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get connection history/activity log
export const getConnectionHistory = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.user_id;

    // Verify user has access to this connection
    const connectionCheck = await pool.query(`
      SELECT id FROM active_connections 
      WHERE id = $1 AND (consumer_id = $2 OR farmer_id = $2)
    `, [connectionId, userId]);

    if (connectionCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Connection not found or access denied" 
      });
    }

    // Get connection history (requests, responses, interactions)
    const historyQuery = `
      SELECT 
        'request_sent' as activity_type,
        fr.created_at as activity_date,
        fr.product_interest,
        fr.quantity,
        fr.message as activity_description,
        u_consumer.name as actor_name,
        'consumer' as actor_type
      FROM farmer_requests fr
      JOIN users u_consumer ON fr.consumer_id = u_consumer.id
      WHERE fr.farmer_id = (SELECT farmer_id FROM active_connections WHERE id = $1)
        AND fr.consumer_id = (SELECT consumer_id FROM active_connections WHERE id = $1)
      
      UNION ALL
      
      SELECT 
        'request_responded' as activity_type,
        fr.response_at as activity_date,
        fr.product_interest,
        fr.quantity,
        fr.farmer_response as activity_description,
        u_farmer.name as actor_name,
        'farmer' as actor_type
      FROM farmer_requests fr
      JOIN farmer_profiles f ON fr.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      WHERE fr.farmer_id = (SELECT farmer_id FROM active_connections WHERE id = $1)
        AND fr.consumer_id = (SELECT consumer_id FROM active_connections WHERE id = $1)
        AND fr.response_at IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'connection_created' as activity_type,
        ac.connected_at as activity_date,
        NULL as product_interest,
        NULL as quantity,
        'Connection established' as activity_description,
        'System' as actor_name,
        'system' as actor_type
      FROM active_connections ac
      WHERE ac.id = $1
      
      ORDER BY activity_date DESC
    `;

    const result = await pool.query(historyQuery, [connectionId]);

    res.status(200).json({
      success: true,
      history: result.rows
    });

  } catch (error) {
    console.error("Get Connection History Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// BULK OPERATIONS
// =====================================================

// Bulk deactivate connections
export const bulkDeactivateConnections = async (req, res) => {
  try {
    const { connectionIds } = req.body;
    const userId = req.user.user_id;

    if (!connectionIds || !Array.isArray(connectionIds) || connectionIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Connection IDs array is required" 
      });
    }

    // Verify user has access to all connections
    const connectionCheck = await pool.query(`
      SELECT id FROM active_connections 
      WHERE id = ANY($1) AND (consumer_id = $2 OR farmer_id = $2) AND is_active = true
    `, [connectionIds, userId]);

    if (connectionCheck.rows.length !== connectionIds.length) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied to one or more connections" 
      });
    }

    // Bulk deactivate
    await pool.query(`
      UPDATE active_connections 
      SET is_active = false, last_interaction_at = NOW() 
      WHERE id = ANY($1)
    `, [connectionIds]);

    res.status(200).json({
      success: true,
      message: `${connectionIds.length} connections deactivated successfully`,
      deactivated_count: connectionIds.length
    });

  } catch (error) {
    console.error("Bulk Deactivate Connections Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// NOTIFICATION & ACTIVITY TRACKING FUNCTIONS
// =====================================================

// Get recent activity for user
export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { limit = 10, offset = 0 } = req.query;

    const activityQuery = `
      SELECT 
        'request_sent' as activity_type,
        fr.created_at as activity_date,
        fr.product_interest,
        fr.quantity,
        fr.message as activity_description,
        f.farm_name,
        u_farmer.name as farmer_name,
        'outgoing' as direction
      FROM farmer_requests fr
      JOIN farmer_profiles f ON fr.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      WHERE fr.consumer_id = $1
      
      UNION ALL
      
      SELECT 
        'request_received' as activity_type,
        fr.created_at as activity_date,
        fr.product_interest,
        fr.quantity,
        fr.message as activity_description,
        f.farm_name,
        u_consumer.name as consumer_name,
        'incoming' as direction
      FROM farmer_requests fr
      JOIN farmer_profiles f ON fr.farmer_id = f.id
      JOIN users u_consumer ON fr.consumer_id = u_consumer.id
      WHERE f.user_id = $1
      
      UNION ALL
      
      SELECT 
        'connection_established' as activity_type,
        ac.connected_at as activity_date,
        fr.product_interest,
        fr.quantity,
        'Connection established' as activity_description,
        f.farm_name,
        u_farmer.name as farmer_name,
        'system' as direction
      FROM active_connections ac
      JOIN farmer_profiles f ON ac.farmer_id = f.id
      JOIN users u_farmer ON f.user_id = u_farmer.id
      LEFT JOIN farmer_requests fr ON ac.farmer_request_id = fr.id
      WHERE ac.consumer_id = $1 OR f.user_id = $1
      
      ORDER BY activity_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(activityQuery, [userId, parseInt(limit), parseInt(offset)]);

    res.status(200).json({
      success: true,
      activities: result.rows
    });

  } catch (error) {
    console.error("Get Recent Activity Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get notification counts
export const getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Check if user is consumer or farmer
    const userCheck = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const userRole = userCheck.rows[0].role;
    let counts = {};

    if (userRole === 'consumer') {
      // Consumer notifications
      const consumerCounts = await pool.query(`
        SELECT 
          COUNT(CASE WHEN fr.status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN fr.status = 'accepted' THEN 1 END) as accepted_requests,
          COUNT(CASE WHEN fr.status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(ac.id) as active_connections
        FROM farmer_requests fr
        LEFT JOIN active_connections ac ON fr.consumer_id = ac.consumer_id AND ac.is_active = true
        WHERE fr.consumer_id = $1
      `, [userId]);

      counts = consumerCounts.rows[0];
    } else if (userRole === 'farmer') {
      // Farmer notifications
      const farmerProfile = await pool.query(
        "SELECT id FROM farmer_profiles WHERE user_id = $1",
        [userId]
      );

      if (farmerProfile.rows.length > 0) {
        const farmerProfileId = farmerProfile.rows[0].id;
        
        const farmerCounts = await pool.query(`
          SELECT 
            COUNT(CASE WHEN fr.status = 'pending' THEN 1 END) as pending_requests,
            COUNT(CASE WHEN fr.status = 'accepted' THEN 1 END) as accepted_requests,
            COUNT(CASE WHEN fr.status = 'rejected' THEN 1 END) as rejected_requests,
            COUNT(ac.id) as active_connections
          FROM farmer_requests fr
          LEFT JOIN active_connections ac ON fr.farmer_id = ac.farmer_id AND ac.is_active = true
          WHERE fr.farmer_id = $1
        `, [farmerProfileId]);

        counts = farmerCounts.rows[0];
      }
    }

    res.status(200).json({
      success: true,
      notifications: counts
    });

  } catch (error) {
    console.error("Get Notification Counts Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Mark notifications as read (placeholder for future implementation)
export const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { notificationIds } = req.body;

    // This is a placeholder for future notification system
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      marked_count: notificationIds ? notificationIds.length : 0
    });

  } catch (error) {
    console.error("Mark Notifications as Read Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// =====================================================
// ANALYTICS FUNCTIONS
// =====================================================

// Get consumer analytics
export const getConsumerAnalytics = async (req, res) => {
  try {
    const consumerId = req.user.user_id;

    const result = await pool.query(`
      SELECT 
        total_requests_sent,
        accepted_requests,
        rejected_requests,
        active_connections,
        request_success_rate,
        last_activity_at
      FROM consumer_activity_summary 
      WHERE consumer_id = $1
    `, [consumerId]);

    res.status(200).json({
      success: true,
      analytics: result.rows[0] || {
        total_requests_sent: 0,
        accepted_requests: 0,
        rejected_requests: 0,
        active_connections: 0,
        request_success_rate: 0,
        last_activity_at: null
      }
    });

  } catch (error) {
    console.error("Get Consumer Analytics Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get farmer analytics
export const getFarmerAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.user_id;

    // Get farmer profile ID
    const farmerProfile = await pool.query(
      "SELECT id FROM farmer_profiles WHERE user_id = $1",
      [farmerId]
    );

    if (farmerProfile.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Farmer profile not found" 
      });
    }

    const farmerProfileId = farmerProfile.rows[0].id;

    const result = await pool.query(`
      SELECT 
        total_requests_received,
        accepted_requests,
        rejected_requests,
        active_connections,
        response_rate,
        last_activity_at
      FROM farmer_activity_summary 
      WHERE farmer_id = $1
    `, [farmerProfileId]);

    res.status(200).json({
      success: true,
      analytics: result.rows[0] || {
        total_requests_received: 0,
        accepted_requests: 0,
        rejected_requests: 0,
        active_connections: 0,
        response_rate: 0,
        last_activity_at: null
      }
    });

  } catch (error) {
    console.error("Get Farmer Analytics Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
