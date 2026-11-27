/**
 * Typed API Client for MenoCare platform.
 */

const RAW_BASE = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');
const API_BASE = RAW_BASE ? `${RAW_BASE}/api/v1` : '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('menocare_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('menocare_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('menocare_token');
  localStorage.removeItem('menocare_user');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest<any>('/auth/me'),

  // Patient
  getPatientProfile: () => apiRequest<any>('/patients/profile'),
  linkDoctor: (practice_code: string) =>
    apiRequest<any>('/patients/link-doctor', { method: 'POST', body: JSON.stringify({ practice_code }) }),

  // Doctor
  getDoctorProfile: () => apiRequest<any>('/doctors/profile'),
  getPracticeCode: () => apiRequest<any>('/doctors/practice-code'),
  listAuthorizedPatients: () => apiRequest<any[]>('/doctors/patients'),
  getDoctorOverview: () => apiRequest<any>('/doctors/overview'),
  doctorCreateAppointment: (data: any) =>
    apiRequest<any>('/doctors/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id: string, data: any) =>
    apiRequest<any>(`/doctors/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  listPatientNotes: (patientId: string) =>
    apiRequest<any[]>(`/doctors/patients/${patientId}/notes`),
  createPatientNote: (patientId: string, data: any) =>
    apiRequest<any>(`/doctors/patients/${patientId}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  getPatientTimeline: (patientId: string) =>
    apiRequest<any[]>(`/doctors/patients/${patientId}/timeline`),
  getClinicFeed: () =>
    apiRequest<any[]>('/doctors/feed'),

  // Assessments
  getSentinelQuestions: () => apiRequest<any[]>('/assessments/questions/sentinel'),
  getMRSQuestions: () => apiRequest<any[]>('/assessments/questions/mrs'),
  submitDailyCheckIn: (data: any) =>
    apiRequest<any>('/assessments/daily', { method: 'POST', body: JSON.stringify(data) }),
  submitBaselineMRS: (data: any) =>
    apiRequest<any>('/assessments/baseline-mrs', { method: 'POST', body: JSON.stringify(data) }),
  getCheckInHistory: () => apiRequest<any[]>('/assessments/history'),

  // Local Labs
  uploadLabReport: (formData: FormData) =>
    apiRequest<any>('/labs/upload', { method: 'POST', body: formData }),
  listLabReports: (patientId?: string) =>
    apiRequest<any[]>(`/labs/reports${patientId ? `?patient_id=${patientId}` : ''}`),
  verifyLabReport: (reportId: string, analytes: any[]) =>
    apiRequest<any>(`/labs/reports/${reportId}/verify`, { method: 'PUT', body: JSON.stringify({ analytes }) }),

  // Alerts & Appointments
  listAlerts: () => apiRequest<any[]>('/alerts/'),
  acknowledgeAlert: (alertId: string) =>
    apiRequest<any>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  requestAppointment: (data: { alert_id?: string; requested_date?: string; reason: string }) =>
    apiRequest<any>('/alerts/appointments', { method: 'POST', body: JSON.stringify(data) }),
  listAppointments: () => apiRequest<any[]>('/alerts/appointments'),

  // Analytics
  getCharts: (days: number = 30, patientId?: string) =>
    apiRequest<any>(`/analytics/charts?days=${days}${patientId ? `&patient_id=${patientId}` : ''}`),
  getDifferential: (patientId?: string) =>
    apiRequest<any>(`/analytics/differential${patientId ? `?patient_id=${patientId}` : ''}`),

  // Reports & PDF
  generateSummary: (days: number = 30, patientId?: string) =>
    apiRequest<any>(`/reports/generate?days=${days}${patientId ? `&patient_id=${patientId}` : ''}`, { method: 'POST' }),
  downloadPdfUrl: (days: number = 30, patientId?: string) => {
    const token = getAuthToken();
    return `${API_BASE}/reports/download-pdf?days=${days}${patientId ? `&patient_id=${patientId}` : ''}&token=${token}`;
  },

  // Medications & Adherence
  listMedications: (patientId?: string) =>
    apiRequest<any[]>(`/medications/${patientId ? `?patient_id=${patientId}` : ''}`),
  createMedication: (data: any) =>
    apiRequest<any>('/medications/', { method: 'POST', body: JSON.stringify(data) }),
  toggleMedication: (medicationId: string) =>
    apiRequest<any>(`/medications/${medicationId}/toggle`, { method: 'POST' }),
  getAdherenceStats: (patientId?: string) =>
    apiRequest<any>(`/medications/adherence${patientId ? `?patient_id=${patientId}` : ''}`),

  // Clinical Messaging
  getMessages: (patientId?: string) =>
    apiRequest<any[]>(`/messages/${patientId ? `?patient_id=${patientId}` : ''}`),
  sendMessage: (data: { message_text: string; patient_id?: string }) =>
    apiRequest<any>('/messages/', { method: 'POST', body: JSON.stringify(data) }),

  // Clinical Decision Support & HRT Advisor
  evaluateHrtAdvisor: (data: any) =>
    apiRequest<any>('/doctors/hrt-advisor', { method: 'POST', body: JSON.stringify(data) }),

  // Adaptive Assessments Engine
  getAdaptiveQuestionBank: () =>
    apiRequest<any>('/adaptive/questions/bank'),
  getDailyAdaptiveSession: (targetDate?: string) =>
    apiRequest<any>(`/adaptive/session/daily${targetDate ? `?target_date=${targetDate}` : ''}`),
  saveSessionDraft: (sessionId: string, answers: any) =>
    apiRequest<any>(`/adaptive/session/${sessionId}/draft`, { method: 'POST', body: JSON.stringify({ answers }) }),
  completeAdaptiveSession: (sessionId: string, finalAnswers: any, timeToCompleteSeconds: number = 60) =>
    apiRequest<any>(`/adaptive/session/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ final_answers: finalAnswers, time_to_complete_seconds: timeToCompleteSeconds }),
    }),
  getRotationStatus: () =>
    apiRequest<any>('/adaptive/rotation/status'),

  // Intelligent Symptom Intake
  getSymptomTaxonomy: () =>
    apiRequest<any>('/symptoms/taxonomy'),
  classifySymptoms: (data: { text: string; input_method?: string; reviewed_transcript?: string; assessment_id?: string }) =>
    apiRequest<any>('/symptoms/classify', { method: 'POST', body: JSON.stringify(data) }),
  confirmSymptoms: (extractionId: string, data: { confirmed_codes: string[]; rejected_codes: string[]; added_codes: string[] }) =>
    apiRequest<any>(`/symptoms/${extractionId}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
  getSymptomHistory: () =>
    apiRequest<any[]>('/symptoms/history'),

  // Clinical Trend Anomalies
  listPatientAnomalies: (patientId: string, statusFilter?: string) =>
    apiRequest<any[]>(`/anomalies/patient/${patientId}${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
  triggerAnomalyScan: (patientId: string) =>
    apiRequest<any>(`/anomalies/scan/${patientId}`, { method: 'POST' }),
  acknowledgeAnomaly: (anomalyId: string, feedback?: string) =>
    apiRequest<any>(`/anomalies/${anomalyId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ clinician_feedback: feedback }),
    }),
  dismissAnomaly: (anomalyId: string, feedback?: string) =>
    apiRequest<any>(`/anomalies/${anomalyId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ clinician_feedback: feedback }),
    }),

  // Doctor Triage & Prioritisation
  getTriageQueue: (tierFilter?: string) =>
    apiRequest<any[]>(`/triage/queue${tierFilter ? `?tier_filter=${tierFilter}` : ''}`),
  overrideTaskPriority: (taskId: string, overrideTier: string, overrideNotes: string) =>
    apiRequest<any>(`/triage/task/${taskId}/override`, {
      method: 'POST',
      body: JSON.stringify({ override_tier: overrideTier, override_notes: overrideNotes }),
    }),
  updateTaskStatus: (taskId: string, newStatus: string) =>
    apiRequest<any>(`/triage/task/${taskId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    }),
};
