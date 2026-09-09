import { useState } from "react";
import "./DoctorPortal.css";

interface PatientCase {
  id: number;
  name: string;
  age: string;
  gender: string;
  language: string;
  complaint: string;
  duration: string;
  severity: string;
  symptoms: string;
  previousProblem: string;
  medicines: string;
  allergies: string;
  document: string;
  status: "Pending" | "Reviewed";
}

const patientCases: PatientCase[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    age: "28",
    gender: "Male",
    language: "Hindi",
    complaint: "Fever and weakness",
    duration: "3 days",
    severity: "Moderate",
    symptoms: "Fever, body pain, weakness and mild headache",
    previousProblem: "No similar problem",
    medicines: "Paracetamol 500 mg",
    allergies: "No known allergies",
    document: "Blood_Test_Report.pdf",
    status: "Pending",
  },
  {
    id: 2,
    name: "Priya Das",
    age: "35",
    gender: "Female",
    language: "Odia",
    complaint: "Stomach pain",
    duration: "1 week",
    severity: "Mild",
    symptoms: "Abdominal discomfort, bloating and loss of appetite",
    previousProblem: "Occasional gastric problem",
    medicines: "Antacid",
    allergies: "No known allergies",
    document: "Prescription.jpg",
    status: "Pending",
  },
  {
    id: 3,
    name: "Amit Kumar",
    age: "46",
    gender: "Male",
    language: "English",
    complaint: "Joint pain",
    duration: "2 months",
    severity: "Severe",
    symptoms: "Knee pain, stiffness and difficulty walking",
    previousProblem: "Previous knee pain",
    medicines: "Pain relief medicine",
    allergies: "Penicillin",
    document: "Xray_Report.pdf",
    status: "Reviewed",
  },
];

function DoctorPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [selectedCase, setSelectedCase] =
    useState<PatientCase | null>(null);

  const [filter, setFilter] =
    useState<"All" | "Pending" | "Reviewed">("All");

  const [review, setReview] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);

  /* ================= LOGIN ================= */

  const handleLogin = () => {
    if (!doctorName || !specialization) {
      alert("Please enter doctor name and specialization.");
      return;
    }

    setLoggedIn(true);
  };

  /* ================= FILTER ================= */

  const filteredCases = patientCases.filter((patient) => {
    if (filter === "All") return true;
    return patient.status === filter;
  });

  /* ================= OPEN CASE ================= */

  const openCase = (patient: PatientCase) => {
    setSelectedCase(patient);
    setReview("");
    setReviewSaved(false);
  };

  /* ================= SAVE REVIEW ================= */

  const saveReview = () => {
    if (!review.trim()) {
      alert("Please enter your clinical review.");
      return;
    }

    setReviewSaved(true);
  };

  /* =====================================================
     LOGIN SCREEN
     ===================================================== */

  if (!loggedIn) {
    return (
      <div className="doctor-page">

        <header className="doctor-header">
          <div className="doctor-logo">
            <span>✚</span>
            MediKiosk
          </div>

          <div className="doctor-team">
            Team <strong>NextGen</strong>
          </div>
        </header>

        <main className="doctor-login-container">

          <div className="doctor-login-card">

            <div className="doctor-icon">
              🩺
            </div>

            <span className="doctor-badge">
              DOCTOR PORTAL
            </span>

            <h1>Welcome, Doctor</h1>

            <p>
              Review patient clinical histories and provide
              professional medical assessment.
            </p>

            <div className="doctor-form-group">
              <label>Doctor Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={doctorName}
                onChange={(e) =>
                  setDoctorName(e.target.value)
                }
              />
            </div>

            <div className="doctor-form-group">
              <label>Specialization</label>

              <select
                value={specialization}
                onChange={(e) =>
                  setSpecialization(e.target.value)
                }
              >
                <option value="">
                  Select specialization
                </option>

                <optgroup label="AYUSH / Ayurveda">
                  <option>Ayurveda</option>
                  <option>Kayachikitsa</option>
                  <option>Panchakarma</option>
                  <option>Shalya Tantra</option>
                  <option>Shalakya Tantra</option>
                  <option>Prasuti & Stri Roga</option>
                  <option>Kaumarabhritya</option>
                  <option>Swasthavritta & Yoga</option>
                  <option>Rasashastra & Bhaishajya Kalpana</option>
                  <option>Dravyaguna</option>
                </optgroup>

                <optgroup label="Modern Medicine">
                  <option>General Physician</option>
                  <option>Internal Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Dermatology</option>
                  <option>Pediatrics</option>
                  <option>Gynecology</option>
                  <option>Psychiatry</option>
                  <option>ENT Specialist</option>
                  <option>Pulmonology</option>
                  <option>Gastroenterology</option>
                  <option>Nephrology</option>
                  <option>Endocrinology</option>
                  <option>Ophthalmology</option>
                  <option>General Surgery</option>
                  <option>Other</option>
                </optgroup>
              </select>
            </div>

            <button
              className="doctor-login-button"
              onClick={handleLogin}
            >
              Enter Doctor Portal →
            </button>

            <div className="doctor-security">
              🔒 Secure clinical workspace
            </div>

          </div>

        </main>

        <footer className="doctor-footer">
          Smart India Hackathon 2026
          <span>•</span>
          SIH26047
          <span>•</span>
          Team NextGen
        </footer>

      </div>
    );
  }

  /* =====================================================
     CASE REVIEW SCREEN
     ===================================================== */

  if (selectedCase) {
    return (
      <div className="doctor-dashboard">

        <header className="dashboard-header">

          <div className="doctor-logo">
            <span>✚</span>
            MediKiosk
          </div>

          <div className="doctor-header-right">
            <span>
              Dr. {doctorName} • {specialization}
            </span>

            <button
              onClick={() => {
                setSelectedCase(null);
                setLoggedIn(false);
              }}
            >
              Logout
            </button>
          </div>

        </header>

        <main className="case-review-container">

          <button
            className="back-button"
            onClick={() => setSelectedCase(null)}
          >
            ← Back to Patient Cases
          </button>

          <div className="case-review-header">

            <div>
              <span className="doctor-badge">
                PATIENT CASE REVIEW
              </span>

              <h1>
                {selectedCase.name}
              </h1>

              <p>
                Case ID: MK-{selectedCase.id.toString().padStart(4, "0")}
              </p>
            </div>

            <span
              className={`case-status ${
                selectedCase.status.toLowerCase()
              }`}
            >
              {reviewSaved ? "Reviewed" : selectedCase.status}
            </span>

          </div>

          <div className="case-grid">

            {/* PATIENT INFORMATION */}

            <section className="case-card">

              <h2>👤 Patient Information</h2>

              <div className="case-info">

                <div>
                  <span>Name</span>
                  <strong>{selectedCase.name}</strong>
                </div>

                <div>
                  <span>Age</span>
                  <strong>{selectedCase.age} years</strong>
                </div>

                <div>
                  <span>Gender</span>
                  <strong>{selectedCase.gender}</strong>
                </div>

                <div>
                  <span>Language</span>
                  <strong>{selectedCase.language}</strong>
                </div>

              </div>

            </section>

            {/* CHIEF COMPLAINT */}

            <section className="case-card">

              <h2>🩺 Chief Complaint</h2>

              <h3>Main Problem</h3>

              <p>
                {selectedCase.complaint}
              </p>

              <h3>Duration</h3>

              <p>
                {selectedCase.duration}
              </p>

              <h3>Severity</h3>

              <span
                className={`severity ${selectedCase.severity.toLowerCase()}`}
              >
                {selectedCase.severity}
              </span>

            </section>

            {/* CLINICAL HISTORY */}

            <section className="case-card">

              <h2>📋 Clinical History</h2>

              <div className="clinical-history">

                <div className="history-item">
                  <span>Other Symptoms</span>
                  <strong>
                    {selectedCase.symptoms}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Previous Similar Problem</span>
                  <strong>
                    {selectedCase.previousProblem}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Current Medicines</span>
                  <strong>
                    {selectedCase.medicines}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Known Allergies</span>
                  <strong>
                    {selectedCase.allergies}
                  </strong>
                </div>

              </div>

            </section>

            {/* AI SUMMARY */}

            <section className="case-card">

              <h2>🤖 AI Clinical Summary</h2>

              <div className="summary-box">

                <h3>Patient Overview</h3>

                <p>
                  {selectedCase.name}, aged{" "}
                  {selectedCase.age}, presents with{" "}
                  <strong>
                    {selectedCase.complaint.toLowerCase()}
                  </strong>{" "}
                  for approximately{" "}
                  <strong>
                    {selectedCase.duration}
                  </strong>.
                </p>

                <h3>Reported Symptoms</h3>

                <p>
                  {selectedCase.symptoms}
                </p>

                <h3>Medication & Allergy Information</h3>

                <p>
                  Current medicines:{" "}
                  {selectedCase.medicines}
                  <br />
                  Known allergies:{" "}
                  {selectedCase.allergies}
                </p>

                <div className="ai-note">
                  ℹ️ AI-generated summary is provided only
                  to assist the doctor. Final clinical
                  assessment must be made by the doctor.
                </div>

              </div>

            </section>

            {/* MEDICAL DOCUMENT */}

            <section className="case-card">

              <h2>📄 Medical Documents</h2>

              <div className="document-box">

                <div className="document-icon">
                  📄
                </div>

                <div className="document-details">

                  <strong>
                    {selectedCase.document}
                  </strong>

                  <span>
                    Medical document • Verified
                  </span>

                </div>

                <button className="document-button">
                  View
                </button>

              </div>

            </section>

            {/* OCR INFORMATION */}

            <section className="case-card">

              <h2>🔍 OCR Extracted Information</h2>

              <div className="ocr-box">

                <div>
                  <span>Document Type</span>
                  <strong>
                    Medical Report
                  </strong>
                </div>

                <div>
                  <span>Extracted Diagnosis / Finding</span>
                  <strong>
                    Relevant clinical findings available
                    for doctor review.
                  </strong>
                </div>

                <div>
                  <span>Medicines Detected</span>
                  <strong>
                    {selectedCase.medicines}
                  </strong>
                </div>

                <div className="ocr-confidence">
                  OCR Confidence: 94%
                </div>

              </div>

            </section>

            {/* DOCTOR REVIEW */}

            <section className="case-card doctor-review-card">

              <h2>📝 Doctor's Clinical Review</h2>

              <p className="review-description">
                Enter your professional observations,
                assessment and recommendations.
              </p>

              <textarea
                rows={7}
                placeholder="Write your clinical review here..."
                value={review}
                onChange={(e) =>
                  setReview(e.target.value)
                }
              />

              <button
                className="review-button"
                onClick={saveReview}
              >
                Save Clinical Review ✓
              </button>

              {reviewSaved && (
                <div className="review-success">
                  ✓ Clinical review saved successfully.
                </div>
              )}

            </section>

          </div>

          {/* FINAL RESULT */}

          {reviewSaved && (
            <section className="final-result-card">

              <div className="final-result-icon">
                ✓
              </div>

              <div>

                <span className="doctor-badge">
                  FINAL RESULT
                </span>

                <h2>
                  Clinical Review Completed
                </h2>

                <p>
                  The patient's clinical history has been
                  reviewed by Dr. {doctorName}. The final
                  clinical decision and treatment plan will
                  be based on professional medical assessment.
                </p>

              </div>

            </section>
          )}

          <div className="doctor-disclaimer">

            <strong>
              ⚠️ Clinical Safety Notice
            </strong>

            <p>
              MediKiosk provides structured patient history
              and AI-assisted information only. It does not
              independently diagnose disease or prescribe
              treatment. Final clinical decisions remain with
              the qualified healthcare professional.
            </p>

          </div>

        </main>

      </div>
    );
  }

  /* =====================================================
     DASHBOARD
     ===================================================== */

  return (
    <div className="doctor-dashboard">

      <header className="dashboard-header">

        <div className="doctor-logo">
          <span>✚</span>
          MediKiosk
        </div>

        <div className="doctor-header-right">

          <span>
            Dr. {doctorName} • {specialization}
          </span>

          <button
            onClick={() => setLoggedIn(false)}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-container">

        <div className="dashboard-welcome">

          <div>

            <span className="doctor-badge">
              DOCTOR DASHBOARD
            </span>

            <h1>
              Good Morning, Dr. {doctorName} 👋
            </h1>

            <p>
              Review and manage patient clinical cases.
            </p>

          </div>

          <div className="doctor-profile-mini">

            <div className="profile-avatar">
              🩺
            </div>

            <div>
              <strong>
                Dr. {doctorName}
              </strong>

              <span>
                {specialization}
              </span>
            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <span>👥</span>
            <strong>{patientCases.length}</strong>
            <p>Total Patients</p>
          </div>

          <div className="stat-card">
            <span>⏳</span>
            <strong>
              {
                patientCases.filter(
                  (p) => p.status === "Pending"
                ).length
              }
            </strong>
            <p>Pending Cases</p>
          </div>

          <div className="stat-card">
            <span>✓</span>
            <strong>
              {
                patientCases.filter(
                  (p) => p.status === "Reviewed"
                ).length
              }
            </strong>
            <p>Reviewed Cases</p>
          </div>

          <div className="stat-card">
            <span>📄</span>
            <strong>{patientCases.length}</strong>
            <p>Medical Reports</p>
          </div>

        </div>

        {/* CASE LIST */}

        <section className="cases-section">

          <div className="section-header">

            <div>
              <h2>Patient Cases</h2>

              <p>
                Review clinical histories submitted
                through MediKiosk.
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as
                    | "All"
                    | "Pending"
                    | "Reviewed"
                )
              }
            >
              <option value="All">
                All Cases
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Reviewed">
                Reviewed
              </option>
            </select>

          </div>

          <div className="cases-table">

            <div className="table-header">
              <span>Patient</span>
              <span>Complaint</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredCases.map((patient) => (

              <div
                className="table-row"
                key={patient.id}
              >

                <div className="patient-cell">

                  <div className="patient-avatar">
                    {patient.name.charAt(0)}
                  </div>

                  <div>
                    <strong>
                      {patient.name}
                    </strong>

                    <span>
                      {patient.age} yrs •{" "}
                      {patient.gender}
                    </span>
                  </div>

                </div>

                <span>
                  {patient.complaint}
                </span>

                <span
                  className={`severity ${patient.severity.toLowerCase()}`}
                >
                  {patient.severity}
                </span>

                <span
                  className={`case-status ${patient.status.toLowerCase()}`}
                >
                  {patient.status}
                </span>

                <button
                  className="view-case-button"
                  onClick={() => openCase(patient)}
                >
                  Review →
                </button>

              </div>

            ))}

          </div>

        </section>

        <div className="doctor-disclaimer">

          <strong>
            ⚕️ MediKiosk Clinical Assistance
          </strong>

          <p>
            Patient information is structured using
            AI-assisted history taking and document
            processing. The information is intended to
            support, not replace, professional medical
            judgment.
          </p>

        </div>

      </main>

    </div>
  );
}

export default DoctorPortal;