// index.js

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/mongodb.js";
import server from "./app.js";

const PORT = process.env.PORT || 5000;
const BASE = `http://localhost:${PORT}`;

const start = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on ${BASE}`);
    console.log(`📦 Environment : ${process.env.NODE_ENV || "development"}`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤  USER ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 POST   ${BASE}/api/user/register       → Register`);
    console.log(`  🟢 POST   ${BASE}/api/user/login          → Login (set cookie)`);
    console.log(`  🟢 POST   ${BASE}/api/user/logout         → Logout`);
    console.log(`  🔒 GET    ${BASE}/api/user/me             → My profile`);
    console.log(`  🔒 PATCH  ${BASE}/api/user/update         → Update profile`);
    console.log(`  🔒 DELETE ${BASE}/api/user/delete         → Delete account`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🗑️   COMPLAINT ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🔒 POST   ${BASE}/api/complaint/submit    → Submit (image+loc → ML → DB)`);
    console.log(`  🟢 GET    ${BASE}/api/complaint/all       → All complaints (admin)`);
    console.log(`  🔒 GET    ${BASE}/api/complaint/my        → My complaints`);
    console.log(`  🟢 GET    ${BASE}/api/complaint/:id       → Single complaint`);
    console.log(`  🔒 DELETE ${BASE}/api/complaint/:id       → Delete complaint`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🗺️   MAP DATA ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 GET    ${BASE}/api/map/all                    → All map pins`);
    console.log(`  🔒 GET    ${BASE}/api/map/my                     → My map pins`);
    console.log(`  🟢 GET    ${BASE}/api/map/filter?state=Waste     → Filter by state`);
    console.log(`  🟢 GET    ${BASE}/api/map/:complaintID           → Single pin`);
    console.log(`  🟢 PATCH  ${BASE}/api/map/:complaintID/state     → Update pin state`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📋  COMPLAINT STATUS ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 GET    ${BASE}/api/status/all                 → All statuses (admin)`);
    console.log(`  🔒 GET    ${BASE}/api/status/my                  → My statuses`);
    console.log(`  🟢 GET    ${BASE}/api/status/:complaintID        → Single status`);
    console.log(`  🟢 GET    ${BASE}/api/status/:complaintID/history→ Status history`);
    console.log(`  🟢 PATCH  ${BASE}/api/status/:complaintID        → Update status`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🏥 GET    ${BASE}/WestManagement                         → WestManagement check`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 Public   🔒 Protected (cookie JWT required)\n`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();