const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PatientRegistration {
  age: number;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  anonymous: boolean;
}

export interface ConsultationSession {
  consultationId: string;
  status: string;
  initialMessage: string;
  ephemeral?: boolean;
}

export interface ConsultationTurn {
  message: string;
  stage: string;
  urgency: "routine" | "urgent" | "emergency";
  followUpRequired: boolean;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const payload = (await response.json()) as ApiResponse<T> & { error?: { message?: string } };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || payload.message || "The request failed.");
  }

  return payload.data;
}

export function createConsultation(
  language: string,
  patientInfo: PatientRegistration,
  dataConsent: boolean,
) {
  return request<ConsultationSession>("/consultations", {
    method: "POST",
    body: JSON.stringify({
      language,
      patientInfo,
      consent: { dataConsent, audioConsent: true },
    }),
  });
}

export function sendConsultationMessage(
  consultationId: string,
  message: string,
  languageCode: string,
) {
  return request<ConsultationTurn>(`/consultations/${consultationId}/message`, {
    method: "POST",
    body: JSON.stringify({ message, languageCode }),
  });
}