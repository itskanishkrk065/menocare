import React from 'react';
import { Activity, Stethoscope, User, LogOut, ShieldCheck } from 'lucide-react';
import { clearAuthToken } from '../../api/client';

interface NavbarProps {
  user: { full_name: string; role: string; email: string };
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-ivory/85 backdrop-blur-md border-b border-[#E2DBD0] sticky top-0 z-40 transition-colors">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Mode */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sage to-teal flex items-center justify-center text-cream shadow-warm-sm">
            <Activity className="w-5 h-5 text-cream" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-semibold tracking-tight text-charcoal">
                MenoCare
              </span>
              <span
                className={`text-xs font-sans font-medium px-2.5 py-0.5 rounded-full ${
                  user.role === 'doctor'
                    ? 'bg-teal-soft text-teal-dark border border-teal/20'
                    : 'bg-sage-soft text-sage-dark border border-sage/20'
                }`}
              >
                {user.role === 'doctor' ? 'Doctor Workspace' : 'Patient Portal'}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted font-medium tracking-wide hidden sm:block">
              Clear, compassionate menopause care
            </p>
          </div>
        </div>

        {/* Live sync badge & User card */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream border border-[#E2DBD0] text-[11px] text-charcoal-muted">
            <span className="w-2 h-2 rounded-full bg-sage-dark" />
            <span className="font-medium">Secure & Connected</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-charcoal bg-cream border border-[#E2DBD0] py-1.5 px-3 rounded-xl font-medium shadow-warm-sm">
            {user.role === 'doctor' ? (
              <Stethoscope className="w-3.5 h-3.5 text-teal" />
            ) : (
              <User className="w-3.5 h-3.5 text-sage-dark" />
            )}
            <span className="font-semibold">{user.full_name}</span>
          </div>

          <button
            onClick={() => {
              clearAuthToken();
              onLogout();
            }}
            className="flex items-center space-x-1.5 text-xs text-charcoal-muted hover:text-error transition-colors p-2 rounded-xl hover:bg-cream border border-transparent hover:border-[#E2DBD0]"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
