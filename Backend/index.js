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
    console.log(`  🟢 POST   ${BASE}/api/user/login          → Login`);
    console.log(`  🟢 POST   ${BASE}/api/user/logout         → Logout`);
    console.log(`  🔒 GET    ${BASE}/api/user/me             → My profile`);
    console.log(`  🔒 PATCH  ${BASE}/api/user/update         → Update profile`);
    console.log(`  🔒 DELETE ${BASE}/api/user/delete         → Delete account`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🏛️   ADMIN ROUTES  (municipality / government / grampanchayat)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 POST   ${BASE}/api/admin/register                   → Register admin`);
    console.log(`  🟢 POST   ${BASE}/api/admin/login                      → Login admin`);
    console.log(`  🟢 POST   ${BASE}/api/admin/logout                     → Logout admin`);
    console.log(`  🔐 GET    ${BASE}/api/admin/me                         → My admin profile`);
    console.log(`  🔐 PATCH  ${BASE}/api/admin/me/update                  → Update profile`);
    console.log(`  🔐 GET    ${BASE}/api/admin/complaints/stats            → Dashboard stats`);
    console.log(`  🔐 GET    ${BASE}/api/admin/complaints                  → All complaints`);
    console.log(`  🔐 GET    ${BASE}/api/admin/complaints/:id              → Single complaint`);
    console.log(`  🔐 PATCH  ${BASE}/api/admin/complaints/:id             → Update complaint info`);
    console.log(`  🔐 PATCH  ${BASE}/api/admin/complaints/:id/status      → Update complaint status`);
    console.log(`  🏛️  GET    ${BASE}/api/admin/list                       → List all admins [gov only]`);
    console.log(`  🏛️  PATCH  ${BASE}/api/admin/:id/deactivate             → Deactivate admin [gov only]`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🗑️   COMPLAINT ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🔒 POST   ${BASE}/api/complaint/submit    → Submit (image+loc → ML → DB)`);
    console.log(`  🟢 GET    ${BASE}/api/complaint/all       → All complaints`);
    console.log(`  🔒 GET    ${BASE}/api/complaint/my        → My complaints`);
    console.log(`  🟢 GET    ${BASE}/api/complaint/:id       → Single complaint`);
    console.log(`  🔒 DELETE ${BASE}/api/complaint/:id       → Delete`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🗺️   MAP DATA ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 GET    ${BASE}/api/map/all`);
    console.log(`  🔒 GET    ${BASE}/api/map/my`);
    console.log(`  🟢 GET    ${BASE}/api/map/filter?state=Waste`);
    console.log(`  🟢 GET    ${BASE}/api/map/:complaintID`);
    console.log(`  🟢 PATCH  ${BASE}/api/map/:complaintID/state`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📋  COMPLAINT STATUS ROUTES`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 GET    ${BASE}/api/status/all`);
    console.log(`  🔒 GET    ${BASE}/api/status/my`);
    console.log(`  🟢 GET    ${BASE}/api/status/:complaintID`);
    console.log(`  🟢 GET    ${BASE}/api/status/:complaintID/history`);
    console.log(`  🟢 PATCH  ${BASE}/api/status/:complaintID`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🏥 GET  ${BASE}/WestManagement`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  🟢 Public  🔒 User cookie  🔐 Admin cookie  🏛️ Government only\n`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => { console.log("Server closed."); process.exit(0); });
  };

  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();