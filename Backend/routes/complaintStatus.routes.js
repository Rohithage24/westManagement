// routes/complaintStatus.routes.js

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getStatus,
  getMyStatuses,
  getAllStatuses,
  updateStatus,
  getStatusHistory,
} from "../controllers/complaintStatus.controller.js";

const router = express.Router();

// GET  /api/status/all                      → all statuses (admin)
router.get("/all", getAllStatuses);

// GET  /api/status/my                       → logged-in user's statuses
router.get("/my", authMiddleware, getMyStatuses);

// GET  /api/status/:complaintID             → single complaint status
router.get("/:complaintID", getStatus);

// GET  /api/status/:complaintID/history     → full status change history
router.get("/:complaintID/history", getStatusHistory);

// PATCH /api/status/:complaintID            → update status (admin)
router.patch("/:complaintID", updateStatus);

export default router;