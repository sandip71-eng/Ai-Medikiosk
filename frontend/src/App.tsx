import { useState } from "react";

import "./App.css";

import PatientDetails from "./pages/PatientDetails";
import Consultation from "./pages/Consultation";
import ClinicalSummary from "./pages/ClinicalSummary";
import DocumentUpload from "./pages/DocumentUpload";


/* =========================================
   TYPES
========================================= */

type Screen =
  | "welcome"
  | "patient"
  | "consultation"
  | "summary"
  | "documents";


interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
  consent: boolean;
}


interface ClinicalData {
  complaint: string;
  duration: string;
  severity: string;
  symptoms: string;
  previousProblem: string;
  medicines: string;
  allergies: string;
}


/* =========================================
   APP
========================================= */

function App() {

  const [screen, setScreen] = useState<Screen>("welcome");

  const [patient, setPatient] = useState<Patient | null>(null);

  const [clinicalData, setClinicalData] =
    useState<ClinicalData | null>(null);


  /* =========================================
     WELCOME PAGE
  ========================================= */

  if (screen === "welcome") {

    return (
      <div className="app">

        {/* HEADER */}
        <header className="header">

          <div className="logo">
            <span>✚</span>
            MediKiosk
          </div>

          <div className="team">
            Team <strong>NextGen</strong>
          </div>

        </header>


        {/* HERO */}
        <main className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              AI-POWERED CLINICAL INTAKE
            </div>


            <h1>
              Your Health.
              <br />
              <span>Our Intelligence.</span>
            </h1>


            <p>
              A smarter way to share your health history
              before meeting your doctor.
            </p>


            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={() => setScreen("patient")}
              >
                Start Consultation →
              </button>


              <button
                className="secondary-button"
                onClick={() => setScreen("patient")}
              >
                हिंदी में शुरू करें
              </button>

            </div>


            <div className="features">

              <div>
                <span>🎤</span>
                Voice
              </div>

              <div>
                <span>👆</span>
                Touch
              </div>

              <div>
                <span>🤖</span>
                AI + OCR
              </div>

            </div>

          </div>

        </main>


        {/* FOOTER */}
        <footer className="footer">

          Smart India Hackathon 2026

          <span>•</span>

          SIH26047

          <span>•</span>

          Team NextGen

        </footer>

      </div>
    );
  }


  /* =========================================
     PATIENT DETAILS
  ========================================= */

  if (screen === "patient") {

    return (
      <PatientDetails
        onComplete={(data) => {

          setPatient(data);

          setScreen("consultation");

        }}
      />
    );
  }


  /* =========================================
     CONSULTATION
  ========================================= */

  if (screen === "consultation") {

    // Patient details must exist before consultation
    if (!patient) {

      setScreen("patient");

      return null;
    }


    return (
      <Consultation

        patient={patient}

        onComplete={(data) => {

          setClinicalData(data);

          setScreen("summary");

        }}

      />
    );
  }


  /* =========================================
     CLINICAL SUMMARY
  ========================================= */

  if (screen === "summary") {

    if (!patient || !clinicalData) {

      setScreen("patient");

      return null;
    }


    return (
      <ClinicalSummary
        patient={patient}
        clinicalData={clinicalData}
        onDocuments={() => setScreen("documents")}
      />
    );
  }


  /* =========================================
     DOCUMENT UPLOAD
  ========================================= */

  if (screen === "documents") {

    return (
      <DocumentUpload
        onComplete={() => setScreen("summary")}
      />
    );
  }


  return null;
}


export default App;