import { useState } from "react";
import "./PatientDetails.css";

interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
  consent: boolean;
}

interface PatientDetailsProps {
  onComplete: (patient: Patient) => void;
}

function PatientDetails({ onComplete }: PatientDetailsProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("English");
  const [consent, setConsent] = useState(false);

  const handleContinue = () => {
    if (!name || !age || !gender) {
      alert("Please fill Name, Age and Gender.");
      return;
    }

    if (!consent) {
      alert("Please provide consent to continue.");
      return;
    }

    onComplete({
      name,
      age,
      gender,
      language,
      consent,
    });
  };

  return (
    <div className="patient-page">

      <header className="patient-header">
        <div className="patient-logo">
          <span>✚</span> MediKiosk
        </div>

        <div className="patient-team">
          Team <strong>NextGen</strong>
        </div>
      </header>

      <main className="patient-container">

        <div className="patient-title">
          <span className="patient-badge">
            PATIENT REGISTRATION
          </span>

          <h1>Tell us about yourself</h1>

          <p>
            This information helps MediKiosk create your
            personalized clinical history.
          </p>
        </div>

        <div className="patient-card">

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Age</label>

              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>Preferred Language</label>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Odia">ଓଡ଼ିଆ</option>
            </select>
          </div>

          <label className="consent-row">

            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />

            <span>
              I consent to MediKiosk collecting and processing
              my information for clinical history preparation.
            </span>

          </label>

          <button
            className="continue-button"
            onClick={handleContinue}
          >
            Continue Consultation →
          </button>

        </div>

      </main>

      <footer className="patient-footer">
        🔒 Your information is handled securely
        <span>•</span>
        SIH26047
        <span>•</span>
        Team NextGen
      </footer>

    </div>
  );
}

export default PatientDetails;