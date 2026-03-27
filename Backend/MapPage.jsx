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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#090e1a; --sur:#101828; --brd:#1a2740;
          --txt:#e2e8f0; --mut:#64748b;
          --red:#ef4444; --yel:#f59e0b; --grn:#22c55e; --blu:#3b82f6;
        }
        html,body,#root{height:100%;background:var(--bg);color:var(--txt);font-family:'DM Sans',sans-serif}
        .mp{display:flex;flex-direction:column;height:100vh;overflow:hidden}

        /* header */
        .hdr{display:flex;align-items:center;justify-content:space-between;
          padding:12px 22px;background:var(--sur);border-bottom:1px solid var(--brd);z-index:999}
        .hdr-l{display:flex;align-items:center;gap:10px}
        .pulse-dot{width:9px;height:9px;border-radius:50%;background:var(--grn);
          box-shadow:0 0 8px var(--grn);animation:blink 2s infinite}
        .hdr h1{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:800;
          letter-spacing:-0.02em}
        .hdr h1 em{font-style:normal;color:var(--grn)}
        .hdr-count{font-size:0.78rem;color:var(--mut);font-family:'Syne',sans-serif}

        /* filter bar */
        .fbar{display:flex;gap:7px;padding:9px 22px;background:var(--sur);
          border-bottom:1px solid var(--brd);overflow-x:auto;flex-shrink:0}
        .fbar::-webkit-scrollbar{display:none}
        .chip{display:flex;align-items:center;gap:7px;padding:5px 13px;
          border-radius:999px;border:1.5px solid var(--brd);background:var(--bg);
          cursor:pointer;font-family:'Syne',sans-serif;font-size:0.78rem;font-weight:700;
          color:var(--mut);white-space:nowrap;transition:all .18s}
        .chip:hover{border-color:var(--mut);color:var(--txt)}
        .chip.a-all    {border-color:var(--blu);color:var(--blu);background:#3b82f610}
        .chip.a-waste  {border-color:var(--red);color:var(--red);background:#ef444412}
        .chip.a-pending{border-color:var(--yel);color:var(--yel);background:#f59e0b12}
        .chip.a-complete{border-color:var(--grn);color:var(--grn);background:#22c55e12}
        .cdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

        /* body */
        .body{display:flex;flex:1;overflow:hidden;position:relative}
        .mwrap{flex:1;position:relative}
        .mwrap .leaflet-container{width:100%;height:100%;background:#05090f}

        /* sidebar */
        .side{width:300px;flex-shrink:0;background:var(--sur);
          border-left:1px solid var(--brd);display:flex;flex-direction:column;overflow:hidden}
        .side-hdr{padding:14px 18px;border-bottom:1px solid var(--brd);
          font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;
          color:var(--mut);letter-spacing:.1em;text-transform:uppercase}
        .list{flex:1;overflow-y:auto;padding:8px}
        .list::-webkit-scrollbar{width:3px}
        .list::-webkit-scrollbar-thumb{background:var(--brd);border-radius:4px}

        .card{padding:11px 13px;border-radius:10px;border:1.5px solid var(--brd);
          margin-bottom:7px;cursor:pointer;transition:all .17s;background:var(--bg)}
        .card:hover{border-color:var(--mut);transform:translateX(3px)}
        .card.sel{border-color:var(--blu);background:#3b82f60e}
        .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
        .badge{font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:999px;font-family:'Syne',sans-serif}
        .bw{background:#ef444420;color:var(--red)}
        .bp{background:#f59e0b20;color:var(--yel)}
        .bc{background:#22c55e20;color:var(--grn)}
        .ctype{font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:700;color:var(--txt);margin-bottom:2px}
        .caddr{font-size:0.74rem;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .cpct{font-family:'Syne',sans-serif;font-size:0.74rem}
        .empty{color:var(--mut);font-size:0.82rem;padding:10px 4px}

        /* popup */
        .leaflet-popup-content-wrapper{
          background:var(--sur)!important;border:1px solid var(--brd)!important;
          border-radius:12px!important;box-shadow:0 8px 30px #00000090!important;padding:0!important}
        .leaflet-popup-content{margin:0!important;width:230px!important;color:var(--txt)}
        .leaflet-popup-tip{background:var(--sur)!important}
        .leaflet-popup-close-button{color:var(--mut)!important;font-size:16px!important;top:8px!important;right:10px!important}
        .pop{padding:16px}
        .pop-badge{display:inline-block;font-size:0.68rem;font-weight:700;padding:2px 9px;
          border-radius:999px;font-family:'Syne',sans-serif;margin-bottom:9px}
        .pop-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:800;margin-bottom:8px}
        .pop-row{display:flex;justify-content:space-between;font-size:0.76rem;
          color:var(--mut);margin-bottom:4px}
        .pop-row span:last-child{color:var(--txt);font-weight:500}

        /* legend */
        .leg{position:absolute;bottom:20px;left:14px;z-index:999;
          background:var(--sur);border:1px solid var(--brd);border-radius:10px;
          padding:11px 15px;display:flex;flex-direction:column;gap:7px}
        .leg-ttl{font-family:'Syne',sans-serif;font-size:0.65rem;font-weight:700;
          letter-spacing:.1em;text-transform:uppercase;color:var(--mut);margin-bottom:2px}
        .leg-row{display:flex;align-items:center;gap:8px;font-size:0.76rem}
        .ldot{width:10px;height:10px;border-radius:50%;flex-shrink:0}

        /* overlays */
        .ov{position:absolute;inset:0;display:flex;flex-direction:column;
          align-items:center;justify-content:center;background:var(--bg);z-index:9999;gap:13px}
        .spin{width:38px;height:38px;border:3px solid var(--brd);
          border-top-color:var(--grn);border-radius:50%;animation:spin .8s linear infinite}
        .ov p{font-family:'Syne',sans-serif;font-size:0.88rem;color:var(--mut)}
        .err{color:var(--red);text-align:center;max-width:260px;line-height:1.5}

        @keyframes spin {to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 6px #3b82f650}50%{box-shadow:0 0 0 13px #3b82f618}}

        @media(max-width:640px){.side{display:none}.fbar{padding:8px 12px}.hdr{padding:10px 14px}}
      `}</style>

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