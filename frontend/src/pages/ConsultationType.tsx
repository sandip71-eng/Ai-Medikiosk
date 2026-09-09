import "./ConsultationType.css";

interface ConsultationTypeProps {
  onSelect: (type: "general" | "ayush") => void;
}

function ConsultationType({ onSelect }: ConsultationTypeProps) {
  return (
    <div className="consultation-type-page">

      {/* HEADER */}
      <header className="consultation-header">
        <div className="consultation-logo">
          <span>✚</span>
          MediKiosk
        </div>

        <div className="consultation-team">
          Team <strong>NextGen</strong>
        </div>
      </header>

      {/* MAIN */}
      <main className="consultation-type-container">

        <div className="consultation-type-title">
          <span className="consultation-badge">
            CONSULTATION TYPE
          </span>

          <h1>How would you like to proceed?</h1>

          <p>
            Choose the type of clinical history you want to provide.
            MediKiosk will personalize the questions based on your selection.
          </p>
        </div>

        {/* OPTIONS */}
        <div className="consultation-options">

          {/* GENERAL */}
          <button
            className="consultation-option general-option"
            onClick={() => onSelect("general")}
          >
            <div className="option-icon">
              🩺
            </div>

            <div className="option-content">
              <h2>General Clinical History</h2>

              <p>
                For common health complaints, symptoms, medicines,
                allergies and previous medical history.
              </p>

              <span className="option-action">
                Start General Consultation →
              </span>
            </div>
          </button>

          {/* AYUSH */}
          <button
            className="consultation-option ayush-option"
            onClick={() => onSelect("ayush")}
          >
            <div className="option-icon">
              🌿
            </div>

            <div className="option-content">
              <h2>AYUSH / Ayurvedic History</h2>

              <p>
                Detailed Ayurvedic history including Prakriti,
                Vikriti, Agni, Ahara-Vihara and other AYUSH parameters.
              </p>

              <span className="option-action">
                Start AYUSH Consultation →
              </span>
            </div>
          </button>

        </div>

        {/* INFO */}
        <div className="consultation-info">
          <span>💡</span>

          <p>
            You can answer questions by speaking or using the touchscreen.
            Your responses will be used to prepare a structured clinical history
            for the doctor.
          </p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="consultation-footer">
        <span>🔒</span>
        Your information is handled securely

        <span className="footer-dot">•</span>

        SIH26047

        <span className="footer-dot">•</span>

        Team NextGen
      </footer>

    </div>
  );
}

export default ConsultationType;