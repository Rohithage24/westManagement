// routes/mapData.routes.js

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getAllMapData,
  getMyMapData,
  getMapDataByState,
  getMapDataByComplaint,
  updateMapState,
} from "../controllers/mapData.controller.js";

const router = express.Router();

// GET  /api/map/all                  → all map pins
router.get("/all", getAllMapData);

// GET  /api/map/my                   → logged-in user's pins
router.get("/my", authMiddleware, getMyMapData);

// GET  /api/map/filter?state=Waste   → pins filtered by state
router.get("/filter", getMapDataByState);

// GET  /api/map/:complaintID         → single map pin
router.get("/:complaintID", getMapDataByComplaint);

// PATCH /api/map/:complaintID/state  → update map pin state (admin)
router.patch("/:complaintID/state", updateMapState);

export default router;