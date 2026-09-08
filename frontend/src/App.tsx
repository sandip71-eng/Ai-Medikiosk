import { useState } from "react";
import "./App.css";

import PatientDetails from "./pages/PatientDetails";
import Consultation from "./pages/Consultation";
import ClinicalSummary from "./pages/ClinicalSummary";
import DocumentUpload from "./pages/DocumentUpload";

interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
  consent: boolean;
}

export interface ClinicalData {
  complaint: string;
  duration: string;
  severity: string;
  symptoms: string;
  previousHistory: string;
  medicines: string;
  allergies: string;
}

type Screen =
  | "welcome"
  | "patient"
  | "consultation"
  | "summary"
  | "documents";

function App() {
  const [screen, setScreen] = useState<Screen>("welcome");

  const [patient, setPatient] = useState<Patient | null>(null);

  const [clinicalData, setClinicalData] = useState<ClinicalData>({
    complaint: "",
    duration: "",
    severity: "",
    symptoms: "",
    previousHistory: "",
    medicines: "",
    allergies: "",
  });

  const handlePatientComplete = (data: Patient) => {
    setPatient(data);
    setScreen("consultation");
  };

  const handleConsultationComplete = (data: ClinicalData) => {
    setClinicalData(data);
    setScreen("summary");
  };

  return (
    <>
      {screen === "welcome" && (
        <div className="welcome-page">

          <header className="welcome-header">
            <div className="logo">
              <span>✚</span> MediKiosk
            </div>

            <div className="team-name">
              Team <strong>NextGen</strong>
            </div>
          </header>

          <main className="hero-section">

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
                MediKiosk uses AI, voice interaction and document
                intelligence to prepare a structured clinical history
                before your doctor consultation.
              </p>

              <div className="hero-buttons">

                <button
                  className="start-button"
                  onClick={() => setScreen("patient")}
                >
                  Start Consultation →
                </button>

                <button
                  className="hindi-button"
                  onClick={() => setScreen("patient")}
                >
                  हिंदी में शुरू करें
                </button>

              </div>

              <div className="feature-row">

                <div className="feature">
                  <div className="feature-icon">🎙️</div>
                  <div>
                    <strong>Voice</strong>
                    <span>Natural conversation</span>
                  </div>
                </div>

                <div className="feature">
                  <div className="feature-icon">👆</div>
                  <div>
                    <strong>Touch</strong>
                    <span>Easy interaction</span>
                  </div>
                </div>

                <div className="feature">
                  <div className="feature-icon">🤖</div>
                  <div>
                    <strong>AI + OCR</strong>
                    <span>Smart medical records</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="kiosk-container">

              <div className="kiosk-glow"></div>

              <div className="kiosk">

                <div className="kiosk-screen">

                  <div className="screen-top">
                    <span>✚</span>
                    MediKiosk
                  </div>

                  <div className="screen-icon">
                    🩺
                  </div>

                  <div className="screen-title">
                    How are you feeling today?
                  </div>

                  <div className="screen-line"></div>
                  <div className="screen-line short"></div>

                  <div className="screen-button">
                    🎙️ Speak with MediKiosk
                  </div>

                </div>

                <div className="kiosk-base">
                  <div className="kiosk-slot"></div>
                </div>

              </div>

            </div>

          </main>

          <footer className="welcome-footer">
            <span>Smart India Hackathon 2026</span>
            <span>•</span>
            <span>SIH26047</span>
            <span>•</span>
            <span>Team NextGen</span>
          </footer>

        </div>
      )}

      {screen === "patient" && (
        <PatientDetails
          onComplete={handlePatientComplete}
        />
      )}

      {screen === "consultation" && patient && (
        <Consultation
          patient={patient}
          onComplete={handleConsultationComplete}
        />
      )}

      {screen === "summary" && patient && (
        <ClinicalSummary
          patient={patient}
          clinicalData={clinicalData}
          onDocuments={() => setScreen("documents")}
        />
      )}

      {screen === "documents" && (
        <DocumentUpload
          onComplete={() => setScreen("summary")}
        />
      )}
    </>
  );
}

export default App;