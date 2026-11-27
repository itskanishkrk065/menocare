import React from 'react';
import {
  Activity,
  TrendingUp,
  PlusCircle,
  Pill,
  Menu,
  Heart,
  Flame,
} from 'lucide-react';

interface PatientBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenCheckIn: () => void;
  onOpenMore: () => void;
  hasUnloggedToday?: boolean;
}

export const PatientBottomNav: React.FC<PatientBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCheckIn,
  onOpenMore,
  hasUnloggedToday = true,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-lg border-t border-[#E2DBD0] shadow-warm-lg pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        
        {/* Tab 1: Overview */}
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'overview' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-sage-soft' : ''}`}>
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Overview</span>
        </button>

        {/* Tab 2: Trends & Analytics */}
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'analytics' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-sage-soft' : ''}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Trends</span>
        </button>

        {/* Center Primary Action: Daily Check-In */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="w-13 h-13 p-3.5 rounded-full bg-sage-dark hover:bg-sage text-cream shadow-warm-md flex items-center justify-center border-2 border-cream active:scale-95 transition-all"
            aria-label="Start Daily Check-in"
          >
            <PlusCircle className="w-6 h-6 text-cream" />
          </button>
          <span className="text-[10px] font-bold text-sage-dark tracking-tight mt-1">Check-in</span>
        </div>

        {/* Tab 4: Care (Medications & Calendar) */}
        <button
          type="button"
          onClick={() => onSelectTab('medications')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] transition-colors ${
            activeTab === 'medications' || activeTab === 'calendar' ? 'text-sage-dark' : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'medications' || activeTab === 'calendar' ? 'bg-sage-soft' : ''}`}>
            <Pill className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">Care</span>
        </button>

        {/* Tab 5: More Drawer */}
        <button
          type="button"
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[56px] min-h-[48px] text-charcoal-muted hover:text-charcoal transition-colors"
          aria-label="Open More Options"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">More</span>
        </button>

      </div>
    </nav>
  );
};
