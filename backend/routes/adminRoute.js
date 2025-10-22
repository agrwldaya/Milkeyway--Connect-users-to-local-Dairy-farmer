import express from "express";
import {
  getAllFarmers,
  getFarmerById,
  approveFarmer,
  rejectFarmer,
  getPendingFarmers,
  getAllConsumers,
  getConsumerById,
  activateConsumer,
  deactivateConsumer,
  getConsumerStats,
  getAllConnections,
  getConnectionById,
  deactivateConnection,
  getConnectionStats,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  getRequestStats,
  getDashboardStats,
  getPlatformOverview,
  getAllActivity,
  getActivityStats,
  getActivityByType,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getPlatformSettings,
  updatePlatformSettings,
  getPublicPlatformSettings,
  initializePlatformSettings,
  getAdminPreferences,
  updateAdminPreferences,
  LoginAdmin,
} from "../controllers/adminController.js";
import { authMiddleware, verifyAdmin } from "../middleware/authMiddleWare.js";


const AdminRouter = express.Router();

AdminRouter.post("/login", LoginAdmin);

// Farmer management routes

AdminRouter.use(authMiddleware,verifyAdmin)

// Dashboard routes
AdminRouter.get("/dashboard/stats", getDashboardStats);
AdminRouter.get("/dashboard/overview", getPlatformOverview);

AdminRouter.get("/farmers", getAllFarmers);
AdminRouter.get("/farmers/pending", getPendingFarmers);
AdminRouter.get("/farmers/:id", getFarmerById);
AdminRouter.patch("/farmers/:id/approve", approveFarmer);
AdminRouter.patch("/farmers/:id/reject", rejectFarmer);

// Consumer management routes
AdminRouter.get("/consumers", getAllConsumers);
AdminRouter.get("/consumers/stats", getConsumerStats);
AdminRouter.get("/consumers/:id", getConsumerById);
AdminRouter.patch("/consumers/:id/activate", activateConsumer);
AdminRouter.patch("/consumers/:id/deactivate", deactivateConsumer);

// Connection management routes
AdminRouter.get("/connections", getAllConnections);
AdminRouter.get("/connections/stats", getConnectionStats);
AdminRouter.get("/connections/:id", getConnectionById);
AdminRouter.delete("/connections/:id", deactivateConnection);

// Request management routes
AdminRouter.get("/requests", getAllRequests);
AdminRouter.get("/requests/stats", getRequestStats);
AdminRouter.get("/requests/:id", getRequestById);
AdminRouter.patch("/requests/:id/status", updateRequestStatus);
AdminRouter.delete("/requests/:id", deleteRequest);

// Activity management routes
AdminRouter.get("/activity", getAllActivity);
AdminRouter.get("/activity/stats", getActivityStats);
AdminRouter.get("/activity/type/:type", getActivityByType);

// Settings routes
AdminRouter.get("/settings/profile", getAdminProfile);
AdminRouter.put("/settings/profile", updateAdminProfile);
AdminRouter.put("/settings/password", changeAdminPassword);
AdminRouter.get("/settings/platform", getPlatformSettings);
AdminRouter.put("/settings/platform", updatePlatformSettings);
AdminRouter.get("/settings/platform/public", getPublicPlatformSettings);
AdminRouter.post("/settings/platform/initialize", initializePlatformSettings);
AdminRouter.get("/settings/preferences", getAdminPreferences);
AdminRouter.put("/settings/preferences", updateAdminPreferences);

export default AdminRouter;
