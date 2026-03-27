// routes/user.routes.js

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ─── Public Routes (No login needed) ─────────────────────────────────────────
router.post("/register", registerUser);   // POST   /api/user/register
router.post("/login", loginUser);         // POST   /api/user/login
router.post("/logout", logoutUser);       // POST   /api/user/logout

// ─── Protected Routes (Login required — cookie auth) ─────────────────────────
router.get("/me", authMiddleware, getMyProfile);        // GET    /api/user/me
router.patch("/update", authMiddleware, updateUser);    // PATCH  /api/user/update
router.delete("/delete", authMiddleware, deleteUser);   // DELETE /api/user/delete

export default router;