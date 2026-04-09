// MapPage.jsx
// Install: npm install react-leaflet leaflet axios

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// ─── Fix broken default Leaflet icons in webpack/vite ────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const API_URL = "http://localhost:5000/api/map/all";

// ─── State → color config ─────────────────────────────────────────────────────
const STATE_CONFIG = {
  Waste:    { color: "#ef4444", glow: "#ef444440", label: "Waste",    emoji: "🔴" },
  Pending:  { color: "#f59e0b", glow: "#f59e0b40", label: "Pending",  emoji: "🟡" },
  Complete: { color: "#22c55e", glow: "#22c55e40", label: "Complete", emoji: "🟢" },
};

// ─── Custom SVG pin icon ──────────────────────────────────────────────────────
const createIcon = (state) => {
  const { color } = STATE_CONFIG[state] || STATE_CONFIG.Waste;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3"
        flood-color="${color}" flood-opacity="0.55"/></filter>
    </defs>
    <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 26 14 26S32 26 32 16C32 8.268 25.732 2 18 2z"
      fill="${color}" filter="url(#s)" stroke="white" stroke-width="1.8"/>
    <circle cx="18" cy="16" r="6" fill="white" opacity="0.92"/>
  </svg>`;
  return L.divIcon({
    html: svg, className: "",
    iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -46],
  });
};

// ─── Blue pulsing dot for user location ──────────────────────────────────────
const userIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;background:#3b82f6;
    border:3px solid #fff;border-radius:50%;
    box-shadow:0 0 0 6px #3b82f650;
    animation:pulse-dot 1.8s ease-in-out infinite;
  "></div>`,
  className: "", iconSize: [18, 18], iconAnchor: [9, 9],
});

// ─── Fly to user position ─────────────────────────────────────────────────────
function FlyToUser({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 14, { duration: 1.6 }); }, [pos]);
  return null;
}

// =============================================================================
//  MapPage Component
// =============================================================================
export default function MapPage() {
  const [pins,     setPins]     = useState([]);
  const [userPos,  setUserPos]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);

  // ── Fetch all map pins ────────────────────────────────────────────────────
  useEffect(() => {
    axios.get(API_URL, { withCredentials: true })
      .then(r => setPins(r.data.data || []))
      .catch(() => setError("Cannot connect to backend. Is it running?"))
      .finally(() => setLoading(false));
  }, []);

  // ── Get user GPS ──────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos([p.coords.latitude, p.coords.longitude]),
      e => console.warn("GPS denied:", e.message)
    );
  }, []);

  const stats = { Waste: 0, Pending: 0, Complete: 0 };
  pins.forEach(p => { if (stats[p.state] !== undefined) stats[p.state]++; });

  const visible = filter === "All" ? pins : pins.filter(p => p.state === filter);
  const center  = userPos || [20.5937, 78.9629];

  return (
    <>
      <style>@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
</style>

      <div className="mp">

        {/* ── Header ── */}
        <header className="hdr">
          <div className="hdr-l">
            <div className="pulse-dot" />
            <h1>Waste<em>Map</em></h1>
          </div>
          <span className="hdr-count">{visible.length} report{visible.length !== 1 ? "s" : ""}</span>
        </header>

        {/* ── Filter Chips ── */}
        <div className="fbar">
          {[
            { k: "All",      color: "#3b82f6", count: pins.length },
            { k: "Waste",    color: "#ef4444", count: stats.Waste },
            { k: "Pending",  color: "#f59e0b", count: stats.Pending },
            { k: "Complete", color: "#22c55e", count: stats.Complete },
          ].map(({ k, color, count }) => (
            <button
              key={k}
              className={`chip ${filter === k ? `a-${k.toLowerCase()}` : ""}`}
              onClick={() => setFilter(k)}
            >
              <span className="cdot" style={{ background: color }} />
              {k} · {count}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="body">

          {/* ── Map ── */}
          <div className="mwrap">
            {loading && <div className="ov"><div className="spin" /><p>Loading waste reports…</p></div>}
            {error   && <div className="ov"><p className="err">⚠️ {error}</p></div>}

            <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
              />

              {userPos && <FlyToUser pos={userPos} />}

              {/* User location */}
              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup>
                    <div className="pop">
                      <div className="pop-title">📍 Your Location</div>
                      <div className="pop-row"><span>Lat</span><span>{userPos[0].toFixed(5)}</span></div>
                      <div className="pop-row"><span>Lng</span><span>{userPos[1].toFixed(5)}</span></div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Waste pins */}
              {visible.map((pin) => {
                const cfg = STATE_CONFIG[pin.state] || STATE_CONFIG.Waste;
                return (
                  <Marker
                    key={pin._id}
                    position={[pin.latitude, pin.longitude]}
                    icon={createIcon(pin.state)}
                    eventHandlers={{ click: () => setSelected(pin._id) }}
                  >
                    <Popup>
                      <div className="pop">
                        <span className="pop-badge" style={{ background: cfg.color + "28", color: cfg.color }}>
                          {cfg.emoji} {pin.state}
                        </span>
                        <div className="pop-title">{pin.wasteType || "Unknown Waste"}</div>
                        {pin.address && (
                          <div className="pop-row"><span>📍 Address</span><span>{pin.address}</span></div>
                        )}
                        <div className="pop-row">
                          <span>Waste Level</span>
                          <span style={{ color: cfg.color, fontWeight: 700 }}>{pin.wastePercentage ?? 0}%</span>
                        </div>
                        <div className="pop-row"><span>Severity</span><span>{pin.severity || "—"}</span></div>
                        <div className="pop-row"><span>Reported by</span><span>{pin.userID?.name || "Anonymous"}</span></div>
                        <div className="pop-row">
                          <span>Lat / Lng</span>
                          <span>{pin.latitude?.toFixed(4)}, {pin.longitude?.toFixed(4)}</span>
                        </div>
                      </div>
                    </Popup>

                    {/* Glow ring around pin */}
                    <Circle
                      center={[pin.latitude, pin.longitude]}
                      radius={55}
                      pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.08, weight: 1.2 }}
                    />
                  </Marker>
                );
              })}
            </MapContainer>

            {/* ── Legend ── */}
            <div className="leg">
              <div className="leg-ttl">Legend</div>
              {[
                { color: "#ef4444", label: "Waste Reported" },
                { color: "#f59e0b", label: "Pending Review" },
                { color: "#22c55e", label: "Cleaned / Done" },
                { color: "#3b82f6", label: "Your Location" },
              ].map(({ color, label }) => (
                <div key={label} className="leg-row">
                  <span className="ldot" style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="side">
            <div className="side-hdr">Reports ({visible.length})</div>
            <div className="list">
              {visible.length === 0 && !loading && (
                <p className="empty">No reports found for this filter.</p>
              )}
              {visible.map((pin) => {
                const cfg = STATE_CONFIG[pin.state] || STATE_CONFIG.Waste;
                const badgeCls = pin.state === "Waste" ? "bw" : pin.state === "Pending" ? "bp" : "bc";
                return (
                  <div
                    key={pin._id}
                    className={`card ${selected === pin._id ? "sel" : ""}`}
                    onClick={() => setSelected(pin._id)}
                  >
                    <div className="card-top">
                      <span className={`badge ${badgeCls}`}>{cfg.emoji} {pin.state}</span>
                      <span className="cpct" style={{ color: cfg.color }}>{pin.wastePercentage ?? 0}%</span>
                    </div>
                    <div className="ctype">{pin.wasteType || "Unknown Waste"}</div>
                    <div className="caddr">
                      {pin.address || `${pin.latitude?.toFixed(4)}, ${pin.longitude?.toFixed(4)}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}