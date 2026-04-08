// controllers/complaintStatus.controller.js

import ComplaintStatus from "../models/complaintStatus.model.js";
import MapData from "../models/mapData.model.js";
import Complaint from "../models/complaint.model.js";



// =============================================================================
//  GET /api/status/:complaintID       Get status of a complaint
// =============================================================================
export const getStatus = async (req, res) => {
  try {
    const statusRecord = await ComplaintStatus.findOne({
      complaintID: req.params.complaintID,
    })
      .populate("userID", "name gmail")
      .populate("complaintID", "imageUrl latitude longitude wasteType severity");

    if (!statusRecord) {
      return res.status(404).json({ success: false, message: "Status record not found" });
    }

    return res.status(200).json({ success: true, data: statusRecord });
  } catch (error) {
    console.error("getStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/status/my                 Get all statuses for logged-in user  (Protected)
// =============================================================================
export const getMyStatuses = async (req, res) => {
  try {
    const statuses = await ComplaintStatus.find({ userID: req.user._id })
      .populate("complaintID", "imageUrl latitude longitude wasteType severity createdAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: statuses.length,
      data: statuses,
    });
  } catch (error) {
    console.error("getMyStatuses error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/status/all                Get all statuses  (Admin)
// =============================================================================
export const getAllStatuses = async (req, res) => {
  try {
    const statuses = await ComplaintStatus.find()
      .populate("userID", "name gmail")
      .populate("complaintID", "imageUrl latitude longitude wasteType severity")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: statuses.length,
      data: statuses,
    });
  } catch (error) {
    console.error("getAllStatuses error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/status/:complaintID     Update complaint status  (Admin)
//  Body: { status: "Accept" | "Working" | "Complete", note: "optional" }
//
//  Status flow:  Pending → Accept → Working → Complete
//
//  When status changes → also update MapData.state and Complaint.currentStatus
// =============================================================================
export const updateStatus = async (req, res) => {
  try {
    const { status, note, assignedTo } = req.body;

    const validStatuses = ["Pending", "Accept", "Working", "Complete"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find existing status record
    const statusRecord = await ComplaintStatus.findOne({
      complaintID: req.params.complaintID,
    });

    if (!statusRecord) {
      return res.status(404).json({ success: false, message: "Status record not found" });
    }

    // Append to history
    statusRecord.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || "",
    });

    // Update current status
    statusRecord.status = status;
    if (assignedTo) statusRecord.assignedTo = assignedTo;

    await statusRecord.save();

    // ── Sync MapData state ────────────────────────────────────────────────
    // Map state: Pending → "Pending" | Complete → "Complete" | else → "Waste"
    const mapState =
       status === "Accept" ? "Accept" :
      status === "Working"  ? "Working"  : "Complete";

    await MapData.findOneAndUpdate(
      { complaintID: req.params.complaintID },
      { state: mapState }
    );

    // ── Sync Complaint.currentStatus ──────────────────────────────────────
    const complaintState =
       status === "Accept" ? "Accept" :
      status === "Working"  ? "Working"  : "Complete";

    await Complaint.findByIdAndUpdate(req.params.complaintID, {
      currentStatus: complaintState,
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}"`,
      data: statusRecord,
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/status/:complaintID/history   Get full status history
// =============================================================================
export const getStatusHistory = async (req, res) => {
  try {
    const statusRecord = await ComplaintStatus.findOne({
      complaintID: req.params.complaintID,
    });

    if (!statusRecord) {
      return res.status(404).json({ success: false, message: "Status record not found" });
    }

    return res.status(200).json({
      success: true,
      currentStatus: statusRecord.status,
      history: statusRecord.statusHistory,
    });
  } catch (error) {
    console.error("getStatusHistory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};