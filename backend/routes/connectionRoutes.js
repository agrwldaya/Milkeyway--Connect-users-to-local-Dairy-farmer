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
import { authMiddleware, verifyConsumer, verifyFarmer, verifyFarmerOrConsumer } from "../middleware/authMiddleWare.js";

const connectionRouter = express.Router();

// =====================================================
// CONSUMER CONNECTION ROUTES
// =====================================================

// Send connection request to farmer
connectionRouter.post("/send-request", authMiddleware, verifyConsumer, sendConnectionRequest);

// Get consumer's active connections
connectionRouter.get("/my-connections", authMiddleware, verifyConsumer, getMyConnections);

// Get consumer's sent requests (status tracking)
connectionRouter.get("/my-requests", authMiddleware, verifyConsumer, getConnectionRequests);

// =====================================================
// FARMER CONNECTION ROUTES
// =====================================================

// Get all requests for a farmer
connectionRouter.get("/farmer/requests", authMiddleware, verifyFarmer, getFarmerRequests);

// Respond to connection request (accept/reject)
connectionRouter.post("/farmer/requests/:requestId/respond", authMiddleware, verifyFarmer, respondToConnectionRequest);

// Get farmer's active connections
connectionRouter.get("/farmer/connections", authMiddleware, verifyFarmer, getFarmerConnections);

// =====================================================
// CONNECTION MANAGEMENT ROUTES
// =====================================================

// Update connection notes (both consumer and farmer)
connectionRouter.put("/connections/:connectionId/notes", authMiddleware, verifyFarmerOrConsumer, updateConnectionNotes);

// Deactivate connection (both consumer and farmer)
connectionRouter.delete("/connections/:connectionId", authMiddleware, verifyFarmerOrConsumer, deactivateConnection);

// =====================================================
// CONNECTION DETAILS & SEARCH ROUTES
// =====================================================

// Get detailed connection information
connectionRouter.get("/connections/:connectionId", authMiddleware, verifyFarmerOrConsumer, getConnectionDetails);

// Search connections with filters
connectionRouter.get("/search", authMiddleware, verifyFarmerOrConsumer, searchConnections);

// Get connection history/activity log
connectionRouter.get("/connections/:connectionId/history", authMiddleware, verifyFarmerOrConsumer, getConnectionHistory);

// =====================================================
// BULK OPERATIONS ROUTES
// =====================================================

// Bulk deactivate connections
connectionRouter.post("/bulk-deactivate", authMiddleware, verifyFarmerOrConsumer, bulkDeactivateConnections);

// =====================================================
// NOTIFICATION & ACTIVITY ROUTES
// =====================================================

// Get recent activity for user
connectionRouter.get("/activity", authMiddleware, verifyFarmerOrConsumer, getRecentActivity);

// Get notification counts
connectionRouter.get("/notifications/counts", authMiddleware, verifyFarmerOrConsumer, getNotificationCounts);

// Mark notifications as read
connectionRouter.post("/notifications/mark-read", authMiddleware, verifyFarmerOrConsumer, markNotificationsAsRead);

// =====================================================
// ANALYTICS ROUTES
// =====================================================

// Get consumer analytics
connectionRouter.get("/analytics/consumer", authMiddleware, verifyConsumer, getConsumerAnalytics);

// Get farmer analytics
connectionRouter.get("/analytics/farmer", authMiddleware, verifyFarmer, getFarmerAnalytics);

export default connectionRouter;
