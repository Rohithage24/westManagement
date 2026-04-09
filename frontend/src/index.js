import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global/styles.css";
import { AuthProvider } from "./context/AuthContext"; // ✅ import it

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);