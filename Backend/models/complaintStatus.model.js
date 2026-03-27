// models/complaintStatus.model.js

import mongoose from "mongoose";

const complaintStatusSchema = new mongoose.Schema(
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
      unique: true,   // one status record per complaint
    },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Accept", "Working", "Complete"],
      default: "Pending",
    },

    // ── Status History (audit trail) ─────────────────────────────────────────
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Pending", "Accept", "Working", "Complete"],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,   // optional admin note e.g. "Team dispatched"
          default: "",
        },
      },
    ],

    // ── Assigned To (optional admin/worker) ──────────────────────────────────
    assignedTo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ComplaintStatus = mongoose.model("ComplaintStatus", complaintStatusSchema);
export default ComplaintStatus;