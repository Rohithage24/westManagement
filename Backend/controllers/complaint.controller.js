// controllers/complaint.controller.js

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Complaint from "../models/complaint.model.js";
import MapData from "../models/mapData.model.js";
import ComplaintStatus from "../models/complaintStatus.model.js";

// ─── ML Model URL ─────────────────────────────────────────────────────────────
const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000/predict";


// =============================================================================
//  POST /api/complaint/submit
//  Body (multipart/form-data): image, latitude, longitude, address
//  Header: cookie (auth)  →  req.user._id = userID
// =============================================================================
// export const submitComplaint = async (req, res) => {
//   try {
//     const { latitude, longitude, address } = req.body;
//     const userID = req.user._id;

//     // 1. Validate inputs
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "Image is required" });
//     }
//     if (!latitude || !longitude) {
//       return res.status(400).json({ success: false, message: "latitude and longitude are required" });
//     }

//     const imageUrl = `/uploads/${req.file.filename}`;

//     // 2. Send image to ML model API
//     let wastePercentage = 0;
//     let wasteType = "Unknown";
//     let severity = "Medium";
//     let mlConfidence = 0;
//     let mlRawResponse = {};

//     try {
//       // Send image as multipart form to ML API
//       const formData = new FormData();
//       formData.append("image", fs.createReadStream(req.file.path));

//       const mlResponse = await axios.post(ML_API_URL, formData, {
//         headers: { ...formData.getHeaders() },
//         timeout: 15000, // 15 sec timeout
//       });

//       // ML API expected response:
//       // {
//       //   waste_percentage: 87.5,
//       //   waste_type: "Plastic",
//       //   severity: "High",
//       //   confidence: 0.92
//       // }
//       mlRawResponse    = mlResponse.data;
//       wastePercentage  = mlResponse.data.waste_percentage ?? 0;
//       wasteType        = mlResponse.data.waste_type       ?? "Unknown";
//       severity         = mlResponse.data.severity         ?? "Medium";
//       mlConfidence     = mlResponse.data.confidence       ?? 0;

//     } catch (mlError) {
//       // ML model unavailable → save with defaults, don't block the user
//       console.warn("⚠️  ML model unavailable:", mlError.message);
//     }

//     // 3. Save Complaint
//     const complaint = await Complaint.create({
//       userID,
//       imageUrl,
//       wastePercentage,
//       wasteType,
//       severity,
//       mlConfidence,
//       mlRawResponse,
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       address: address || "",
//       currentStatus: "Waste",
//     });

//     // 4. Save MapData (for map pins)
//     await MapData.create({
//       userID,
//       complaintID: complaint._id,
//       latitude: parseFloat(latitude),
//       longitude: parseFloat(longitude),
//       address: address || "",
//       state: "Waste",
//       wastePercentage,
//       wasteType,
//       severity,
//     });

//     // 5. Save ComplaintStatus (starts as Pending)
//     await ComplaintStatus.create({
//       userID,
//       complaintID: complaint._id,
//       status: "Pending",
//       statusHistory: [{ status: "Pending", note: "Complaint submitted by user" }],
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Complaint submitted successfully",
//       data: {
//         complaintID: complaint._id,
//         imageUrl: complaint.imageUrl,
//         wastePercentage,
//         wasteType,
//         severity,
//         mlConfidence,
//         latitude: complaint.latitude,
//         longitude: complaint.longitude,
//         address: complaint.address,
//         currentStatus: complaint.currentStatus,
//       },
//     });

//   } catch (error) {
//     console.error("submitComplaint error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };



// =============================================================================
//  HELPER: Haversine distance (returns km between two lat/lng points)
// =============================================================================
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
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
//  POST /api/complaint/submit
//  Body (multipart/form-data): image, latitude, longitude, address
//  Header: cookie (auth)  →  req.user._id = userID
// =============================================================================
export const submitComplaint = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userID = req.user._id;

    // ── 1. Validate inputs ────────────────────────────────────────────────────
    if (!req.file)
      return res.status(400).json({ success: false, message: "Image is required" });
    if (!latitude || !longitude)
      return res.status(400).json({ success: false, message: "latitude and longitude are required" });

    const imageUrl = `/uploads/${req.file.filename}`;
    const newLat   = parseFloat(latitude);
    const newLon   = parseFloat(longitude);

    // ── 2. ML model ───────────────────────────────────────────────────────────
    let wastePercentage = 0, wasteType = "Unknown", severity = "Medium";
    let mlConfidence = 0, mlRawResponse = {};

    try {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(req.file.path));

      const mlResponse = await axios.post(ML_API_URL, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 15000,
      });

      mlRawResponse   = mlResponse.data;
      wastePercentage = mlResponse.data.waste_percentage ?? 0;
      wasteType       = mlResponse.data.waste_type       ?? "Unknown";
      severity        = mlResponse.data.severity         ?? "Medium";
      mlConfidence    = mlResponse.data.confidence       ?? 0;
    } catch (mlError) {
      console.warn("⚠️  ML model unavailable:", mlError.message);
    }

    // ── 3. Save Complaint ─────────────────────────────────────────────────────
    const complaint = await Complaint.create({
      userID,
      imageUrl,
      wastePercentage,
      wasteType,
      severity,
      mlConfidence,
      mlRawResponse,
      latitude: newLat,
      longitude: newLon,
      address: address || "",
      currentStatus: "Waste",
    });

    // ── 4. Save MapData ───────────────────────────────────────────────────────
    await MapData.create({
      userID,
      complaintID: complaint._id,
      latitude: newLat,
      longitude: newLon,
      address: address || "",
      state: "Waste",
      wastePercentage,
      wasteType,
      severity,
    });

    // ── 5. Save ComplaintStatus ───────────────────────────────────────────────
    await ComplaintStatus.create({
      userID,
      complaintID: complaint._id,
      status: "Pending",
      statusHistory: [{ status: "Pending", note: "Complaint submitted by user" }],
    });

    // ── 6. Find nearby complaints within 0.3 km (exclude Completed) ──────────
    //
    //  MongoDB $geoNear would be ideal but requires a 2dsphere index.
    //  We do a fast bounding-box pre-filter first (≈ ±0.3 km in degrees),
    //  then exact Haversine filtering in JS — no index migration needed.
    //
    const RADIUS_KM  = 0.3;
    const LAT_DELTA  = RADIUS_KM / 111;          // 1° lat  ≈ 111 km
    const LON_DELTA  = RADIUS_KM / (111 * Math.cos((newLat * Math.PI) / 180));

    const nearbyComplaints = await Complaint.find({
      _id:           { $ne: complaint._id },          // exclude the new one
      userID:        { $ne: userID },                  // exclude same user
      currentStatus: { $ne: "Completed" },             // only active
      latitude:  { $gte: newLat - LAT_DELTA, $lte: newLat + LAT_DELTA },
      longitude: { $gte: newLon - LON_DELTA, $lte: newLon + LON_DELTA },
    }).lean();

    // Exact 0.3 km filter using Haversine
    const trueNearby = nearbyComplaints.filter(
      (c) => haversineDistance(newLat, newLon, c.latitude, c.longitude) <= RADIUS_KM
    );

    // ── 7. Notify affected users ──────────────────────────────────────────────
    if (trueNearby.length > 0) {
      // Fetch statuses for nearby complaints in one query
      const nearbyIDs = trueNearby.map((c) => c._id);
      const statuses  = await ComplaintStatus.find(
        { complaintID: { $in: nearbyIDs } },
        { complaintID: 1, status: 1 }
      ).lean();

      const statusMap = Object.fromEntries(
        statuses.map((s) => [s.complaintID.toString(), s.status])
      );

      // Build one notification per affected user
      const notifications = trueNearby.map((nearbyComplaint) => {
        const nearbyStatus = statusMap[nearbyComplaint._id.toString()] ?? "Pending";
        return {
          userID:      nearbyComplaint.userID,          // ← user to notify
          complaintID: complaint._id,                   // ← the NEW complaint
          type:        "NEARBY_COMPLAINT",
          title:       "New complaint reported near you",
          message:
            `A new waste complaint was reported ${(
              haversineDistance(newLat, newLon, nearbyComplaint.latitude, nearbyComplaint.longitude) * 1000
            ).toFixed(0)} m from your complaint. ` +
            `Your complaint status: ${nearbyStatus}. ` +
            `New complaint severity: ${severity}.`,
          metadata: {
            newComplaintID:      complaint._id,
            nearbyComplaintID:   nearbyComplaint._id,
            nearbyComplaintStatus: nearbyStatus,
            distanceMeters: Math.round(
              haversineDistance(newLat, newLon, nearbyComplaint.latitude, nearbyComplaint.longitude) * 1000
            ),
            newSeverity:   severity,
            newWasteType:  wasteType,
            newAddress:    address || "",
          },
          isRead: false,
        };
      });

      // Save all notifications in one batch
      const savedNotifications = await Notification.insertMany(notifications);

      // Real-time push via Socket.io (if io is attached to app)
      const io = req.app.get("io"); // set this in server.js: app.set("io", io)
      if (io) {
        savedNotifications.forEach((notif) => {
          io.to(notif.userID.toString()).emit("nearby_complaint_notification", {
            notificationID: notif._id,
            title:          notif.title,
            message:        notif.message,
            metadata:       notif.metadata,
            createdAt:      notif.createdAt,
          });
        });
      }

      console.log(
        `📍 Notified ${savedNotifications.length} user(s) about new complaint near (${newLat}, ${newLon})`
      );
    }

    // ── 8. Response ───────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: {
        complaintID:    complaint._id,
        imageUrl:       complaint.imageUrl,
        wastePercentage,
        wasteType,
        severity,
        mlConfidence,
        latitude:       complaint.latitude,
        longitude:      complaint.longitude,
        address:        complaint.address,
        currentStatus:  complaint.currentStatus,
        nearbyAlerts:   trueNearby.length, // how many users were notified
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