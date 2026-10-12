import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Restore saved appearance before the app renders
const savedTheme = localStorage.getItem("hotel_theme") || "indigo";
const savedMode = localStorage.getItem("hotel_mode") || "light";
const savedStyle = localStorage.getItem("hotel_style") || "modern";

document.documentElement.setAttribute("data-theme", savedTheme);
document.documentElement.setAttribute("data-mode", savedMode);
document.documentElement.setAttribute("data-style", savedStyle);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);