import React from 'react';
import {
  LayoutDashboard,
  Users,
  Video,
  FlaskConical,
  MessageSquare,
} from 'lucide-react';

interface DoctorBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  criticalAlertsCount?: number;
  patientsCount?: number;
  appointmentsCount?: number;
}

export const DoctorBottomNav: React.FC<DoctorBottomNavProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertsCount = 0,
  patientsCount = 0,
  appointmentsCount = 0,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-lg border-t border-[#E2DBD0] shadow-warm-lg pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Doctor Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        
        {/* Tab 1: Command Center */}
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors relative ${
            activeTab === 'overview' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all relative ${activeTab === 'overview' ? 'bg-sage-soft' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
            {criticalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {criticalAlertsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Command</span>
        </button>

        {/* Tab 2: Patients */}
        <button
          type="button"
          onClick={() => onSelectTab('patients')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'patients' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'patients' ? 'bg-sage-soft' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Cohort</span>
        </button>

        {/* Tab 3: Consultations / Telehealth */}
        <button
          type="button"
          onClick={() => onSelectTab('consultations')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'consultations' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'consultations' ? 'bg-sage-soft' : ''}`}>
            <Video className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Visits</span>
        </button>

        {/* Tab 4: Labs & Biomarkers */}
        <button
          type="button"
          onClick={() => onSelectTab('diagnostics')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'diagnostics' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'diagnostics' ? 'bg-sage-soft' : ''}`}>
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Labs</span>
        </button>

        {/* Tab 5: Messages */}
        <button
          type="button"
          onClick={() => onSelectTab('messages')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'messages' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-sage-soft' : ''}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Chat</span>
        </button>

      </div>
    </nav>
  );
};
