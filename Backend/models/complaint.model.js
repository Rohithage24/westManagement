// models/complaint.model.js

import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    // ── Who reported ────────────────────────────────────────────────────────
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userID is required"],
    },

    // ── Image ───────────────────────────────────────────────────────────────
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
    },

    // ── ML Model Results ────────────────────────────────────────────────────
    wastePercentage: {
      type: Number,       // e.g. 87.5 (%)
      default: 0,
    },

    wasteType: {
      type: String,       // e.g. "Plastic", "Organic", "Mixed"
      default: "Unknown",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    mlConfidence: {
      type: Number,       // e.g. 0.92 → 92%
      default: 0,
    },

    mlRawResponse: {
      type: mongoose.Schema.Types.Mixed, // full ML JSON saved as-is
      default: {},
    },

    // ── Location ────────────────────────────────────────────────────────────
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },

    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },

    address: {
      type: String,
      default: "",
    },

    // ── Status (reference to ComplaintStatus model) ──────────────────────
    currentStatus: {
      type: String,
      enum: ["Waste", "Pending", "Complete"],
      default: "Waste",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;