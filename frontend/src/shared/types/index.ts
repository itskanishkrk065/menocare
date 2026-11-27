/**
 * Unified Domain Models & Interfaces for MenoCare.
 * Designed to be framework-agnostic for Web and Future Native Mobile Apps.
 */

export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export type StrawStage =
  | 'premenopause'
  | 'early_perimenopause'
  | 'late_perimenopause'
  | 'perimenopause'
  | 'postmenopause';

export interface PatientRecord {
  id: string;
  patient_id?: string;
  user_id: string;
  full_name: string;
  age: number;
  straw_stage: StrawStage;
  latest_mrs_score?: number;
  doctor_name?: string;
  doctor_practice_code?: string;
  logging_streak_days?: number;
  created_at?: string;
}

export interface DoctorRecord {
  id: string;
  user_id: string;
  full_name: string;
  clinic_name?: string;
  active_code?: string;
  total_patients?: number;
  critical_red_flags_count?: number;
  today_appointments_count?: number;
}

export interface SymptomLogEntry {
  code: string;
  name: string;
  domain: 'somatovegetative' | 'psychological' | 'urogenital';
  intensity: number; // 0-4
  frequency_count?: number;
  date?: string;
  notes?: string;
}

export interface DailyCheckInPayload {
  answers: Record<string, number>;
  hot_flashes_count?: number;
  sleep_hours?: number;
  notes?: string;
  triggers?: string[];
  intake_method?: 'interactive_wizard' | 'voice' | 'quick_tap';
}

export interface MedicationItem {
  id: string;
  patient_id?: string;
  name: string;
  category: 'hrt' | 'non_hormonal' | 'supplement' | 'bone_density';
  dosage: string;
  frequency: string;
  instructions?: string;
  is_taken_today?: boolean;
  taken_today?: boolean;
}

export interface ClinicalAlert {
  id: string;
  patient_id: string;
  patient_name?: string;
  condition_code: string;
  condition_name: string;
  severity_level: 'routine' | 'moderate' | 'urgent' | 'emergency';
  summary?: string;
  recommended_workup?: string;
  status: 'active' | 'acknowledged' | 'dismissed';
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name?: string;
  patient_name?: string;
  date_time: string;
  reason?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  telehealth_url?: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_role: UserRole;
  sender_name?: string;
  message_text: string;
  created_at: string;
}
