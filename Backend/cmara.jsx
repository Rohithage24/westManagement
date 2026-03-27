// ComplaintForm.jsx
import { useState } from "react";
import EXIF from "exifr"; // npm install exifr

export default function ComplaintForm() {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [gpsInfo, setGpsInfo] = useState(null);   // { latitude, longitude } from EXIF
  const [gpsError, setGpsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  // ── Handle image → extract EXIF GPS only ──────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset state
    setImage(null);
    setPreview(null);
    setGpsInfo(null);
    setGpsError("");
    setResult(null);

    // Show preview immediately
    setPreview(URL.createObjectURL(file));

    try {
      const gps = await EXIF.gps(file); // returns { latitude, longitude } or undefined

      if (gps?.latitude && gps?.longitude) {
        setImage(file);
        setGpsInfo({ latitude: gps.latitude, longitude: gps.longitude });
      } else {
        // No EXIF GPS — block the image, don't set image state
        setGpsError(
          "This image has no GPS data. Please use a photo taken with location/GPS enabled on your phone camera."
        );
      }
    } catch (err) {
      console.warn("EXIF read error:", err.message);
      setGpsError(
        "Could not read GPS from this image. Please use a photo taken with location enabled."
      );
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hard guards — should never reach here due to disabled button, but just in case
    if (!image)   return alert("Please select a valid image with GPS data.");
    if (!gpsInfo) return alert("No GPS data found in image.");

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image",     image);
      formData.append("address",   address);
      formData.append("latitude",  gpsInfo.latitude);
      formData.append("longitude", gpsInfo.longitude);

      const res = await fetch("/api/complaint/submit", {
        method:      "POST",
        body:        formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 409) {
        // Duplicate blocked — show existing complaint info
        setResult({ type: "duplicate", data: data.existingComplaint, message: data.message });
      } else if (data.success) {
        setResult({ type: "success", data: data.data });
        // Reset form after success
        setImage(null);
        setPreview(null);
        setAddress("");
        setGpsInfo(null);
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch (err) {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Report Waste Complaint</h2>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photo <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(must be taken with GPS/location ON)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"        // opens rear camera on mobile
          onChange={handleImageChange}
          className="w-full border rounded-lg p-2 text-sm"
        />

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 rounded-lg w-full object-cover max-h-52"
          />
        )}

        {/* GPS success badge */}
        {gpsInfo && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2">
            <span>✅</span>
            <div>
              <p className="font-medium">GPS data found in image</p>
              <p className="font-mono text-xs text-green-600 mt-0.5">
                {gpsInfo.latitude.toFixed(6)}, {gpsInfo.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* GPS error — blocks submission */}
        {gpsError && (
          <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2">
            <span>❌</span>
            <div>
              <p className="font-medium">No GPS data in image</p>
              <p className="mt-0.5">{gpsError}</p>
              <p className="mt-1 text-xs text-red-600">
                Tip: Open your phone Camera app → Settings → turn on "Location tags" or "GPS tag", then retake the photo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address / Landmark
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Near City Park, Main Road"
          className="w-full border rounded-lg p-2 text-sm"
        />
      </div>

      {/* Submit — disabled until image WITH valid GPS is selected */}
      <button
        onClick={handleSubmit}
        disabled={loading || !image || !gpsInfo}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>

      {/* ── Result panels ─────────────────────────────────────────────────── */}

      {result?.type === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-1">
          <p className="font-semibold text-green-800">✅ Complaint Submitted!</p>
          <p>Waste Type: <strong>{result.data.wasteType}</strong></p>
          <p>Severity:   <strong>{result.data.severity}</strong></p>
          <p>Status:     <strong>{result.data.currentStatus}</strong></p>
          {result.data.nearbyActiveComplaints?.count > 0 && (
            <p className="text-yellow-700 mt-2">
              ⚠️ {result.data.nearbyActiveComplaints.count} other active complaint(s)
              already reported in this area.
            </p>
          )}
        </div>
      )}

      {result?.type === "duplicate" && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 text-sm space-y-1">
          <p className="font-semibold text-orange-800">⚠️ {result.message}</p>
          <p>Your existing status: <strong>{result.data.status}</strong></p>
          <p>Distance: <strong>{result.data.distanceMeters}m away</strong></p>
          <p className="text-xs text-orange-600 mt-1">
            Please wait for your existing complaint to be resolved before submitting a new one in this area.
          </p>
        </div>
      )}

      {result?.type === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          ❌ {result.message}
        </div>
      )}
    </div>
  );
}