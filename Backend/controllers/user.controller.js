// controllers/user.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ─── Helper: Generate JWT & set cookie ───────────────────────────────────────
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET ,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,       // JS cannot access this cookie (XSS safe)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",   // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};


// =============================================================================
//  POST /api/user/register
//  Body: { name, gmail, password, address }
// =============================================================================
export const registerUser = async (req, res) => {
  try {
    const { name, gmail, password, address } = req.body;

    // 1. Validate required fields
    if (!name || !gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, gmail, and password are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ gmail: gmail.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this gmail already exists",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const newUser = new User({
      name: name.trim(),
      gmail: gmail.toLowerCase().trim(),
      password: hashedPassword,
      address: address || "",
    });

    await newUser.save();

    // 5. Generate JWT and set cookie
    generateTokenAndSetCookie(res, newUser._id);

    // 6. Return response (without password)
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          gmail: newUser.gmail,
          address: newUser.address,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Gmail already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================================================
//  POST /api/user/login
//  Body: { gmail, password }
// =============================================================================
export const loginUser = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    // 1. Validate fields
    if (!gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Gmail and password are required",
      });
    }

    // 2. Find user by gmail
    const user = await User.findOne({ gmail: gmail.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid gmail or password",
      });
    }

    // 3. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid gmail or password",
      });
    }

    // 4. Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    // 5. Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          gmail: user.gmail,
          address: user.address,
        },
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================================================
//  POST /api/user/logout
//  Clears the auth cookie
// =============================================================================
export const logoutUser = async (req, res) => {
  try {
    // Clear cookie by setting it to expire immediately
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Expired immediately
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("logoutUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================================================
//  GET /api/user/me         (Protected)
//  Get logged-in user's profile
// =============================================================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
   

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          gmail: user.gmail,
          address: user.address,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================================================
//  PATCH /api/user/update   (Protected)
//  Body: { name, address, gmail }  — password update not allowed here
// =============================================================================
export const updateUser = async (req, res) => {
  try {
    const { name, gmail, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate name length if provided
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    // If changing gmail, check it's not taken by another user
    if (gmail && gmail.toLowerCase() !== user.gmail) {
      const gmailTaken = await User.findOne({ gmail: gmail.toLowerCase() });
      if (gmailTaken) {
        return res.status(409).json({
          success: false,
          message: "This gmail is already in use",
        });
      }
      user.gmail = gmail.toLowerCase().trim();
    }

    // Apply updates
    if (name) user.name = name.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          gmail: user.gmail,
          address: user.address,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================================================
//  DELETE /api/user/delete  (Protected)
//  Deletes the logged-in user's account
// =============================================================================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clear cookie after deletion
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};