// controllers/complaint.controller.js

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Complaint from "../models/complaint.model.js";
import MapData from "../models/mapData.model.js";
import ComplaintStatus from "../models/complaintStatus.model.js";
import dotenv from "dotenv";

dotenv.config()
// ─── ML Model URL ─────────────────────────────────────────────────────────────
const ML_API_URL = process.env.ML_API_URL ;


// =============================================================================
//  HELPER — Haversine distance (returns km between two lat/lng points)
// =============================================================================
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
 
// =============================================================================
//  HELPER — Bounding-box pre-filter (cheap DB query before exact Haversine)
// =============================================================================
const boundingBox = (lat, lon, radiusKm) => {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    latMin: lat - latDelta, latMax: lat + latDelta,
    lonMin: lon - lonDelta, lonMax: lon + lonDelta,
  };
};
 
 
// =============================================================================
//  POST /api/complaint/submit
//  Body (multipart/form-data): image, latitude, longitude, address
//  Cookie: user JWT  →  req.user._id
//
//  DUPLICATE GUARD (0.3 km radius):
//   ─ If an ACTIVE (Waste / Pending / Accept / Working) complaint already
//     exists within 0.3 km  →  BLOCK the new submission and return:
//       • The existing complaint details
//       • The reporter's name
//       • Current status
//       • Date submitted
//       • Message asking user to wait
//   ─ Only if all nearby complaints are "Complete"  →  allow new submission
// =============================================================================
export const submitComplaint = async (req, res) => {
  try {
    console.log("ML URL:", ML_API_URL);
 
    const { latitude, longitude, address } = req.body;
    const userID = req.user._id;
 
    // ── 1. Validate inputs ────────────────────────────────────────────────────
    if (!req.file)
      return res.status(400).json({ success: false, message: "Image is required" });
 
    if (!latitude || !longitude)
      return res.status(400).json({ success: false, message: "latitude and longitude are required" });
 
    const newLat = parseFloat(latitude);
    const newLon = parseFloat(longitude);
 
    // ── 2. DUPLICATE GUARD — check within 0.3 km radius ──────────────────────
    const RADIUS_KM = 0.3;
    const { latMin, latMax, lonMin, lonMax } = boundingBox(newLat, newLon, RADIUS_KM);
 
    // Bounding-box DB query (fast, no index needed)
    const nearbyAll = await Complaint.find({
      currentStatus: { $in: ["Waste", "Pending", "Accept", "Working"] }, // only ACTIVE
      latitude:  { $gte: latMin, $lte: latMax },
      longitude: { $gte: lonMin, $lte: lonMax },
    })
      .populate("userID", "name gmail")   // get reporter info
      .lean();
 
    // Exact Haversine filter (removes bounding-box corners)
    const activeNearby = nearbyAll.filter(
      (c) => haversineDistance(newLat, newLon, c.latitude, c.longitude) <= RADIUS_KM
    );
 
    // ── If ANY active complaint found nearby → BLOCK ──────────────────────────
    if (activeNearby.length > 0) {
      // Pick the closest one to show the user
      const closest = activeNearby.reduce((prev, curr) =>
        haversineDistance(newLat, newLon, curr.latitude, curr.longitude) <
        haversineDistance(newLat, newLon, prev.latitude, prev.longitude)
          ? curr
          : prev
      );
 
      // Get its status record
      const existingStatus = await ComplaintStatus.findOne({
        complaintID: closest._id,
      }).lean();
 
      const distanceMeters = Math.round(
        haversineDistance(newLat, newLon, closest.latitude, closest.longitude) * 1000
      );
 
      // Clean up the uploaded image since we're blocking
      fs.unlink(req.file.path, () => {});
 
      return res.status(409).json({
        success:    false,
        duplicate:  true,
        message:
          `A complaint already exists ${distanceMeters} m from this location. ` +
          `Please wait 1–2 days for it to be resolved before submitting a new one.`,
        data: {
          existingComplaint: {
            complaintID:    closest._id,
            reportedBy: {
              name:  closest.userID?.name  || "Unknown",
              gmail: closest.userID?.gmail || "",
            },
            wasteType:       closest.wasteType,
            severity:        closest.severity,
            wastePercentage: closest.wastePercentage,
            address:         closest.address || "Near your location",
            currentStatus:   closest.currentStatus,
            distanceMeters,
            submittedOn:     closest.createdAt,
            statusUpdatedOn: existingStatus?.updatedAt || closest.createdAt,
            statusHistory:   existingStatus?.statusHistory || [],
          },
          totalActiveNearby: activeNearby.length,
          userMessage: [
            `👤 Reported by: ${closest.userID?.name || "a citizen"}`,
            `📍 Distance: ${distanceMeters} metres from your location`,
            `📌 Status: ${closest.currentStatus}`,
            `📅 Submitted on: ${new Date(closest.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}`,
            `⏳ Please wait 1–2 days for the municipal team to resolve this complaint.`,
          ],
        },
      });
    }
 
    // ── 3. No active duplicate found — proceed with ML + save ─────────────────
    const imageUrl = `/uploads/${req.file.filename}`;
 
    let wastePercentage = 0, wasteType = "Unknown",
        severity = "Medium", mlConfidence = 0, mlRawResponse = {};
 
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(req.file.path));
 
      const mlRes = await axios.post(ML_API_URL, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 15000,
      });
 
      console.log("ML response:", mlRes.data);
 
      mlRawResponse   = mlRes.data.mlRawResponse  ?? {};
      wastePercentage = mlRes.data.wastePercentage ?? 0;
      wasteType       = mlRes.data.wasteType       ?? "Unknown";
      severity        = mlRes.data.severity        ?? "Medium";
      mlConfidence    = mlRes.data.mlConfidence    ?? 0;
    } catch (mlErr) {
      console.warn("⚠️  ML model unavailable:", mlErr.message);
    }
 
    // ── 4. Save Complaint ─────────────────────────────────────────────────────
    const complaint = await Complaint.create({
      userID,
      imageUrl,
      wastePercentage,
      wasteType,
      severity,
      mlConfidence,
      mlRawResponse,
      latitude:      newLat,
      longitude:     newLon,
      address:       address || "",
      currentStatus: "Waste",
    });
 
    // ── 5. Save MapData ───────────────────────────────────────────────────────
    await MapData.create({
      userID,
      complaintID: complaint._id,
      latitude:      newLat,
      longitude:     newLon,
      address:       address || "",
      state:         "Waste",
      wastePercentage,
      wasteType,
      severity,
    });
 
    // ── 6. Save ComplaintStatus ───────────────────────────────────────────────
    await ComplaintStatus.create({
      userID,
      complaintID: complaint._id,
      status:        "Pending",
      statusHistory: [{ status: "Pending", note: "Complaint submitted by user" }],
    });
 
    return res.status(201).json({
      success:   true,
      duplicate: false,
      message:   "Complaint submitted successfully",
      data: {
        complaintID:     complaint._id,
        imageUrl:        complaint.imageUrl,
        wastePercentage,
        wasteType,
        severity,
        mlConfidence,
        latitude:        complaint.latitude,
        longitude:       complaint.longitude,
        address:         complaint.address,
        currentStatus:   complaint.currentStatus,
      },
    });
 
  } catch (error) {
    console.error("submitComplaint error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================================================================
//  GET /api/complaint/all              (Admin — all complaints)
// =============================================================================
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userID", "name gmail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("getAllComplaints error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/complaint/my              (Protected — logged-in user's complaints)
// =============================================================================
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userID: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("getMyComplaints error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/complaint/:id             (Get single complaint with status)
// =============================================================================
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("userID", "name gmail");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const status = await ComplaintStatus.findOne({ complaintID: complaint._id });

    return res.status(200).json({
      success: true,
      data: { complaint, status },
    });
  } catch (error) {
    console.error("getComplaintById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  DELETE /api/complaint/:id          (Protected — user deletes own complaint)
// =============================================================================
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userID: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found or not authorized" });
    }

    // Delete all related records
    await Complaint.findByIdAndDelete(complaint._id);
    await MapData.findOneAndDelete({ complaintID: complaint._id });
    await ComplaintStatus.findOneAndDelete({ complaintID: complaint._id });

    return res.status(200).json({
      success: true,
      message: "Complaint and all related data deleted",
    });
  } catch (error) {
    console.error("deleteComplaint error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};