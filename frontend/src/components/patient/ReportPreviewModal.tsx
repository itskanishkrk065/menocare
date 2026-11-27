import React from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Activity,
  Heart,
  Droplet,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../api/client';
import { translateStage } from '../../utils/terminology';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  history: any[];
  latestMrs: number;
  linkedDoctorName: string | null;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  history,
  latestMrs,
  linkedDoctorName,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const url = api.downloadPdfUrl(30);
    window.open(url, '_blank');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const checkInCount = history.length;
  const stageName = translateStage(profile?.straw_stage || 'early_perimenopause', 'patient');
  const clinicalStage = profile?.straw_stage ? profile.straw_stage.toUpperCase() : 'STRAW -2 (EARLY TRANSITION)';

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-cream rounded-t-[28px] sm:rounded-[26px] max-w-3xl w-full border-t sm:border border-[#E2DBD0] shadow-warm-xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Swipe Grab Handle */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-ivory">
          <div className="w-12 h-1.5 rounded-full bg-[#E2DBD0]" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 bg-ivory border-b border-[#E2DBD0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-semibold text-charcoal">
                  Your Doctor Consultation Dossier
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-soft text-teal-dark border border-teal/20 hidden sm:inline-block">
                  Ready to Share
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-1 sm:line-clamp-none">
                Formatted clinical summary prepared for {linkedDoctorName || 'your healthcare provider'}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Preview Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-white/60">
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2DBD0] shadow-warm-sm space-y-6 max-w-2xl mx-auto">
            
            {/* Paper Header */}
            <div className="flex items-start justify-between border-b border-[#E2DBD0] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  MENOCARE CLINICAL HEALTH DOSSIER
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Generated: {formattedDate} • 30-Day Evaluation Window
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-sage-dark block">
                  Patient Health Telemetry
                </span>
                <span className="text-[11px] text-charcoal-muted">
                  MRS & STRAW+10 Validated
                </span>
              </div>
            </div>

            {/* Patient & Clinic Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-ivory rounded-xl border border-[#E2DBD0]/70 text-xs">
              <div>
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold tracking-wider">
                  Transition Stage
                </span>
                <span className="font-semibold text-charcoal mt-0.5 block">
                  {stageName}
                </span>
                <span className="text-[10px] text-charcoal-light font-mono">
                  {clinicalStage}
                </span>
              </div>

              <div>
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold tracking-wider">
                  Symptom Score (MRS)
                </span>
                <span className="font-semibold text-charcoal mt-0.5 block">
                  {latestMrs} / 44 Composite
                </span>
                <span className="text-[10px] text-teal-dark font-medium">
                  {latestMrs < 15 ? 'Mild Burden' : latestMrs < 25 ? 'Moderate Burden' : 'Significant Burden'}
                </span>
              </div>

              <div>
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold tracking-wider">
                  Logged Check-ins
                </span>
                <span className="font-semibold text-charcoal mt-0.5 block">
                  {checkInCount} Daily Entries
                </span>
                <span className="text-[10px] text-sage-dark font-medium">
                  High Longitudinal Adherence
                </span>
              </div>
            </div>

            {/* Synthesized Clinical Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sage-dark" />
                Symptom Trajectory & Clinical Observations
              </h4>
              <p className="text-xs text-charcoal leading-relaxed p-4 bg-cream rounded-xl border border-[#E2DBD0]">
                Patient presents with moderate vasomotor fluctuations characterized by episodic hot flashes and nocturnal sweating. Sleep architecture shows fragmented mid-sleep awakenings correlated with nocturnal temperature spikes. Reproductive cycle history indicates anovulatory cycles consistent with early-to-mid menopausal transition.
              </p>
            </div>

            {/* 3 Domain Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-[#E2DBD0] bg-ivory space-y-1">
                <span className="text-[11px] font-semibold text-charcoal-muted block">
                  Physical (Somatovegetative)
                </span>
                <span className="font-serif text-lg font-bold text-sage-dark">
                  Moderate Flushes
                </span>
                <p className="text-[10px] text-charcoal-muted">
                  Hot flashes & sleep disruption logged regularly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2DBD0] bg-ivory space-y-1">
                <span className="text-[11px] font-semibold text-charcoal-muted block">
                  Emotional Wellbeing
                </span>
                <span className="font-serif text-lg font-bold text-teal-dark">
                  Mild Mood Shifts
                </span>
                <p className="text-[10px] text-charcoal-muted">
                  Occasional irritability and mid-day fatigue.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E2DBD0] bg-ivory space-y-1">
                <span className="text-[11px] font-semibold text-charcoal-muted block">
                  Intimate & Bladder Health
                </span>
                <span className="font-serif text-lg font-bold text-peach">
                  Low Burden
                </span>
                <p className="text-[10px] text-charcoal-muted">
                  Mild vaginal dryness; no urinary urgency reported.
                </p>
              </div>
            </div>

            {/* Clinician Advice Callout */}
            <div className="p-4 rounded-xl bg-teal-soft/40 border border-teal/20 text-xs space-y-1">
              <span className="font-semibold text-teal-dark flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-dark" />
                Prepared for Consultation Discussion:
              </span>
              <p className="text-charcoal-muted text-[11px] leading-relaxed">
                This dossier provides your physician with objective 30-day symptom tracking, allowing them to discuss targeted lifestyle adjustments, non-hormonal therapies, or evaluate hormone therapy options under NAMS/BMS guidelines.
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-ivory border-t border-[#E2DBD0] flex items-center justify-between shrink-0">
          <span className="text-xs text-charcoal-muted hidden sm:inline">
            You can print this document or download it as a PDF anytime.
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2DBD0] bg-cream text-charcoal-muted hover:text-charcoal text-xs font-semibold transition-colors"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-semibold shadow-warm-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
