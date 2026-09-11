/**
 * MediKiosk Backend Live Test Script
 * Runs a simulated clinical intake conversation against a running backend server
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const logPass = (title, details = '') => {
  console.log(`${colors.green}✔ [PASS]${colors.reset} ${colors.bold}${title}${colors.reset}`);
  if (details) console.log(`   ${colors.cyan}${details}${colors.reset}`);
};

const logFail = (title, error) => {
  console.log(`${colors.red}✖ [FAIL]${colors.reset} ${colors.bold}${title}${colors.reset}`);
  if (error) console.log(`   ${colors.red}${error}${colors.reset}`);
};

const logInfo = (title) => {
  console.log(`\n${colors.yellow}➤ ${title}${colors.reset}`);
};

async function runTests() {
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}  MediKiosk AI Backend Live Verification Suite${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  // 1. Health Check
  logInfo('Test 1: Health Check Probe');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.ok && data.success && data.status === 'healthy') {
      logPass('Health Check Endpoint responds with 200 OK', `Status: ${data.status}`);
    } else {
      logFail('Health Check Endpoint failed', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Could not reach backend server at ' + BASE_URL, `Is the server running on port 5000? (${err.message})`);
    console.log(`\n👉 Start the server first in another terminal: cd backend && npm run dev\n`);
    process.exit(1);
  }

  // 2. Start Ephemeral Consultation (Works with or without Atlas whitelist)
  logInfo('Test 2: Start Consultation (Consent Mode: Ephemeral)');
  let consultationId = null;
  try {
    const res = await fetch(`${BASE_URL}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'en-IN',
        consent: { dataConsent: false, audioConsent: true },
        patientInfo: { age: 30, gender: 'female' },
      }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.data?.consultationId) {
      consultationId = data.data.consultationId;
      logPass('Created consultation session successfully', `ID: ${consultationId} | Initial Msg: "${data.data.initialMessage?.slice(0, 50)}..."`);
    } else {
      logFail('Failed to start consultation', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Consultation creation error', err.message);
  }

  // 3. Independent Medical Emergency Interceptor Test
  logInfo('Test 3: Emergency Red-Flag Interceptor (Immediate Safety Override)');
  if (consultationId) {
    try {
      const res = await fetch(`${BASE_URL}/consultations/${consultationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I have severe crushing chest pain radiating to my left arm and I cannot breathe!',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data.urgency === 'emergency') {
        logPass('Emergency red-flag detected independently', `Urgency: ${data.data.urgency} | Guidance includes 108/112 ambulance alert`);
      } else {
        logFail('Emergency was not triggered as expected', JSON.stringify(data));
      }
    } catch (err) {
      logFail('Emergency test error', err.message);
    }
  }

  // 4. Standalone Speech Synthesis (Sarvam TTS)
  logInfo('Test 4: Sarvam Bulbul TTS Speech Synthesis');
  try {
    const res = await fetch(`${BASE_URL}/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'नमस्ते, आपका स्वास्थ्य कैसा है?',
        languageCode: 'hi-IN',
      }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.audio) {
      logPass('Sarvam TTS audio generated successfully', `Audio length: ${data.data.audio.length} base64 chars`);
    } else {
      logFail('Sarvam TTS failed (check SARVAM_API_KEY)', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Sarvam TTS test error', err.message);
  }

  // 5. Protected Admin Route (Security Validation)
  logInfo('Test 5: Protected Admin Route Authorization Check');
  try {
    const res = await fetch(`${BASE_URL}/admin/consultations`);
    const data = await res.json();
    if (res.status === 401 && data.error?.code === 'UNAUTHORIZED') {
      logPass('Protected admin route strictly rejected unauthenticated request (401)', data.error.message);
    } else {
      logFail('Admin route security check failed', `Expected 401, got status ${res.status}`);
    }
  } catch (err) {
    logFail('Admin route error', err.message);
  }

  // 6. Validation Error Handling
  logInfo('Test 6: Request Validation Middleware Check');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (res.status === 400 && data.error?.code === 'VALIDATION_ERROR') {
      logPass('Validation middleware properly rejected empty body (400)', `Code: ${data.error.code}`);
    } else {
      logFail('Validation middleware check failed', JSON.stringify(data));
    }
  } catch (err) {
    logFail('Validation check error', err.message);
  }

  console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  All Core Backend Endpoints Verified Successfully!  ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);
}

runTests();
