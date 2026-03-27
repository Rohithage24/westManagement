// controllers/mapData.controller.js

import MapData from "../models/mapData.model.js";


// =============================================================================
//  GET /api/map/all          Get all map pins (for full map view)
// =============================================================================
export const getAllMapData = async (req, res) => {
  try {
    const mapPins = await MapData.find()
      .populate("userID", "name gmail")
      .populate("complaintID", "imageUrl wastePercentage wasteType mlConfidence")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mapPins.length,
      data: mapPins,
    });
  } catch (error) {
    console.error("getAllMapData error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/map/my           Get logged-in user's map pins  (Protected)
// =============================================================================
export const getMyMapData = async (req, res) => {
  try {
    const mapPins = await MapData.find({ userID: req.user._id })
      .populate("complaintID", "imageUrl wastePercentage wasteType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mapPins.length,
      data: mapPins,
    });
  } catch (error) {
    console.error("getMyMapData error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/map/filter?state=Waste    Filter pins by state
// =============================================================================
export const getMapDataByState = async (req, res) => {
  try {
    const { state } = req.query;

    const validStates = ["Waste", "Pending", "Complete"];
    if (state && !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: `state must be one of: ${validStates.join(", ")}`,
      });
    }

    const filter = state ? { state } : {};

    const mapPins = await MapData.find(filter)
      .populate("userID", "name gmail")
      .populate("complaintID", "imageUrl wastePercentage wasteType severity")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mapPins.length,
      data: mapPins,
    });
  } catch (error) {
    console.error("getMapDataByState error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  GET /api/map/:complaintID         Get single map pin by complaintID
// =============================================================================
export const getMapDataByComplaint = async (req, res) => {
  try {
    const mapPin = await MapData.findOne({ complaintID: req.params.complaintID })
      .populate("userID", "name gmail")
      .populate("complaintID", "imageUrl wastePercentage wasteType severity mlConfidence");

    if (!mapPin) {
      return res.status(404).json({ success: false, message: "Map data not found" });
    }

    return res.status(200).json({ success: true, data: mapPin });
  } catch (error) {
    console.error("getMapDataByComplaint error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =============================================================================
//  PATCH /api/map/:complaintID/state     Update map pin state  (Admin)
//  Body: { state: "Pending" | "Complete" | "Waste" }
// =============================================================================
export const updateMapState = async (req, res) => {
  try {
    const { state } = req.body;
    const validStates = ["Waste", "Pending", "Complete"];

    if (!state || !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: `state must be one of: ${validStates.join(", ")}`,
      });
    }

    const mapPin = await MapData.findOneAndUpdate(
      { complaintID: req.params.complaintID },
      { state },
      { new: true }
    );

    if (!mapPin) {
      return res.status(404).json({ success: false, message: "Map data not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Map state updated",
      data: mapPin,
    });
  } catch (error) {
    console.error("updateMapState error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};






// http://localhost:5000/api/map/all  

// now give there fronted code to page name is Mappage to show map  get user location and show thete surroundig west state in colort tod like west =red , pending = yellow , complete=green this type