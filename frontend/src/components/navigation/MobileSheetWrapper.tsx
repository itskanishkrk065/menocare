import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileSheetWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  hideHeaderOnDesktop?: boolean;
}

export const MobileSheetWrapper: React.FC<MobileSheetWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  hideHeaderOnDesktop = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Sheet Container */}
      <div
        className={`relative w-full ${maxWidth} bg-cream border-t md:border border-[#E2DBD0] rounded-t-[28px] md:rounded-3xl shadow-warm-lg max-h-[92vh] md:max-h-[88vh] flex flex-col z-10 overflow-hidden transition-all duration-300 ease-out`}
      >
        {/* Mobile Swipe / Grab Handle */}
        <div className="md:hidden w-full pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#E2DBD0]" />
        </div>

        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b border-[#E2DBD0]/70 flex items-center justify-between shrink-0 ${
            hideHeaderOnDesktop ? 'md:hidden' : ''
          }`}
        >
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">{title}</h3>
            {subtitle && <p className="text-xs text-charcoal-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:bg-oat-light transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
