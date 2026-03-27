// middlewares/adminMiddleware.js

import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

// ─── Verify admin JWT cookie ──────────────────────────────────────────────────
const adminMiddleware = async (req, res, next) => {
  try {
    // Read from cookie (admin_token) or Bearer header
    const token =
      req.cookies?.admin_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Admin login required.",
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please login again."
          : "Invalid token. Please login again.";
      return res.status(401).json({ success: false, message });
    }

    // Must be admin type
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Find admin in DB
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found." });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been deactivated.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("adminMiddleware error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Role-specific guards ─────────────────────────────────────────────────────
// Use after adminMiddleware to restrict by role

export const onlyMunicipality = (req, res, next) => {
  if (req.admin.role !== "municipality") {
    return res.status(403).json({ success: false, message: "Municipality admins only." });
  }
  next();
};

export const onlyGovernment = (req, res, next) => {
  if (req.admin.role !== "government") {
    return res.status(403).json({ success: false, message: "Government officers only." });
  }
  next();
};

export const onlyGrampanchayat = (req, res, next) => {
  if (req.admin.role !== "grampanchayat") {
    return res.status(403).json({ success: false, message: "Grampanchayat admins only." });
  }
  next();
};

export default adminMiddleware;