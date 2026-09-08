import "./ClinicalSummary.css";
import type { ClinicalData } from "../App";

interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
  consent: boolean;
}

interface ClinicalSummaryProps {
  patient: Patient;
  clinicalData: ClinicalData;
  onDocuments: () => void;
}

function ClinicalSummary({
  patient,
  clinicalData,
  onDocuments,
}: ClinicalSummaryProps) {

  return (
    <div className="summary-page">

      <header className="summary-header">

        <div className="summary-logo">
          <span>✚</span> MediKiosk
        </div>

        <div className="summary-team">
          Team <strong>NextGen</strong>
        </div>

      </header>

      <main className="summary-container">

        <div className="summary-title">

          <span className="summary-badge">
            AI CLINICAL SUMMARY
          </span>

          <h1>History Collection Completed</h1>

          <p>
            MediKiosk has successfully structured the information
            collected during your consultation.
          </p>

        </div>

        {/* PATIENT INFORMATION */}

        <section className="summary-card">

          <h2>Patient Information</h2>

          <div className="patient-grid">

            <div>
              <span className="field-label">Full Name</span>
              <strong>{patient.name || "Not provided"}</strong>
            </div>

            <div>
              <span className="field-label">Age</span>
              <strong>{patient.age || "Not provided"}</strong>
            </div>

            <div>
              <span className="field-label">Gender</span>
              <strong>{patient.gender || "Not provided"}</strong>
            </div>

            <div>
              <span className="field-label">Language</span>
              <strong>{patient.language || "English"}</strong>
            </div>

          </div>

        </section>

        {/* CHIEF COMPLAINT */}

        <section className="summary-card">

          <h2>Chief Complaint</h2>

          <div className="summary-content">
            {clinicalData.complaint || "No complaint recorded."}
          </div>

        </section>

        {/* HISTORY OF PRESENT ILLNESS */}

        <section className="summary-card">

          <h2>History of Present Illness</h2>

          <div className="hpi-grid">

            <div>
              <span className="field-label">Duration</span>
              <strong>
                {clinicalData.duration || "Not provided"}
              </strong>
            </div>

            <div>
              <span className="field-label">Severity</span>
              <strong>
                {clinicalData.severity || "Not provided"}
              </strong>
            </div>

            <div className="full-width">

              <span className="field-label">
                Associated Symptoms
              </span>

              <strong>
                {clinicalData.symptoms || "None reported"}
              </strong>

            </div>

            <div className="full-width">

              <span className="field-label">
                Previous Similar Problem
              </span>

              <strong>
                {clinicalData.previousHistory || "Not provided"}
              </strong>

            </div>

          </div>

        </section>

        {/* MEDICAL INFORMATION */}

        <section className="summary-card">

          <h2>Medical Information</h2>

          <div className="medical-grid">

            <div>

              <span className="field-label">
                Current Medicines
              </span>

              <strong>
                {clinicalData.medicines || "No medicines reported"}
              </strong>

            </div>

            <div>

              <span className="field-label">
                Known Allergies
              </span>

              <strong>
                {clinicalData.allergies || "No known allergies reported"}
              </strong>

            </div>

          </div>

        </section>

        {/* DOCUMENT BUTTON */}

        <section className="document-action-card">

          <div className="document-action-icon">
            📄
          </div>

          <div className="document-action-text">

            <h2>Previous Medical Documents</h2>

            <p>
              Have a prescription, blood test report, discharge
              summary or other medical document?
            </p>

          </div>

          <button
            className="scan-document-button"
            onClick={onDocuments}
          >
            Scan Medical Documents →
          </button>

        </section>

        {/* SAFETY NOTICE */}

        <div className="summary-notice">

          <span>⚕️</span>

          <div>

            <strong>Important Safety Notice</strong>

            <p>
              This AI-generated summary is intended to assist
              healthcare professionals. The information should be
              reviewed and verified by a qualified doctor before
              clinical decisions are made.
            </p>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="summary-actions">

          <button
            className="edit-summary-button"
            onClick={() => alert("Edit feature will be added next.")}
          >
            ✏️ Edit Information
          </button>

          <button
            className="send-doctor-button"
            onClick={() => alert("Summary prepared for doctor review.")}
          >
            👨‍⚕️ Send to Doctor →
          </button>

        </div>

      </main>

      <footer className="summary-footer">

        🔒 Secure Clinical Session
        <span>•</span>
        SIH26047
        <span>•</span>
        Team NextGen

      </footer>

    </div>
  );
}

export default ClinicalSummary;