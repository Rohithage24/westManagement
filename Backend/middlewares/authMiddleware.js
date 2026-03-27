// middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read token from cookie (or fallback to Bearer header)
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET 
      );
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please login again."
          : "Invalid token. Please login again.";
      return res.status(401).json({ success: false, message });
    }

    // 3. Find user in DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default authMiddleware;