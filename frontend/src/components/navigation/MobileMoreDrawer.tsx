import React from 'react';
import {
  X,
  Calendar,
  FlaskConical,
  Video,
  BookOpen,
  MessageSquare,
  Stethoscope,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { clearAuthToken } from '../../api/client';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSelectTab: (tab: any) => void;
  onOpenScience: () => void;
  onOpenChat: () => void;
  onOpenTelehealth: () => void;
  onLogout: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSelectTab,
  onOpenScience,
  onOpenChat,
  onOpenTelehealth,
  onLogout,
}) => {
  if (!isOpen) return null;

  const navigateAndClose = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] md:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-cream h-full shadow-warm-lg flex flex-col z-10 border-l border-[#E2DBD0] animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E2DBD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-charcoal leading-tight">{user.full_name}</p>
              <p className="text-[10px] text-charcoal-muted">Patient Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-charcoal-muted hover:text-charcoal min-h-[44px] min-w-[44px]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted px-2 py-1">
            Clinical Tools & Care
          </p>

          <button
            type="button"
            onClick={() => navigateAndClose(() => onSelectTab('calendar'))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-oat-light text-left text-xs font-semibold text-charcoal min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-sage-dark" />
              <span>Cycle & Period Calendar</span>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-light" />
          </button>

          <button
            type="button"
            onClick={() => navigateAndClose(() => onSelectTab('labs'))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-oat-light text-left text-xs font-semibold text-charcoal min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="w-4 h-4 text-teal" />
              <span>Your Blood Tests & Labs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-light" />
          </button>

          <button
            type="button"
            onClick={() => navigateAndClose(onOpenTelehealth)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-oat-light text-left text-xs font-semibold text-charcoal min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-teal-dark" />
              <span>Doctor Video Visits</span>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-light" />
          </button>

          <button
            type="button"
            onClick={() => navigateAndClose(onOpenChat)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-oat-light text-left text-xs font-semibold text-charcoal min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-teal" />
              <span>Message Attending Doctor</span>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-light" />
          </button>

          <div className="pt-3 pb-1 border-t border-[#E2DBD0]/70 mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted px-2 py-1">
              Methodology & Standards
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateAndClose(onOpenScience)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-oat-light text-left text-xs font-semibold text-charcoal min-h-[48px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-sage-dark" />
              <span>Science & Methodology</span>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-light" />
          </button>
        </div>

        {/* Footer & Sign Out */}
        <div className="p-4 border-t border-[#E2DBD0] bg-cream space-y-2">
          <div className="flex items-center gap-2 px-2 text-[11px] text-charcoal-muted">
            <ShieldCheck className="w-4 h-4 text-sage-dark" />
            <span>Private & Encrypted Health Vault</span>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-error/30 bg-error-container text-error text-xs font-semibold min-h-[44px] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
