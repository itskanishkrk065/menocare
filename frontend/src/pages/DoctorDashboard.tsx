import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Video,
  FlaskConical,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  FileText,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { api } from '../api/client';
import { PracticeCodeCard } from '../components/doctor/PracticeCodeCard';
import { DailyCommandCenter } from '../components/doctor/DailyCommandCenter';
import { PatientDirectoryView } from '../components/doctor/PatientDirectoryView';
import { ConsultationsHub } from '../components/doctor/ConsultationsHub';
import { DiagnosticsHub } from '../components/doctor/DiagnosticsHub';
import { PatientProfileView } from '../components/doctor/PatientProfileView';
import { ScheduleMeetingModal } from '../components/doctor/ScheduleMeetingModal';
import { DoctorChatHub } from '../components/doctor/DoctorChatHub';

interface DoctorDashboardProps {
  user: any;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'consultations' | 'diagnostics' | 'messages'>('overview');
  const [doctorProfile, setDoctorProfile] = useState<any | null>(null);
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Meeting modal state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingModalPatientId, setMeetingModalPatientId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [profRes, overviewRes, patientsRes, alertsRes] = await Promise.all([
        api.getDoctorProfile().catch(() => null),
        api.getDoctorOverview().catch(() => null),
        api.listAuthorizedPatients().catch(() => []),
        api.listAlerts().catch(() => []),
      ]);
      setDoctorProfile(profRes);
      setOverviewData(overviewRes);
      setPatients(patientsRes);
      setAlerts(alertsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge alert.');
    }
  };

  const openScheduleModal = (patientId?: string) => {
    setMeetingModalPatientId(patientId || null);
    setIsMeetingModalOpen(true);
  };

  const criticalCount = alerts.filter((a) => a.severity_level === 'emergency' || a.severity_level === 'urgent').length;

  return (
    <div className="w-full min-h-screen bg-ivory text-charcoal pb-16">
      
      {/* Top Banner / Navigation Subnav */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-[#E2DBD0] sticky top-16 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'overview', label: 'Daily Command Center', icon: LayoutDashboard, badge: criticalCount > 0 ? criticalCount : null },
                { id: 'patients', label: 'Patient Cohort Directory', icon: Users, badge: patients.length },
                { id: 'consultations', label: 'Telehealth & Consultations', icon: Video, badge: overviewData?.today_appointments_count || null },
                { id: 'diagnostics', label: 'Biomarkers & Lab Hub', icon: FlaskConical },
                { id: 'messages', label: 'Secure Patient Messages', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id && !selectedPatientId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedPatientId(null);
                      setActiveTab(tab.id as any);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      isActive
                        ? 'bg-sage-soft text-sage-dark border border-sage/30 shadow-warm-sm'
                        : 'text-charcoal-muted hover:text-charcoal hover:bg-oat-light border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sage-dark' : 'text-charcoal-light'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== null && tab.badge !== undefined && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        tab.id === 'overview' && criticalCount > 0
                          ? 'bg-error-container text-error border border-error/20'
                          : 'bg-oat text-charcoal-muted'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openScheduleModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-sage-dark hover:bg-[#3E5437] text-white transition-colors shadow-warm-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule Telehealth</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* If viewing a selected patient deep dive */}
        {selectedPatientId ? (
          <PatientProfileView
            patientId={selectedPatientId}
            onBack={() => setSelectedPatientId(null)}
            onScheduleMeeting={(pid) => openScheduleModal(pid)}
          />
        ) : (
          <>
            {/* Practice Pairing Code Card */}
            <PracticeCodeCard
              practiceCode={doctorProfile?.active_code || null}
              doctorName={user.full_name}
              clinicName={doctorProfile?.clinic_name || null}
            />

            {/* Tab 1: Overview / Daily Command Center */}
            {activeTab === 'overview' && (
              <DailyCommandCenter
                overviewData={overviewData}
                alerts={alerts}
                patients={patients}
                onSelectPatient={(pid) => setSelectedPatientId(pid)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onOpenScheduleModal={(pid) => openScheduleModal(pid)}
              />
            )}

            {/* Tab 2: Patient Directory */}
            {activeTab === 'patients' && (
              <PatientDirectoryView
                patients={patients}
                onSelectPatient={(pid) => setSelectedPatientId(pid)}
                onOpenScheduleModal={(pid) => openScheduleModal(pid)}
              />
            )}

            {/* Tab 3: Consultations & Telehealth */}
            {activeTab === 'consultations' && (
              <ConsultationsHub
                onOpenScheduleModal={(pid) => openScheduleModal(pid)}
              />
            )}

            {/* Tab 4: Diagnostics Hub */}
            {activeTab === 'diagnostics' && (
              <DiagnosticsHub
                patients={patients}
                onSelectPatient={(pid) => setSelectedPatientId(pid)}
              />
            )}

            {/* Tab 5: Messages */}
            {activeTab === 'messages' && (
              <DoctorChatHub
                patients={patients}
                defaultPatientId={null}
              />
            )}
          </>
        )}

      </div>

      {/* Schedule Meeting Modal */}
      {isMeetingModalOpen && (
        <ScheduleMeetingModal
          patients={patients}
          defaultPatientId={meetingModalPatientId}
          onClose={() => setIsMeetingModalOpen(false)}
          onScheduled={loadAllData}
        />
      )}

    </div>
  );
};