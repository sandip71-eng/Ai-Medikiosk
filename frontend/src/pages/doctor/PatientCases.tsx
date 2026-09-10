import { useState } from "react";
import "./PatientCases.css";

interface PatientCasesProps {
  onBack?: () => void;
  onReview?: (patientId: number) => void;
}

interface PatientCase {
  id: number;
  name: string;
  age: number;
  gender: string;
  language: string;
  complaint: string;
  duration: string;
  severity: "Mild" | "Moderate" | "Severe";
  status: "Pending" | "Reviewed";
  time: string;
  documents: number;
}

function PatientCases({ onBack, onReview }: PatientCasesProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const patients: PatientCase[] = [
    {
      id: 1,
      name: "Rajesh Kumar",
      age: 42,
      gender: "Male",
      language: "Hindi",
      complaint: "Fever and weakness",
      duration: "3 days",
      severity: "Moderate",
      status: "Pending",
      time: "10 min ago",
      documents: 2,
    },
    {
      id: 2,
      name: "Priya Das",
      age: 29,
      gender: "Female",
      language: "Odia",
      complaint: "Headache and dizziness",
      duration: "1 week",
      severity: "Mild",
      status: "Pending",
      time: "25 min ago",
      documents: 1,
    },
    {
      id: 3,
      name: "Amit Sharma",
      age: 56,
      gender: "Male",
      language: "English",
      complaint: "Joint pain",
      duration: "2 weeks",
      severity: "Moderate",
      status: "Reviewed",
      time: "1 hour ago",
      documents: 3,
    },
    {
      id: 4,
      name: "Sunita Devi",
      age: 63,
      gender: "Female",
      language: "Hindi",
      complaint: "Blood pressure concern",
      duration: "5 days",
      severity: "Severe",
      status: "Pending",
      time: "2 hours ago",
      documents: 2,
    },
    {
      id: 5,
      name: "Manoj Behera",
      age: 38,
      gender: "Male",
      language: "Odia",
      complaint: "Stomach discomfort",
      duration: "4 days",
      severity: "Mild",
      status: "Reviewed",
      time: "3 hours ago",
      documents: 1,
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesFilter =
      filter === "All" || patient.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      patient.name.toLowerCase().includes(searchText) ||
      patient.complaint.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="patient-cases-page">

      {/* HEADER */}
      <header className="cases-header">
        <div className="cases-brand">
          <div className="cases-logo">✚</div>

          <div>
            <h2>MediKiosk</h2>
            <span>Doctor Portal</span>
          </div>
        </div>

        <div className="secure-text">
          🔒 Secure Clinical Workspace
        </div>
      </header>

      {/* MAIN */}
      <main className="cases-container">

        {/* TOP */}
        <div className="cases-top">

          <div>
            <button
              className="back-button"
              onClick={onBack}
            >
              ← Dashboard
            </button>

            <span className="cases-badge">
              PATIENT MANAGEMENT
            </span>

            <h1>Patient Cases</h1>

            <p>
              Review patient information and clinical history
              before consultation.
            </p>
          </div>

          <div className="case-count">
            <strong>{filteredPatients.length}</strong>
            <span>Cases</span>
          </div>

        </div>

        {/* SEARCH + FILTER */}
        <section className="tools-card">

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search patient name or complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {["All", "Pending", "Reviewed"].map((item) => (
              <button
                key={item}
                className={filter === item ? "selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

        </section>

        {/* PATIENT CARDS */}
        <section className="patient-list">

          {filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div>🔎</div>
              <h3>No patient cases found</h3>
              <p>
                Try another search or change the filter.
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <article
                className="patient-case-card"
                key={patient.id}
              >

                {/* PATIENT */}
                <div className="patient-main">

                  <div className="patient-big-avatar">
                    {patient.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{patient.name}</h3>

                    <p>
                      {patient.age} years • {patient.gender}
                    </p>

                    <span className="language">
                      🌐 {patient.language}
                    </span>
                  </div>

                </div>

                {/* COMPLAINT */}
                <div className="case-info">
                  <span className="info-label">
                    Chief Complaint
                  </span>

                  <strong>{patient.complaint}</strong>

                  <small>
                    Duration: {patient.duration}
                  </small>
                </div>

                {/* SEVERITY */}
                <div className="case-info">
                  <span className="info-label">
                    Severity
                  </span>

                  <span
                    className={`severity ${patient.severity.toLowerCase()}`}
                  >
                    {patient.severity}
                  </span>
                </div>

                {/* DOCUMENTS */}
                <div className="case-info documents-info">
                  <span className="info-label">
                    Documents
                  </span>

                  <strong>📄 {patient.documents}</strong>

                  <small>
                    Medical reports
                  </small>
                </div>

                {/* STATUS */}
                <div className="case-status">

                  <span
                    className={`status ${patient.status.toLowerCase()}`}
                  >
                    {patient.status}
                  </span>

                  <small>{patient.time}</small>

                  <button
                    className="review-case-button"
                    onClick={() =>
                      onReview?.(patient.id)
                    }
                  >
                    Review Case →
                  </button>

                </div>

              </article>
            ))
          )}

        </section>

        {/* INFO */}
        <div className="doctor-info-box">
          <span>ℹ️</span>

          <p>
            Patient information is provided for clinical review.
            AI-generated summaries are intended to assist the
            physician and should be reviewed before making
            clinical decisions.
          </p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="cases-footer">
        <span>🔒 Patient data handled securely</span>
        <span>•</span>
        <span>MediKiosk</span>
        <span>•</span>
        <span>Team NextGen</span>
      </footer>

    </div>
  );
}

export default PatientCases;