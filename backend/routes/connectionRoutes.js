import express from "express";
import {
  // Consumer connection functions
  sendConnectionRequest,
  getMyConnections,
  getConnectionRequests,
  
  // Farmer connection functions
  getFarmerRequests,
  respondToConnectionRequest,
  getFarmerConnections,
  
  // Connection details & search functions
  getConnectionDetails,
  searchConnections,
  getConnectionHistory,
  
  // Bulk operations
  bulkDeactivateConnections,
  
  // Notification & activity functions
  getRecentActivity,
  getNotificationCounts,
  markNotificationsAsRead,
  
  // Analytics functions
  getConsumerAnalytics,
  getFarmerAnalytics,
  
  // Communication functions
  updateConnectionNotes,
  deactivateConnection
} from "../controllers/connectionController.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";

const connectionRouter = express.Router();

// =====================================================
// CONSUMER CONNECTION ROUTES
// =====================================================

// Send connection request to farmer
connectionRouter.post("/send-request", authMiddleware, sendConnectionRequest);

// Get consumer's active connections
connectionRouter.get("/my-connections", authMiddleware, getMyConnections);

// Get consumer's sent requests (status tracking)
connectionRouter.get("/my-requests", authMiddleware, getConnectionRequests);

// =====================================================
// FARMER CONNECTION ROUTES
// =====================================================

// Get all requests for a farmer
connectionRouter.get("/farmer/requests", authMiddleware, getFarmerRequests);

// Respond to connection request (accept/reject)
connectionRouter.post("/farmer/requests/:requestId/respond", authMiddleware, respondToConnectionRequest);

// Get farmer's active connections
connectionRouter.get("/farmer/connections", authMiddleware, getFarmerConnections);

// =====================================================
// CONNECTION MANAGEMENT ROUTES
// =====================================================

// Update connection notes (both consumer and farmer)
connectionRouter.put("/connections/:connectionId/notes", authMiddleware, updateConnectionNotes);

// Deactivate connection (both consumer and farmer)
connectionRouter.delete("/connections/:connectionId", authMiddleware, deactivateConnection);

// =====================================================
// CONNECTION DETAILS & SEARCH ROUTES
// =====================================================

// Get detailed connection information
connectionRouter.get("/connections/:connectionId", authMiddleware, getConnectionDetails);

// Search connections with filters
connectionRouter.get("/search", authMiddleware, searchConnections);

// Get connection history/activity log
connectionRouter.get("/connections/:connectionId/history", authMiddleware, getConnectionHistory);

// =====================================================
// BULK OPERATIONS ROUTES
// =====================================================

// Bulk deactivate connections
connectionRouter.post("/bulk-deactivate", authMiddleware, bulkDeactivateConnections);

// =====================================================
// NOTIFICATION & ACTIVITY ROUTES
// =====================================================

// Get recent activity for user
connectionRouter.get("/activity", authMiddleware, getRecentActivity);

// Get notification counts
connectionRouter.get("/notifications/counts", authMiddleware, getNotificationCounts);

// Mark notifications as read
connectionRouter.post("/notifications/mark-read", authMiddleware, markNotificationsAsRead);

// =====================================================
// ANALYTICS ROUTES
// =====================================================

// Get consumer analytics
connectionRouter.get("/analytics/consumer", authMiddleware, getConsumerAnalytics);

// Get farmer analytics
connectionRouter.get("/analytics/farmer", authMiddleware, getFarmerAnalytics);

export default connectionRouter;
