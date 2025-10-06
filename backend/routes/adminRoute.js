import express from "express";
import {
  getAllFarmers,
  getFarmerById,
  approveFarmer,
  LoginAdmin,
} from "../controllers/adminController.js";
import { authMiddleware, verifyAdmin } from "../middleware/authMiddleWare.js";


const AdminRouter = express.Router();

AdminRouter.post("/login", LoginAdmin);

// Farmer management routes

AdminRouter.use(authMiddleware,verifyAdmin)

AdminRouter.get("/farmers", getAllFarmers);
AdminRouter.get("/farmers/:id", getFarmerById);
AdminRouter.patch("/farmers/:id/approve", approveFarmer);

// AdminRouter.patch("/farmers/:id/reject", rejectFarmer);
// AdminRouter.patch("/farmers/:id/suspend", suspendFarmer);
// AdminRouter.patch("/farmers/:id/reactivate", reactivateFarmer);

export default AdminRouter;
