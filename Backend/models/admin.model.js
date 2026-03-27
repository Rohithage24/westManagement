// models/admin.model.js

import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Role / Authority Type ────────────────────────────────────────────────
    // municipality   → City Municipal Corporation (e.g. NMC, PMC)
    // government     → State/Central Government Officer (IAS, Collector)
    // grampanchayat  → Village Panchayat Officer / Sarpanch
    role: {
      type: String,
      enum: ["municipality", "government", "grampanchayat"],
      required: [true, "Role is required"],
    },

    // ── Jurisdiction / Area they manage ─────────────────────────────────────
    jurisdiction: {
      type: String,
      required: [true, "Jurisdiction area is required"],
      trim: true,
      // e.g. "Nagpur Municipal Corporation", "Wardha Grampanchayat", "Maharashtra State"
    },

    // ── Department ───────────────────────────────────────────────────────────
    department: {
      type: String,
      trim: true,
      default: "Sanitation & Waste Management",
      // e.g. "Sanitation & Waste Management", "Public Works", "Environment"
    },

    // ── Designation ──────────────────────────────────────────────────────────
    designation: {
      type: String,
      trim: true,
      default: "",
      // e.g. "Sanitation Officer", "Ward Officer", "Sarpanch", "District Collector"
    },

    // ── Address / Office ─────────────────────────────────────────────────────
    officeAddress: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Account Status ───────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;