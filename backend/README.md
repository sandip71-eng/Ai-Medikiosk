# MediKiosk AI Backend

Production-ready, highly secure, and privacy-conscious medical symptom-assessment kiosk backend built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **Qwen LLM (OpenAI-compatible)**, and **Sarvam AI (Saaras STT & Bulbul TTS)**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & System Flow](#architecture--system-flow)
3. [Folder Structure](#folder-structure)
4. [Prerequisites & Installation](#prerequisites--installation)
5. [Environment Configuration](#environment-configuration)
6. [MongoDB Setup](#mongodb-setup)
7. [Qwen LLM Provider Setup](#qwen-llm-provider-setup)
8. [Sarvam AI Setup (Saaras & Bulbul)](#sarvam-ai-setup-saaras--bulbul)
9. [Running Locally](#running-locally)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [Example cURL Requests & Responses](#example-curl-requests--responses)
12. [Security & Privacy Architecture](#security--privacy-architecture)
13. [How to Connect Your Existing React Application](#how-to-connect-your-existing-react-application)
14. [How to Replace Qwen with Any OpenAI-Compatible Model](#how-to-replace-qwen-with-any-openai-compatible-model)
15. [Deployment Guide](#deployment-guide)
16. [Running Automated Tests](#running-automated-tests)

---

## 1. Project Overview

MediKiosk is an AI-powered in-person kiosk backend designed to conduct empathetic, structured preliminary medical history intake before a patient sees a licensed doctor.

### Key Capabilities
- **Multi-modal Intake**: Accepts text and microphone audio uploads.
- **Multilingual Indian Speech Processing**: Powered by Sarvam Saaras (Speech-to-Text) and Sarvam Bulbul (Text-to-Speech) supporting 10+ Indian languages (Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, and Indian English).
- **Independent Medical Emergency Safety Engine**: Deterministic red-flag detection runs **prior to and independently from** the LLM to identify critical symptoms (crushing chest pain, severe shortness of breath, stroke signs, severe hemorrhage, anaphylaxis, suicidal crises) and immediately halts intake, advising emergency care (108/112/911).
- **Clinical Dialogue State Machine**: Progresses through Chief Complaint, HPI / SOCRATES pain analysis, Past Medical History, Medications, Allergies, and Review of Systems (ROS).
- **Zero Hallucinated Negative Symptoms**: Enforces strict verification that Review of Systems negative symptoms were explicitly asked and denied by the patient.
- **Optional Traditional Medicine Extension**: Non-intrusive support for Ayurvedic *Dashavidha Pariksha* assessments when enabled.
- **Strict Privacy & Consent**: Adheres to patient data consent and audio consent rules. Temporary audio files are scrubbed immediately. Structured logger strictly redacts clinical narratives, audio, and credentials.

> **Medical Disclaimer**: MediKiosk is an AI history-taking assistant for preliminary triage and intake. It is **NOT** a doctor, never makes definitive diagnoses, and never prescribes medication.

---

## 2. Architecture & System Flow

```
+-------------------------------------------------------------------------------+
|                             Frontend (React App)                              |
+------------------------------------+------------------------------------------+
                                     | REST (JSON / Multipart Audio)
                                     v
+-------------------------------------------------------------------------------+
|                           Express Security Boundary                           |
|  - Helmet Security Headers                                                    |
|  - CORS Whitelisting                                                          |
|  - Rate Limiter (IP-based)                                                    |
|  - Request ID Tracing                                                         |
|  - Zod Request Validation                                                     |
|  - Prompt Injection Defense & NoSQL Sanitization                              |
+------------------------------------+------------------------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
   [Text Message Route]                          [Audio Message Route]
                |                                         |
                |                                 Sarvam Saaras STT
                |                                (detects language &
                |                                   transcribes)
                |                                         |
                +--------------------+--------------------+
                                     |
                                     v
                 +---------------------------------------+
                 |  Independent Emergency Red-Flag      |
                 |  Detection Engine (emergencyService)  |
                 +-------------------+-------------------+
                                     |
                +--------------------+--------------------+
   [Emergency Detected]                        [Routine / Urgent]
                |                                         |
    Halt Intake, Urgency = EMERGENCY,                     v
    Return 108/112 Guidance                  Clinical Conversation Engine
                                             (SOCRATES, HPI, State Tracking)
                                                          |
                                                          v
                                            Qwen LLM (OpenAI-Compatible)
                                                          |
                                                          v
                                             Assistant Response Text
                                                          |
                                              (Optional Sarvam Bulbul TTS)
                                                          |
                                                          v
                                                MongoDB Persistence
                                             (If dataConsent is TRUE)
                                                          |
                                                          v
                                              Standard JSON Response
```

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Mongoose connection with lifecycle & retry
│   │   └── env.js               # Zod-validated environment configuration
│   ├── controllers/
│   │   ├── authController.js    # Clinician auth & admin analytics
│   │   ├── consultationController.js # Session, chat, and audio turns
│   │   ├── reportController.js  # Clinical report generation & retrieval
│   │   └── speechController.js  # Sarvam STT transcription & TTS synthesis
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & role authorization (admin/doctor)
│   │   ├── errorMiddleware.js   # Centralized error handler & AppError class
│   │   ├── rateLimiter.js       # Standard and AI/speech rate limiters
│   │   ├── securityMiddleware.js# Helmet, CORS, Request ID, sanitization, Multer
│   │   └── validationMiddleware.js # Zod request validation middleware
│   ├── models/
│   │   ├── Consultation.js      # Session, clinical state, messages, consent, report
│   │   ├── Patient.js           # Kiosk patient demographic record
│   │   └── User.js              # Admin & clinician users with bcrypt hashing
│   ├── prompts/
│   │   ├── medicalSystemPrompt.js # Clinical intake, tone, safety, anti-jailbreak
│   │   └── reportPrompt.js      # HPI, strict ROS, differentials, disclaimers
│   ├── routes/
│   │   ├── adminRoutes.js       # Protected admin/doctor analytics & audits
│   │   ├── authRoutes.js        # Clinician login/register
│   │   ├── consultationRoutes.js# Public kiosk consultation endpoints
│   │   ├── reportRoutes.js      # Report endpoints
│   │   └── speechRoutes.js      # Standalone STT and TTS endpoints
│   ├── services/
│   │   ├── conversationService.js # Clinical dialogue state machine & SOCRATES
│   │   ├── emergencyService.js  # Independent red-flag keyword & regex detector
│   │   ├── qwenService.js       # OpenAI-compatible LLM client
│   │   ├── reportService.js     # Clinical report builder & ROS validator
│   │   └── sarvamService.js     # Sarvam Saaras STT & Bulbul TTS API client
│   ├── utils/
│   │   ├── logger.js            # Privacy-conscious Pino structured logger
│   │   └── sanitize.js          # Prompt injection filter & NoSQL sanitizer
│   ├── app.js                   # Express application setup
│   └── server.js                # Server entrypoint with graceful shutdown
├── tests/
│   ├── emergency.test.js        # Emergency red flag detection tests
│   ├── conversation.test.js     # Dialogue engine & state progression tests
│   ├── qwen.test.js             # LLM prompt and safety tests
│   ├── sarvam.test.js           # STT & TTS mock tests
│   ├── auth.test.js             # Auth & RBAC security tests
│   ├── sanitize.test.js         # Prompt injection & NoSQL injection tests
│   └── api.test.js              # Health, validation, and consent integration tests
├── uploads/                     # Temp directory for processing audio uploads
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Prerequisites & Installation

- **Node.js**: `v18.0.0` or higher (tested on Node v24)
- **MongoDB**: MongoDB Atlas or local MongoDB instance (v5.0+)
- **npm** or **pnpm** or **yarn**

```bash
cd backend
npm install
```

---

## 5. Environment Configuration

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | HTTP port for backend | `5000` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `QWEN_API_KEY` | API Key for Qwen or any OpenAI-compatible provider | `sk-...` |
| `QWEN_BASE_URL` | Base URL for the OpenAI-compatible API | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `QWEN_MODEL` | Model name identifier | `qwen-plus` |
| `SARVAM_API_KEY` | Subscription key for Sarvam AI | `sk_...` |
| `SARVAM_BASE_URL` | Sarvam API base URL | `https://api.sarvam.ai` |
| `SARVAM_STT_MODEL` | Saaras STT model version | `saaras:v3` |
| `SARVAM_TTS_MODEL` | Bulbul TTS model version | `bulbul:v1` |
| `JWT_SECRET` | Secret key for signing clinician JWTs (min 16 chars) | `your_secure_random_string` |
| `JWT_EXPIRES_IN` | Expiration time for JWTs | `24h` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Max general requests per window | `100` |
| `AI_RATE_LIMIT_MAX` | Max AI/Speech requests per window | `30` |

---

## 6. MongoDB Setup

The backend automatically creates and maintains collections in MongoDB:
- `consultations`: Stores intake sessions, messages, clinical states, and reports (only when `consent.dataConsent` is true).
- `patients`: Stores anonymous or demographic kiosk profiles.
- `users`: Stores clinician/doctor accounts with bcrypt-hashed passwords.

If you are using MongoDB Atlas:
1. Ensure your IP address is whitelisted under **Network Access** in the MongoDB Atlas dashboard.
2. In `.env`, provide the connection string with the database name:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medikiosk?retryWrites=true&w=majority
   ```

---

## 7. Qwen LLM Provider Setup

MediKiosk uses an **OpenAI-compatible client architecture** in `src/services/qwenService.js`.
This means you can connect to:
1. **Alibaba DashScope (Official Qwen)**:
   ```env
   QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
   QWEN_API_KEY=sk-...
   QWEN_MODEL=qwen-plus
   ```
2. **OpenRouter (Access Qwen 2.5 72B / Qwen 2.5 Max)**:
   ```env
   QWEN_BASE_URL=https://openrouter.ai/api/v1
   QWEN_API_KEY=sk-or-v1-...
   QWEN_MODEL=qwen/qwen-2.5-72b-instruct
   ```
3. **Self-Hosted vLLM / Ollama**:
   ```env
   QWEN_BASE_URL=http://localhost:11434/v1
   QWEN_API_KEY=ollama
   QWEN_MODEL=qwen2.5:14b
   ```

---

## 8. Sarvam AI Setup (Saaras & Bulbul)

1. Obtain your API key from [Sarvam AI Dashboard](https://dashboard.sarvam.ai).
2. Set in `.env`:
   ```env
   SARVAM_API_KEY=sk_...
   SARVAM_BASE_URL=https://api.sarvam.ai
   SARVAM_STT_MODEL=saaras:v3
   SARVAM_TTS_MODEL=bulbul:v1
   ```
3. Audio formats supported: `wav`, `mp3`, `webm`, `ogg`, `m4a`, `flac`. Max upload size is **10MB**.

---

## 9. Running Locally

### Start in Development Mode (with auto-reload):
```bash
npm run dev
```

### Start in Production Mode:
```bash
npm start
```

### Run Tests:
```bash
npm test
```

---

## 10. API Endpoints Reference

### Public / Kiosk Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check probe |
| `POST` | `/api/consultations` | Start new consultation intake |
| `GET` | `/api/consultations/:id` | Get public consultation status |
| `POST` | `/api/consultations/:id/message` | Send patient text message |
| `POST` | `/api/consultations/:id/audio` | Send patient audio file (STT + Qwen + optional TTS) |
| `POST` | `/api/consultations/:id/report` | Generate structured clinical report |
| `GET` | `/api/consultations/:id/report` | Retrieve existing clinical report |
| `POST` | `/api/speech/transcribe` | Standalone audio transcription (Sarvam Saaras) |
| `POST` | `/api/speech/synthesize` | Standalone text synthesis (Sarvam Bulbul) |

### Clinician / Administrative Endpoints (Protected by JWT)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register clinician/admin |
| `POST` | `/api/auth/login` | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/admin/statistics` | Aggregated kiosk metrics & urgency breakdown |
| `GET` | `/api/admin/consultations` | Paginated consultation records |
| `GET` | `/api/admin/consultations/:id` | Full clinical details of a consultation |

---

## 11. Example cURL Requests & Responses

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```
**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-09-09T06:58:00.000Z"
}
```

---

### 2. Start a New Consultation
```bash
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en-IN",
    "patientInfo": {
      "age": 28,
      "gender": "female"
    },
    "consent": {
      "dataConsent": true,
      "audioConsent": true
    },
    "dashavidhaMode": false
  }'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "consultationId": "cst_8df7a92b0c14",
    "status": "active",
    "initialMessage": "Hello. I am your AI health assistant. What brings you to the clinic today? Please describe what you are experiencing."
  }
}
```

---

### 3. Send a Routine Message
```bash
curl -X POST http://localhost:5000/api/consultations/cst_8df7a92b0c14/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have had a throbbing pain in my forehead for 2 days.",
    "languageCode": "en-IN"
  }'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "I understand you have had a throbbing pain in your forehead for the past two days. On a scale of 1 to 10, how severe is the pain, and does anything make it better or worse?",
    "stage": "HPI_SOCRATES",
    "urgency": "routine",
    "followUpRequired": true
  }
}
```

---

### 4. Emergency Trigger (Immediate Safety Override)
```bash
curl -X POST http://localhost:5000/api/consultations/cst_8df7a92b0c14/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have severe crushing chest pain radiating down my left arm and I cannot breathe!"
  }'
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "CRITICAL MEDICAL ALERT: Based on the reported symptoms (Chest Pain / Acute Coronary Syndrome, Severe Respiratory Distress), this may indicate a life-threatening medical emergency.\n\nIMMEDIATE ACTION REQUIRED:\n1. Please alert the kiosk coordinator or medical personnel in this facility immediately.\n2. Dial Emergency Medical Services immediately:\n   - India: Dial 108 or 112 (Ambulance / Emergency)\n   - US: Dial 911\n3. Proceed directly to the nearest hospital Emergency Department.\n\nDo not wait for this digital intake to finish. Seek professional emergency care immediately.",
    "stage": "HPI_SOCRATES",
    "urgency": "emergency",
    "followUpRequired": false
  }
}
```

---

### 5. Send Audio Message (Microphone Input)
```bash
curl -X POST http://localhost:5000/api/consultations/cst_8df7a92b0c14/audio \
  -F "audio=@patient_voice.wav" \
  -F "languageCode=hi-IN" \
  -F "synthesizeReply=true"
```
**Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "मुझे दो दिन से तेज बुखार है और गले में खराश है।",
    "response": "यह सुनकर मुझे खेद है कि आपको बुखार और गले में खराश है। क्या आपको सांस लेने में कोई परेशानी है या खांसी आ रही है?",
    "languageCode": "hi-IN",
    "urgency": "routine",
    "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AA..."
  }
}
```

---

### 6. Generate Final Consultation Report
```bash
curl -X POST http://localhost:5000/api/consultations/cst_8df7a92b0c14/report
```
**Response:**
```json
{
  "success": true,
  "data": {
    "consultationId": "cst_8df7a92b0c14",
    "status": "completed",
    "urgency": "routine",
    "report": {
      "chiefComplaint": "Throbbing forehead headache for 2 days",
      "historyOfPresentIllness": "28-year-old female presents with 2-day history of throbbing forehead headache rated 6/10.",
      "reviewOfSystems": {
        "positive": ["headache", "light sensitivity"],
        "negative": ["fever", "neck stiffness", "shortness of breath"]
      },
      "symptoms": ["headache", "photophobia"],
      "duration": "2 days",
      "severity": "6/10",
      "associatedSymptoms": ["mild nausea"],
      "relevantMedicalHistory": ["No prior history of migraines"],
      "medications": ["None currently taken"],
      "allergies": ["No known drug allergies (NKDA)"],
      "redFlags": [],
      "possibleConditions": [
        "Tension-type headache",
        "Migraine without aura"
      ],
      "recommendedNextSteps": [
        "Consult with an attending physician for direct physical and neurological examination.",
        "Maintain adequate hydration and rest in a dim environment pending physician evaluation."
      ],
      "urgency": "routine",
      "disclaimer": "This preliminary report is generated by an AI assistant medical kiosk for clinical intake and documentation purposes only. It does NOT constitute a definitive medical diagnosis or treatment plan. A licensed physician must evaluate the patient.",
      "dashavidhaAssessment": null
    }
  }
}
```

---

## 12. Security & Privacy Architecture

1. **Prompt Injection Defense**:
   - Every patient message is analyzed by `detectPromptInjection()` in `src/utils/sanitize.js`.
   - Neutralizes injection keywords (e.g. `ignore previous instructions`, `reveal system prompt`, `developer mode`, `<|im_start|>`).
   - The LLM has zero execution privileges and zero access to tools, database queries, or external network requests.
2. **MongoDB NoSQL Injection Defense**:
   - `mongoSanitizeMiddleware` strips all keys starting with `$` or containing dots from incoming JSON payloads.
3. **Privacy-Conscious Structured Logging**:
   - Configured via Pino with comprehensive redaction paths (`redact.paths`).
   - Excludes authorization headers, API keys, passwords, patient message bodies, clinical summaries, and reports from log output.
4. **Consent-Driven Persistence**:
   - If `consent.dataConsent` is `false`, the session is processed ephemerally without persisting patient health records to MongoDB.
   - If `consent.audioConsent` is `false`, audio is never saved; temporary files are deleted immediately after transcription in `finally` blocks.
5. **Rate Limiting**:
   - 100 requests / 15 minutes globally.
   - 30 requests / 15 minutes on speech and AI endpoints to protect against resource exhaustion.
6. **Authentication & Role-Based Authorization**:
   - Clinician routes require signed JWTs.
   - Restricts sensitive records and analytics to `admin` and `doctor` roles.

---

## 13. How to Connect Your Existing React Application

In your existing React application (Vite or Create React App), communicate with the backend using standard `fetch` or `axios`.

### Example: API Client Setup (`api.js` in React)

```javascript
// frontend/src/services/api.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// 1. Start Intake
export const startConsultation = async (language = 'en-IN', patientInfo = {}) => {
  const res = await fetch(`${BACKEND_URL}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      patientInfo,
      consent: { dataConsent: true, audioConsent: true },
      dashavidhaMode: false,
    }),
  });
  return res.json();
};

// 2. Send Text Message
export const sendMessage = async (consultationId, message, languageCode = 'en-IN') => {
  const res = await fetch(`${BACKEND_URL}/consultations/${consultationId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, languageCode }),
  });
  return res.json();
};

// 3. Send Microphone Audio (Blob/File from MediaRecorder)
export const sendAudioMessage = async (consultationId, audioBlob, languageCode = 'en-IN') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'patient_recording.wav');
  formData.append('languageCode', languageCode);
  formData.append('synthesizeReply', 'true');

  const res = await fetch(`${BACKEND_URL}/consultations/${consultationId}/audio`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();

  // If audio returned, play through browser
  if (json.success && json.data.audio) {
    const audio = new Audio(`data:audio/wav;base64,${json.data.audio}`);
    audio.play();
  }

  return json;
};

// 4. Generate Final Report
export const generateReport = async (consultationId) => {
  const res = await fetch(`${BACKEND_URL}/consultations/${consultationId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
};
```

---

## 14. How to Replace Qwen with Any OpenAI-Compatible Model

You do **NOT** need to change any JavaScript code to swap models or providers. All configurations are driven through environment variables.

### Example A: Switching to OpenAI GPT-4o
```env
QWEN_BASE_URL=https://api.openai.com/v1
QWEN_API_KEY=sk-proj-...
QWEN_MODEL=gpt-4o
```

### Example B: Switching to OpenRouter (e.g. DeepSeek or Claude or Llama 3.3)
```env
QWEN_BASE_URL=https://openrouter.ai/api/v1
QWEN_API_KEY=sk-or-v1-...
QWEN_MODEL=meta-llama/llama-3.3-70b-instruct
```

### Example C: Switching to Local Ollama
```env
QWEN_BASE_URL=http://localhost:11434/v1
QWEN_API_KEY=ollama
QWEN_MODEL=qwen2.5:14b
```

---

## 15. Deployment Guide

### Deploying on Linux / Docker / Cloud VM:
1. Ensure Node.js 18+ is installed on the host.
2. Clone repository and run `npm install --omit=dev`.
3. Set environment variables securely in systemd or your container manager.
4. Run using process manager `pm2`:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name medikiosk-backend -i max
   pm2 save
   ```
5. Configure reverse proxy (Nginx or Caddy) with SSL/TLS termination pointing to `http://127.0.0.1:5000`.

---

## 16. Running Automated Tests

The test suite covers:
- Medical emergency red-flag detection (cardiac, respiratory, neuro, psychiatric, bleeding)
- Prompt injection and NoSQL sanitization
- SOCRATES pain history progression and Review of Systems verification
- Sarvam STT & TTS integration interfaces
- JWT authentication and role-based permissions
- Express route integration and validation handling

Run all tests:
```bash
npm test
```
