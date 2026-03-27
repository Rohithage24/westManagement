// routes/admin.routes.js

import express from "express";
import adminMiddleware, { onlyGovernment } from "../middlewares/adminMiddleware.js";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllComplaintsForAdmin,
  getComplaintDetail,
  updateComplaintByAdmin,
  updateComplaintStatus,
  getComplaintStats,
  listAllAdmins,
  deactivateAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH  (Public)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/admin/register    → Register new admin (municipality/government/grampanchayat)
router.post("/register", registerAdmin);

// POST /api/admin/login       → Login admin, set cookie
router.post("/login", loginAdmin);

// POST /api/admin/logout      → Logout admin, clear cookie
router.post("/logout", logoutAdmin);


// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN PROFILE  (Protected — any logged-in admin)
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/admin/me           → Get own admin profile
router.get("/me", adminMiddleware, getAdminProfile);

// PATCH /api/admin/me/update    → Update own admin profile
router.patch("/me/update", adminMiddleware, updateAdminProfile);


// ─────────────────────────────────────────────────────────────────────────────
//  COMPLAINT MANAGEMENT  (Protected — any logged-in admin)
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/admin/complaints/stats       → Dashboard stats
router.get("/complaints/stats", adminMiddleware, getComplaintStats);

// GET   /api/admin/complaints             → All complaints (with filter: ?status=Pending&severity=High&page=1&limit=20)
router.get("/complaints", adminMiddleware, getAllComplaintsForAdmin);

// GET   /api/admin/complaints/:id         → Single complaint full detail
router.get("/complaints/:id", adminMiddleware, getComplaintDetail);

// PATCH /api/admin/complaints/:id         → Update complaint info (severity, wasteType, address)
router.patch("/complaints/:id", adminMiddleware, updateComplaintByAdmin);

// PATCH /api/admin/complaints/:id/status  → Update complaint status (Pending→Accept→Working→Complete)
router.patch("/complaints/:id/status", adminMiddleware, updateComplaintStatus);


// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN MANAGEMENT  (Protected — government role only)
// ─────────────────────────────────────────────────────────────────────────────

// GET   /api/admin/list          → List all admins
router.get("/list", adminMiddleware, onlyGovernment, listAllAdmins);

// PATCH /api/admin/:id/deactivate → Deactivate an admin account
router.patch("/:id/deactivate", adminMiddleware, onlyGovernment, deactivateAdmin);


export default router;