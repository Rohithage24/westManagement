// models/mapData.model.js

import mongoose from "mongoose";

const mapDataSchema = new mongoose.Schema(
  {
    // ── References ──────────────────────────────────────────────────────────
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userID is required"],
    },

    complaintID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: [true, "complaintID is required"],
      unique: true,   // one map pin per complaint
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

    // ── Map Pin State ────────────────────────────────────────────────────────
    // This mirrors complaint state so map can color pins easily:
    //   Red    → Waste
    //   Yellow → Pending
    //   Green  → Complete
    state: {
      type: String,
      enum: ["Waste", "Pending", "Complete"],
      default: "Waste",
    },

    // ── Extra display info ───────────────────────────────────────────────────
    wastePercentage: {
      type: Number,
      default: 0,
    },

    wasteType: {
      type: String,
      default: "Unknown",
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

// Geospatial index for map queries (find complaints near a location)
mapDataSchema.index({ latitude: 1, longitude: 1 });

const MapData = mongoose.model("MapData", mapDataSchema);
export default MapData;