// routes/complaint.routes.js

import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  submitComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  deleteComplaint,
} from "../controllers/complaint.controller.js";

const router = express.Router();

// ─── Multer config (save images to /uploads) ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `waste-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WEBP images are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/complaint/submit  → upload image, call ML, save all data
router.post("/submit", authMiddleware, upload.single("image"), submitComplaint);

// GET  /api/complaint/all     → all complaints (admin)
router.get("/all", getAllComplaints);

// GET  /api/complaint/my      → logged-in user's complaints
router.get("/my", authMiddleware, getMyComplaints);

// GET  /api/complaint/:id     → single complaint + its status
router.get("/:id", getComplaintById);

// DELETE /api/complaint/:id   → user deletes own complaint
router.delete("/:id", authMiddleware, deleteComplaint);

export default router;