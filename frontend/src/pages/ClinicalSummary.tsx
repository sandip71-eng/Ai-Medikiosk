import "./ClinicalSummary.css";

interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
  consent?: boolean;
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

      {/* HEADER */}
      <header className="summary-header">
        <div className="summary-logo">
          <span>✚</span>
          MediKiosk
        </div>

        <div className="summary-team">
          Team <strong>NextGen</strong>
        </div>
      </header>

      {/* MAIN */}
      <main className="summary-container">

        {/* TITLE */}
        <div className="summary-title">
          <span className="summary-badge">
            CLINICAL SUMMARY
          </span>

          <h1>Your Health Summary</h1>

          <p>
            Your responses have been organized into a structured
            clinical history for healthcare review.
          </p>
        </div>

        {/* PATIENT INFORMATION */}
        <section className="summary-card">

          <div className="section-heading">
            <span className="heading-line"></span>
            <h2>Patient Information</h2>
          </div>

          <div className="summary-grid">

            <div className="summary-item">
              <span>FULL NAME</span>
              <strong>
                {patient.name || "Not provided"}
              </strong>
            </div>

            <div className="summary-item">
              <span>AGE</span>
              <strong>
                {patient.age
                  ? `${patient.age} years`
                  : "Not provided"}
              </strong>
            </div>

            <div className="summary-item">
              <span>GENDER</span>
              <strong>
                {patient.gender || "Not provided"}
              </strong>
            </div>

            <div className="summary-item">
              <span>PREFERRED LANGUAGE</span>
              <strong>
                {patient.language || "English"}
              </strong>
            </div>

          </div>
        </section>

        {/* CHIEF COMPLAINT */}
        <section className="summary-card">

          <div className="section-heading">
            <span className="heading-line"></span>
            <h2>Chief Complaint</h2>
          </div>

          <div className="clinical-highlight">

            <span className="clinical-label">
              MAIN HEALTH PROBLEM
            </span>

            <strong>
              {clinicalData.complaint || "Not provided"}
            </strong>

          </div>
        </section>

        {/* HISTORY OF PRESENT ILLNESS */}
        <section className="summary-card">

          <div className="section-heading">
            <span className="heading-line"></span>
            <h2>History of Present Illness</h2>
          </div>

          <div className="summary-grid">

            <div className="summary-item">
              <span>DURATION</span>
              <strong>
                {clinicalData.duration || "Not provided"}
              </strong>
            </div>

            <div className="summary-item">
              <span>SEVERITY</span>
              <strong>
                {clinicalData.severity || "Not provided"}
              </strong>
            </div>

            <div className="summary-item full-width">
              <span>OTHER SYMPTOMS</span>
              <strong>
                {clinicalData.symptoms ||
                  "No additional symptoms provided"}
              </strong>
            </div>

          </div>
        </section>

        {/* MEDICAL HISTORY */}
        <section className="summary-card">

          <div className="section-heading">
            <span className="heading-line"></span>
            <h2>Medical History</h2>
          </div>

          <div className="summary-grid">

            <div className="summary-item full-width">
              <span>PREVIOUS SIMILAR PROBLEM</span>
              <strong>
                {clinicalData.previousProblem || "No"}
              </strong>
            </div>

          </div>

        </section>

        {/* MEDICAL INFORMATION */}
        <section className="summary-card">

          <div className="section-heading">
            <span className="heading-line"></span>
            <h2>Medical Information</h2>
          </div>

          <div className="summary-grid">

            <div className="summary-item">
              <span>CURRENT MEDICINES</span>
              <strong>
                {clinicalData.medicines || "No"}
              </strong>
            </div>

            <div className="summary-item">
              <span>KNOWN ALLERGIES</span>
              <strong>
                {clinicalData.allergies || "No"}
              </strong>
            </div>

          </div>

        </section>

        {/* MEDICAL DOCUMENTS */}
        <section className="documents-card">

          <div className="documents-icon">
            📄
          </div>

          <div className="documents-content">

            <h2>Previous Medical Documents</h2>

            <p>
              Have a prescription, blood test report, discharge
              summary or other medical document?
            </p>

          </div>

          <button
            className="documents-button"
            onClick={onDocuments}
          >
            Scan Medical Documents →
          </button>

        </section>

        {/* SAFETY NOTICE */}
        <section className="safety-card">

          <div className="safety-icon">
            ⚕
          </div>

          <div className="safety-content">

            <h2>Important Safety Notice</h2>

            <p>
              This AI-generated summary is intended to assist
              healthcare professionals. The information should
              be reviewed and verified by a qualified doctor
              before clinical decisions are made.
            </p>

          </div>

        </section>

        {/* ACTIONS */}
        <div className="summary-actions">

          <button
            className="edit-button"
            onClick={() => window.history.back()}
          >
            ✏️ Edit Information
          </button>

        </div>

        {/* FINAL RESULT */}
        <section className="final-result-card">

          <div className="final-result-icon">
            ✓
          </div>

          <div className="final-result-content">

            <h2>Final Result</h2>

            <p>
              Your final medical result will appear here
              after all clinical information and medical
              documents have been reviewed.
            </p>

            <span className="final-result-status">
              ⏳ Review Pending
            </span>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="summary-footer">
        🔒 Your information is handled securely
        <span>•</span>
        SIH26047
        <span>•</span>
        Team NextGen
      </footer>

    </div>
  );
}

export default ClinicalSummary;