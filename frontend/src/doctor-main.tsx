import React from "react";
import ReactDOM from "react-dom/client";

import DoctorPortal from "./pages/doctor/DoctorPortal";

import "./pages/doctor/DoctorPortal.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <DoctorPortal />
  </React.StrictMode>
);