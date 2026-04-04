// controllers/admin.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Complaint from "../models/complaint.model.js";
import ComplaintStatus from "../models/complaintStatus.model.js";
import MapData from "../models/mapData.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// ─── Helper: generate admin JWT and set cookie ────────────────────────────────
const generateAdminToken = (res, adminId) => {
  const token = jwt.sign(
    { id: adminId, type: "admin" }, // type: "admin" distinguishes from user tokens
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};


// =============================================================================
//  POST /api/admin/register
//  Body: { name, email, password, phone, role, jurisdiction, department, designation, officeAddress }
// =============================================================================
export const registerAdmin = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      role, jurisdiction, department, designation, officeAddress,
    } = req.body;

    if (!name || !email || !password || !role || !jurisdiction) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, role, and jurisdiction are required",
      });
    }

    const validRoles = ["municipality", "government", "grampanchayat"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${validRoles.join(", ")}`,
      });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Admin with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      role,
      jurisdiction: jurisdiction.trim(),
      department: department || "Sanitation & Waste Management",
      designation: designation || "",
      officeAddress: officeAddress || "",
    });

    generateAdminToken(res, admin._id);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        admin: {
          id:           admin._id,
          name:         admin.name,
          email:        admin.email,
          role:         admin.role,
          jurisdiction: admin.jurisdiction,
          department:   admin.department,
          designation:  admin.designation,
        },
      },
    });
  } catch (error) {
    console.error("registerAdmin error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  POST /api/admin/login
//  Body: { email, password }
// =============================================================================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    generateAdminToken(res, admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id:           admin._id,
          name:         admin.name,
          email:        admin.email,
          role:         admin.role,
          jurisdiction: admin.jurisdiction,
          department:   admin.department,
          designation:  admin.designation,
        },
      },
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  POST /api/admin/logout
// =============================================================================
export const logoutAdmin = async (req, res) => {
  try {
    res.cookie("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });
    return res.status(200).json({ success: true, message: "Admin logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/admin/me        (Protected)
//  Get logged-in admin's profile
// =============================================================================
export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;
    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id:            admin._id,
          name:          admin.name,
          email:         admin.email,
          phone:         admin.phone,
          role:          admin.role,
          jurisdiction:  admin.jurisdiction,
          department:    admin.department,
          designation:   admin.designation,
          officeAddress: admin.officeAddress,
          isActive:      admin.isActive,
          createdAt:     admin.createdAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/admin/me/update    (Protected)
//  Update admin's own profile
// =============================================================================
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, department, designation, officeAddress } = req.body;

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    if (name) admin.name = name.trim();
    if (phone) admin.phone = phone.trim();
    if (department) admin.department = department.trim();
    if (designation) admin.designation = designation.trim();
    if (officeAddress) admin.officeAddress = officeAddress.trim();

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        admin: {
          id:           admin._id,
          name:         admin.name,
          email:        admin.email,
          phone:        admin.phone,
          role:         admin.role,
          jurisdiction: admin.jurisdiction,
          department:   admin.department,
          designation:  admin.designation,
        },
      },
    });
  } catch (error) {
    console.error("updateAdminProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/admin/complaints        (Protected)
//  Get ALL complaints assigned to this admin's jurisdiction
// =============================================================================
export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status)   filter.currentStatus = status;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("userID", "name gmail address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("getAllComplaintsForAdmin error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/admin/complaints/:id    (Protected)
//  Get single complaint with full status + user info
// =============================================================================
export const getComplaintDetail = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userID", "name gmail address phone");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const statusRecord = await ComplaintStatus.findOne({ complaintID: complaint._id });
    const mapPin = await MapData.findOne({ complaintID: complaint._id });

    return res.status(200).json({
      success: true,
      data: { complaint, status: statusRecord, mapPin },
    });
  } catch (error) {
    console.error("getComplaintDetail error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/admin/complaints/:id   (Protected)
//  Admin updates complaint details (description, severity, wasteType)
// =============================================================================
export const updateComplaintByAdmin = async (req, res) => {
  try {
    const { severity, wasteType, address } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const validSeverities = ["Low", "Medium", "High"];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, message: "severity must be Low, Medium, or High" });
    }

    if (severity)  complaint.severity  = severity;
    if (wasteType) complaint.wasteType = wasteType;
    if (address)   complaint.address   = address;

    await complaint.save();

    // Sync MapData
    await MapData.findOneAndUpdate(
      { complaintID: complaint._id },
      { severity: complaint.severity, wasteType: complaint.wasteType }
    );

    return res.status(200).json({
      success: true,
      message: "Complaint updated by admin",
      data: complaint,
    });
  } catch (error) {
    console.error("updateComplaintByAdmin error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/admin/complaints/:id/status   (Protected)
//  Admin updates complaint status → auto-syncs MapData + Complaint
//
//  Status flow:  Pending → Accept → Working → Complete
// =============================================================================
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note, assignedTo } = req.body;

    const validStatuses = ["Pending", "Accept", "Working", "Complete"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the status record
    const statusRecord = await ComplaintStatus.findOne({ complaintID: req.params.id });
    if (!statusRecord) {
      return res.status(404).json({ success: false, message: "Complaint status record not found" });
    }

    // Push to history
    statusRecord.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status changed to ${status} by ${req.admin.name} (${req.admin.role})`,
    });

    statusRecord.status = status;
    if (assignedTo) statusRecord.assignedTo = assignedTo;
    await statusRecord.save();

    // ── Sync map pin state ────────────────────────────────────────────────
    const mapState =
      status === "Complete" ? "Complete" :
      status === "Accept"  ? "Pending"  : "Waste";

    await MapData.findOneAndUpdate({ complaintID: req.params.id }, { state: mapState });

    // ── Sync complaint currentStatus ──────────────────────────────────────
    await Complaint.findByIdAndUpdate(req.params.id, { currentStatus: mapState });

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to "${status}"`,
      data: {
        complaintID:   req.params.id,
        updatedStatus: status,
        assignedTo:    statusRecord.assignedTo,
        // updatedBy: {
        //   adminID:      req.admin._id,
        //   name:         req.admin.name,
        //   role:         req.admin.role,
        //   jurisdiction: req.admin.jurisdiction,
        // },
        statusHistory: statusRecord.statusHistory,
      },
    });
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/admin/complaints/stats   (Protected)
//  Summary stats for admin dashboard
// =============================================================================
export const getComplaintStats = async (req, res) => {
  try {
    const [total, pending, complete, waste, highSeverity] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ currentStatus: "Pending"  }),
      Complaint.countDocuments({ currentStatus: "Complete" }),
      Complaint.countDocuments({ currentStatus: "Waste"    }),
      Complaint.countDocuments({ severity: "High"          }),
    ]);

    const byWasteType = await Complaint.aggregate([
      { $group: { _id: "$wasteType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySeverity = await Complaint.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        complete,
        waste,
        highSeverity,
        byWasteType,
        bySeverity,
      },
    });
  } catch (error) {
    console.error("getComplaintStats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/admin/list       (Protected — government role only)
//  List all admins (government officer can view all)
// =============================================================================
export const listAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/admin/:id/deactivate   (Protected — government role only)
//  Deactivate an admin account
// =============================================================================
export const deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    return res.status(200).json({
      success: true,
      message: `Admin "${admin.name}" deactivated`,
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};