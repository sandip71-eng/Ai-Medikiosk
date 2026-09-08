import { useState } from "react";
import "./Consultation.css";

interface Patient {
  name: string;
  age: string;
  gender: string;
  language: string;
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

interface ConsultationProps {
  patient: Patient;
  onComplete: (answers: ClinicalData) => void;
}

interface Message {
  type: "ai" | "user";
  text: string;
}

function Consultation({
  patient,
  onComplete,
}: ConsultationProps) {

  const questions = [
    "What is your main health problem or complaint today?",
    "How long have you been experiencing this problem?",
    "How severe is the problem? Mild, moderate, or severe?",
    "Are you experiencing any other symptoms along with it?",
    "Have you had any similar problem in the past?",
    "Are you currently taking any medicines?",
    "Do you have any known allergies?",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: `Hello ${patient.name}! 👋 I'm MediKiosk AI. I'll ask you a few questions to understand your health better.`,
    },
    {
      type: "ai",
      text: questions[0],
    },
  ]);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [answers, setAnswers] = useState<ClinicalData>({
    complaint: "",
    duration: "",
    severity: "",
    symptoms: "",
    previousProblem: "",
    medicines: "",
    allergies: "",
  });

  const sendMessage = (text: string) => {

    if (!text.trim() || completed) {
      return;
    }

    const updatedMessages: Message[] = [
      ...messages,
      {
        type: "user",
        text: text,
      },
    ];

    const updatedAnswers = { ...answers };

    // Save answer according to current question
    if (currentStep === 0) {
      updatedAnswers.complaint = text;
    } else if (currentStep === 1) {
      updatedAnswers.duration = text;
    } else if (currentStep === 2) {
      updatedAnswers.severity = text;
    } else if (currentStep === 3) {
      updatedAnswers.symptoms = text;
    } else if (currentStep === 4) {
      updatedAnswers.previousProblem = text;
    } else if (currentStep === 5) {
      updatedAnswers.medicines = text;
    } else if (currentStep === 6) {
      updatedAnswers.allergies = text;
    }

    setAnswers(updatedAnswers);

    const nextStep = currentStep + 1;

    if (nextStep < questions.length) {

      updatedMessages.push({
        type: "ai",
        text: questions[nextStep],
      });

      setCurrentStep(nextStep);

    } else {

      updatedMessages.push({
        type: "ai",
        text: "Thank you! ✅ I have collected your clinical history. Please review the summary before sending it to the doctor.",
      });

      setMessages(updatedMessages);
      setCompleted(true);

      // Send complete data to App
      onComplete(updatedAnswers);

      setInput("");
      return;
    }

    setMessages(updatedMessages);
    setInput("");
  };

  // Voice demo
  const handleVoice = () => {

    if (completed) {
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    setListening(true);

    setTimeout(() => {

      setListening(false);

      setInput(
        "I have been experiencing this problem for a few days"
      );

    }, 2000);
  };

  // Quick answers
  let quickAnswers: string[] = [];

  if (currentStep === 0) {

    quickAnswers = [
      "Fever",
      "Headache",
      "Stomach pain",
      "Cough",
      "Body pain",
    ];

  } else if (currentStep === 1) {

    quickAnswers = [
      "Today",
      "Few days",
      "1 week",
      "Several weeks",
      "Months",
    ];

  } else if (currentStep === 2) {

    quickAnswers = [
      "Mild",
      "Moderate",
      "Severe",
    ];

  } else if (currentStep === 3) {

    quickAnswers = [
      "Yes",
      "No",
      "Not sure",
    ];

  } else if (currentStep === 4) {

    quickAnswers = [
      "Yes",
      "No",
    ];

  } else if (currentStep === 5) {

    quickAnswers = [
      "Yes",
      "No",
    ];

  } else if (currentStep === 6) {

    quickAnswers = [
      "Yes",
      "No",
    ];
  }

  return (
    <div className="consultation-page">

      {/* HEADER */}
      <header className="consult-header">

        <div className="consult-logo">
          <span>✚</span>
          MediKiosk
        </div>

        <div className="consult-status">
          <span className="status-dot"></span>
          AI Consultation Active
        </div>

        <div className="patient-mini">
          👤 {patient.name}
        </div>

      </header>

      {/* PROGRESS */}
      <div className="progress-section">

        <div className="progress-info">

          <span>
            Clinical History
          </span>

          <span>
            {completed
              ? "Completed"
              : `Step ${currentStep + 1} of ${questions.length}`}
          </span>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                ((currentStep + 1) / questions.length) * 100,
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>

      {/* MAIN */}
      <main className="consult-main">

        {/* AI SECTION */}
        <section className="ai-section">

          <div className="ai-title">

            <div className="ai-avatar">
              🤖
            </div>

            <div>

              <span>
                MEDIKIOSK AI
              </span>

              <h1>
                {completed
                  ? "Clinical history completed"
                  : "Let's understand your health"}
              </h1>

            </div>

          </div>

          {/* CHAT */}
          <div className="chat-box">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`message ${
                  message.type === "user"
                    ? "user-message"
                    : "ai-message"
                }`}
              >

                {message.type === "ai" && (
                  <div className="message-avatar">
                    🤖
                  </div>
                )}

                <div className="message-text">
                  {message.text}
                </div>

              </div>

            ))}

          </div>

          {/* INPUT */}
          {!completed && (
            <>

              <div className="quick-section">

                <p>
                  Quick answers
                </p>

                <div className="quick-buttons">

                  {quickAnswers.map((answer) => (

                    <button
                      key={answer}
                      onClick={() => sendMessage(answer)}
                    >
                      {answer}
                    </button>

                  ))}

                </div>

              </div>

              <div className="input-area">

                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={(e) => {

                    if (e.key === "Enter") {
                      sendMessage(input);
                    }

                  }}
                />

                <button
                  className={`voice-button ${
                    listening ? "listening" : ""
                  }`}
                  onClick={handleVoice}
                >
                  {listening ? "🔴" : "🎙️"}
                </button>

                <button
                  className="send-button"
                  onClick={() => sendMessage(input)}
                >
                  ➤
                </button>

              </div>

              <p className="voice-hint">

                {listening
                  ? "Listening... speak naturally"
                  : "You can type or use voice input"}

              </p>

            </>
          )}

          {/* COMPLETED */}
          {completed && (

            <div className="completed-box">

              <div className="completed-icon">
                ✓
              </div>

              <div>
                <h3>
                  History Successfully Collected
                </h3>

                <p>
                  Your responses are ready for
                  clinical review.
                </p>
              </div>

              <button
                className="review-button"
                onClick={() => onComplete(answers)}
              >
                Review Clinical Summary →
              </button>

            </div>

          )}

        </section>

        {/* SIDEBAR */}
        <aside className="patient-sidebar">

          {/* PROFILE */}
          <div className="sidebar-card">

            <h3>
              Patient Profile
            </h3>

            <div className="profile-icon">
              👤
            </div>

            <h2>
              {patient.name}
            </h2>

            <p>
              {patient.age} years • {patient.gender}
            </p>

            <div className="profile-divider"></div>

            <div className="profile-row">
              <span>Language</span>
              <strong>{patient.language}</strong>
            </div>

            <div className="profile-row">
              <span>Session</span>
              <strong>New Consultation</strong>
            </div>

          </div>

          {/* PROGRESS */}
          <div className="sidebar-card checklist">

            <h3>
              History Progress
            </h3>

            <div className="check-item active">
              <span>✓</span>
              Basic Details
            </div>

            <div
              className={`check-item ${
                currentStep >= 0 ? "current" : ""
              }`}
            >
              <span>
                {currentStep > 0 ? "✓" : "●"}
              </span>
              Chief Complaint
            </div>

            <div
              className={`check-item ${
                currentStep >= 1 ? "current" : ""
              }`}
            >
              <span>
                {currentStep >= 2 ? "✓" : "○"}
              </span>
              History of Present Illness
            </div>

            <div
              className={`check-item ${
                currentStep >= 4 ? "current" : ""
              }`}
            >
              <span>
                {currentStep >= 5 ? "✓" : "○"}
              </span>
              Medical History
            </div>

            <div
              className={`check-item ${
                completed ? "current" : ""
              }`}
            >
              <span>
                {completed ? "✓" : "○"}
              </span>
              Review & Summary
            </div>

          </div>

          <div className="privacy-card">
            🔒 Your information is processed securely.
          </div>

        </aside>

      </main>

    </div>
  );
}

export default Consultation;