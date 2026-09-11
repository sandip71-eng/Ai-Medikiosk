import { useEffect, useState } from "react";
import "./Consultation.css";
import {
  createConsultation,
  sendConsultationMessage,
} from "../api";

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

interface ConsultationProps {
  patient: Patient;
  consultationId: string | null;
  onConsultationCreated: (consultationId: string) => void;
  onComplete: (answers: ClinicalData) => void;
}

interface Message {
  type: "ai" | "user";
  text: string;
}

function Consultation({
  patient,
  consultationId,
  onConsultationCreated,
  onComplete,
}: ConsultationProps) {

  // =========================
  // LANGUAGE
  // =========================

  const lang =
    patient.language === "Hindi"
      ? "Hindi"
      : patient.language === "Odia"
      ? "Odia"
      : "English";

  // =========================
  // QUESTIONS
  // =========================

  const questionsByLanguage = {
    English: [
      "What is your main health problem or complaint today?",
      "How long have you been experiencing this problem?",
      "How severe is the problem? Mild, moderate, or severe?",
      "Are you experiencing any other symptoms along with it?",
      "Have you had any similar problem in the past?",
      "Are you currently taking any medicines?",
      "Do you have any known allergies?",
    ],

    Hindi: [
      "आज आपकी मुख्य स्वास्थ्य समस्या या शिकायत क्या है?",
      "आपको यह समस्या कब से हो रही है?",
      "यह समस्या कितनी गंभीर है? हल्की, मध्यम या गंभीर?",
      "क्या इसके साथ आपको कोई अन्य लक्षण भी हो रहे हैं?",
      "क्या आपको पहले भी ऐसी कोई समस्या हुई है?",
      "क्या आप वर्तमान में कोई दवा ले रहे हैं?",
      "क्या आपको किसी चीज़ से कोई ज्ञात एलर्जी है?",
    ],

    Odia: [
      "ଆଜି ଆପଣଙ୍କର ମୁଖ୍ୟ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା କିମ୍ବା ଅଭିଯୋଗ କଣ?",
      "ଆପଣଙ୍କର ଏହି ସମସ୍ୟା କେତେ ଦିନ ହେଲା?",
      "ସମସ୍ୟାଟି କେତେ ଗୁରୁତର? ହାଲୁକା, ମଧ୍ୟମ କିମ୍ବା ଗୁରୁତର?",
      "ଏହା ସହିତ ଆପଣଙ୍କର ଅନ୍ୟ କୌଣସି ଲକ୍ଷଣ ଅଛି କି?",
      "ଆପଣଙ୍କର ପୂର୍ବରୁ ଏପରି କୌଣସି ସମସ୍ୟା ହୋଇଥିଲା କି?",
      "ଆପଣ ବର୍ତ୍ତମାନ କୌଣସି ଔଷଧ ଖାଉଛନ୍ତି କି?",
      "ଆପଣଙ୍କର କୌଣସି ଜଣାଶୁଣା ଆଲର୍ଜି ଅଛି କି?",
    ],
  };

  const questions = questionsByLanguage[lang];

  // =========================
  // TEXT
  // =========================

  const text = {
    English: {
      hello: `Hello ${patient.name}! 👋 I'm MediKiosk AI. I'll ask you a few questions to understand your health better.`,
      thankYou:
        "Thank you! ✅ I have collected your clinical history. Please review the summary before sending it to the doctor.",
      consultationActive: "AI Consultation Active",
      clinicalHistory: "Clinical History",
      completed: "Completed",
      step: "Step",
      medikioskAI: "MEDIKIOSK AI",
      understand: "Let's understand your health",
      completedTitle: "Clinical history completed",
      quickAnswers: "Quick answers",
      placeholder: "Type your answer...",
      listening: "Listening... speak naturally",
      voiceHint: "You can type or use voice input",
      voiceDemo: "Voice input demo will be available soon.",
      historyCollected: "History Successfully Collected",
      readyReview: "Your responses are ready for clinical review.",
      review: "Review Clinical Summary →",
      patientProfile: "Patient Profile",
      language: "Language",
      session: "Session",
      newConsultation: "New Consultation",
      historyProgress: "History Progress",
      basicDetails: "Basic Details",
      chiefComplaint: "Chief Complaint",
      presentIllness: "History of Present Illness",
      medicalHistory: "Medical History",
      reviewSummary: "Review & Summary",
      privacy: "🔒 Your information is processed securely.",
      alert: "Please provide an answer before continuing.",
      quick: [
        ["Fever", "Headache", "Stomach pain", "Cough", "Body pain"],
        ["Today", "Few days", "1 week", "Several weeks", "Months"],
        ["Mild", "Moderate", "Severe"],
        ["Yes", "No", "Not sure"],
        ["Yes", "No"],
        ["Yes", "No"],
        ["Yes", "No"],
      ],
    },

    Hindi: {
      hello: `नमस्ते ${patient.name}! 👋 मैं MediKiosk AI हूँ। आपकी स्वास्थ्य स्थिति को बेहतर समझने के लिए मैं आपसे कुछ सवाल पूछूँगा।`,
      thankYou:
        "धन्यवाद! ✅ आपकी क्लिनिकल हिस्ट्री रिकॉर्ड कर ली गई है। डॉक्टर को भेजने से पहले कृपया सारांश की समीक्षा करें।",
      consultationActive: "AI परामर्श सक्रिय",
      clinicalHistory: "क्लिनिकल हिस्ट्री",
      completed: "पूरा हुआ",
      step: "चरण",
      medikioskAI: "MEDIKIOSK AI",
      understand: "आइए आपकी स्वास्थ्य स्थिति को समझते हैं",
      completedTitle: "क्लिनिकल हिस्ट्री पूरी हुई",
      quickAnswers: "त्वरित उत्तर",
      placeholder: "अपना उत्तर लिखें...",
      listening: "सुन रहा हूँ... सामान्य रूप से बोलें",
      voiceHint: "आप टाइप कर सकते हैं या आवाज़ का उपयोग कर सकते हैं",
      voiceDemo: "वॉइस इनपुट डेमो जल्द उपलब्ध होगा।",
      historyCollected: "हिस्ट्री सफलतापूर्वक रिकॉर्ड की गई",
      readyReview: "आपके उत्तर क्लिनिकल समीक्षा के लिए तैयार हैं।",
      review: "क्लिनिकल सारांश देखें →",
      patientProfile: "मरीज़ की जानकारी",
      language: "भाषा",
      session: "सेशन",
      newConsultation: "नया परामर्श",
      historyProgress: "हिस्ट्री प्रगति",
      basicDetails: "मूल जानकारी",
      chiefComplaint: "मुख्य शिकायत",
      presentIllness: "वर्तमान बीमारी का इतिहास",
      medicalHistory: "मेडिकल हिस्ट्री",
      reviewSummary: "समीक्षा और सारांश",
      privacy: "🔒 आपकी जानकारी सुरक्षित रूप से प्रोसेस की जाती है।",
      alert: "कृपया आगे बढ़ने से पहले उत्तर दें।",
      quick: [
        ["बुखार", "सिरदर्द", "पेट दर्द", "खांसी", "शरीर में दर्द"],
        ["आज से", "कुछ दिनों से", "1 सप्ताह", "कई सप्ताह", "कई महीने"],
        ["हल्की", "मध्यम", "गंभीर"],
        ["हाँ", "नहीं", "पता नहीं"],
        ["हाँ", "नहीं"],
        ["हाँ", "नहीं"],
        ["हाँ", "नहीं"],
      ],
    },

    Odia: {
      hello: `ନମସ୍କାର ${patient.name}! 👋 ମୁଁ MediKiosk AI। ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟକୁ ଭଲ ଭାବରେ ବୁଝିବା ପାଇଁ ମୁଁ ଆପଣଙ୍କୁ କିଛି ପ୍ରଶ୍ନ ପଚାରିବି।`,
      thankYou:
        "ଧନ୍ୟବାଦ! ✅ ଆପଣଙ୍କର କ୍ଲିନିକାଲ୍ ହିଷ୍ଟ୍ରି ସଂଗ୍ରହ କରାଯାଇଛି। ଡାକ୍ତରଙ୍କୁ ପଠାଇବା ପୂର୍ବରୁ ସାରାଂଶ ଯାଞ୍ଚ କରନ୍ତୁ।",
      consultationActive: "AI ପରାମର୍ଶ ସକ୍ରିୟ",
      clinicalHistory: "କ୍ଲିନିକାଲ୍ ହିଷ୍ଟ୍ରି",
      completed: "ସମ୍ପୂର୍ଣ୍ଣ",
      step: "ପଦକ୍ଷେପ",
      medikioskAI: "MEDIKIOSK AI",
      understand: "ଆସନ୍ତୁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟକୁ ବୁଝିବା",
      completedTitle: "କ୍ଲିନିକାଲ୍ ହିଷ୍ଟ୍ରି ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି",
      quickAnswers: "ଶୀଘ୍ର ଉତ୍ତର",
      placeholder: "ଆପଣଙ୍କ ଉତ୍ତର ଲେଖନ୍ତୁ...",
      listening: "ଶୁଣୁଛି... ସ୍ୱାଭାବିକ ଭାବରେ କୁହନ୍ତୁ",
      voiceHint: "ଆପଣ ଟାଇପ୍ କରିପାରିବେ କିମ୍ବା ଭଏସ୍ ବ୍ୟବହାର କରିପାରିବେ",
      voiceDemo: "ଭଏସ୍ ଇନପୁଟ୍ ଡେମୋ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ।",
      historyCollected: "ହିଷ୍ଟ୍ରି ସଫଳତାର ସହିତ ସଂଗ୍ରହ ହୋଇଛି",
      readyReview: "ଆପଣଙ୍କ ଉତ୍ତରଗୁଡ଼ିକ କ୍ଲିନିକାଲ୍ ଯାଞ୍ଚ ପାଇଁ ପ୍ରସ୍ତୁତ।",
      review: "କ୍ଲିନିକାଲ୍ ସାରାଂଶ ଦେଖନ୍ତୁ →",
      patientProfile: "ରୋଗୀଙ୍କ ବିବରଣୀ",
      language: "ଭାଷା",
      session: "ସେସନ୍",
      newConsultation: "ନୂତନ ପରାମର୍ଶ",
      historyProgress: "ହିଷ୍ଟ୍ରି ପ୍ରଗତି",
      basicDetails: "ମୌଳିକ ବିବରଣୀ",
      chiefComplaint: "ମୁଖ୍ୟ ଅଭିଯୋଗ",
      presentIllness: "ବର୍ତ୍ତମାନ ରୋଗର ଇତିହାସ",
      medicalHistory: "ମେଡିକାଲ୍ ହିଷ୍ଟ୍ରି",
      reviewSummary: "ଯାଞ୍ଚ ଏବଂ ସାରାଂଶ",
      privacy: "🔒 ଆପଣଙ୍କ ସୂଚନା ସୁରକ୍ଷିତ ଭାବରେ ପ୍ରକ୍ରିୟାକରଣ କରାଯାଉଛି।",
      alert: "ଦୟାକରି ଆଗକୁ ବଢ଼ିବା ପୂର୍ବରୁ ଉତ୍ତର ଦିଅନ୍ତୁ।",
      quick: [
        ["ଜ୍ୱର", "ମୁଣ୍ଡ ବିନ୍ଧା", "ପେଟ ବ୍ୟଥା", "କାଶ", "ଶରୀର ବ୍ୟଥା"],
        ["ଆଜିଠାରୁ", "କିଛି ଦିନ", "୧ ସପ୍ତାହ", "କିଛି ସପ୍ତାହ", "କିଛି ମାସ"],
        ["ହାଲୁକା", "ମଧ୍ୟମ", "ଗୁରୁତର"],
        ["ହଁ", "ନା", "ଜାଣିନାହିଁ"],
        ["ହଁ", "ନା"],
        ["ହଁ", "ନା"],
        ["ହଁ", "ନା"],
      ],
    },
  };

  const currentText = text[lang];

  const [currentStep, setCurrentStep] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: currentText.hello,
    },
    {
      type: "ai",
      text: questions[0],
    },
  ]);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(!consultationId);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionAttempt, setSessionAttempt] = useState(0);

  const [answers, setAnswers] = useState<ClinicalData>({
    complaint: "",
    duration: "",
    severity: "",
    symptoms: "",
    previousProblem: "",
    medicines: "",
    allergies: "",
  });

  useEffect(() => {
    if (consultationId) {
      return;
    }

    const languageCode = patient.language === "Hindi" ? "hi-IN" : patient.language === "Odia" ? "od-IN" : "en-IN";
    createConsultation(
      languageCode,
      {
        age: Number(patient.age),
        gender: patient.gender.toLowerCase() as "male" | "female" | "other",
        anonymous: true,
      },
      patient.consent,
    )
      .then((session) => {
        onConsultationCreated(session.consultationId);
        setMessages([{ type: "ai", text: session.initialMessage }]);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [consultationId, onConsultationCreated, patient, sessionAttempt]);

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || completed || sending || !consultationId) {
      return;
    }

    setError("");
    setSending(true);

    const updatedMessages: Message[] = [
      ...messages,
      {
        type: "user",
        text: messageText,
      },
    ];

    const updatedAnswers = { ...answers };

    if (currentStep === 0) {
      updatedAnswers.complaint = messageText;
    } else if (currentStep === 1) {
      updatedAnswers.duration = messageText;
    } else if (currentStep === 2) {
      updatedAnswers.severity = messageText;
    } else if (currentStep === 3) {
      updatedAnswers.symptoms = messageText;
    } else if (currentStep === 4) {
      updatedAnswers.previousProblem = messageText;
    } else if (currentStep === 5) {
      updatedAnswers.medicines = messageText;
    } else if (currentStep === 6) {
      updatedAnswers.allergies = messageText;
    }

    setAnswers(updatedAnswers);

    const nextStep = currentStep + 1;

    try {
      const languageCode = patient.language === "Hindi" ? "hi-IN" : patient.language === "Odia" ? "od-IN" : "en-IN";
      const turn = await sendConsultationMessage(consultationId, messageText, languageCode);
      updatedMessages.push({ type: "ai", text: turn.message });
      setMessages(updatedMessages);
      setInput("");

      if (nextStep < questions.length) {
        setCurrentStep(nextStep);
      } else {
        setCompleted(true);
        onComplete(updatedAnswers);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send your answer.");
    } finally {
      setSending(false);
    }
  };

  // =========================
  // VOICE DEMO
  // =========================

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

      if (lang === "Hindi") {
        setInput("मुझे कुछ दिनों से यह समस्या हो रही है");
      } else if (lang === "Odia") {
        setInput("ମୋର କିଛି ଦିନ ହେବ ଏହି ସମସ୍ୟା ହେଉଛି");
      } else {
        setInput(
          "I have been experiencing this problem for a few days"
        );
      }
    }, 2000);
  };

  // =========================
  // QUICK ANSWERS
  // =========================

  const quickAnswers = currentText.quick[currentStep];

  // =========================
  // UI
  // =========================

  if (loading) {
    return <div className="consultation-page"><main className="consult-main"><section className="ai-section"><h1>Starting your secure consultation...</h1></section></main></div>;
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
          {currentText.consultationActive}
        </div>

        <div className="patient-mini">
          👤 {patient.name}
        </div>

      </header>

      {/* PROGRESS */}

      <div className="progress-section">

        <div className="progress-info">

          <span>
            {currentText.clinicalHistory}
          </span>

          <span>
            {completed
              ? currentText.completed
              : `${currentText.step} ${currentStep + 1} of ${questions.length}`}
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
                {currentText.medikioskAI}
              </span>

              <h1>
                {completed
                  ? currentText.completedTitle
                  : currentText.understand}
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

          {error && (
            <p role="alert" className="voice-hint">
              {error} <button type="button" onClick={() => { setError(""); setLoading(true); setSessionAttempt((attempt) => attempt + 1); }}>Retry</button>
            </p>
          )}

          {/* INPUT */}

          {!completed && (
            <>

              <div className="quick-section">

                <p>
                  {currentText.quickAnswers}
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
                  placeholder={currentText.placeholder}
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
                  disabled={sending}
                >
                  {sending ? "..." : "➤"}
                </button>

              </div>

              <p className="voice-hint">

                {listening
                  ? currentText.listening
                  : currentText.voiceHint}

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
                  {currentText.historyCollected}
                </h3>

                <p>
                  {currentText.readyReview}
                </p>

              </div>

              <button
                className="review-button"
                onClick={() => onComplete(answers)}
              >
                {currentText.review}
              </button>

            </div>

          )}

        </section>

        {/* SIDEBAR */}

        <aside className="patient-sidebar">

          {/* PROFILE */}

          <div className="sidebar-card">

            <h3>
              {currentText.patientProfile}
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
              <span>{currentText.language}</span>
              <strong>{patient.language}</strong>
            </div>

            <div className="profile-row">
              <span>{currentText.session}</span>
              <strong>{currentText.newConsultation}</strong>
            </div>

          </div>

          {/* PROGRESS */}

          <div className="sidebar-card checklist">

            <h3>
              {currentText.historyProgress}
            </h3>

            <div className="check-item active">
              <span>✓</span>
              {currentText.basicDetails}
            </div>

            <div
              className={`check-item ${
                currentStep >= 0 ? "current" : ""
              }`}
            >
              <span>
                {currentStep > 0 ? "✓" : "●"}
              </span>
              {currentText.chiefComplaint}
            </div>

            <div
              className={`check-item ${
                currentStep >= 1 ? "current" : ""
              }`}
            >
              <span>
                {currentStep >= 2 ? "✓" : "○"}
              </span>
              {currentText.presentIllness}
            </div>

            <div
              className={`check-item ${
                currentStep >= 4 ? "current" : ""
              }`}
            >
              <span>
                {currentStep >= 5 ? "✓" : "○"}
              </span>
              {currentText.medicalHistory}
            </div>

            <div
              className={`check-item ${
                completed ? "current" : ""
              }`}
            >
              <span>
                {completed ? "✓" : "○"}
              </span>
              {currentText.reviewSummary}
            </div>

          </div>

          <div className="privacy-card">
            {currentText.privacy}
          </div>

        </aside>

      </main>

    </div>
  );
}

export default Consultation;