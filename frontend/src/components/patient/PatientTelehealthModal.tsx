import React, { useState } from 'react';
import { X, Video, Calendar, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface PatientTelehealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string | null;
  onSuccess: () => void;
}

export const PatientTelehealthModal: React.FC<PatientTelehealthModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  onSuccess,
}) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [requestedDate, setRequestedDate] = useState(tomorrowStr);
  const [reasonCategory, setReasonCategory] = useState('symptom_flare');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fullReason = `[${reasonCategory.toUpperCase()}] ${details || 'General clinical consultation request'}`;

    try {
      await api.requestAppointment({
        requested_date: requestedDate,
        reason: fullReason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to request appointment. Ensure your doctor is linked.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl max-w-lg w-full border border-[#E2DBD0] shadow-warm-lg p-6 sm:p-8 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ivory hover:bg-oat-light text-charcoal-muted hover:text-charcoal border border-[#E2DBD0] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-semibold text-charcoal">Request Doctor Consultation</h3>
            <p className="text-xs text-charcoal-muted">
              With {doctorName || 'Your Attending Doctor'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container border border-error/30 text-error text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Preferred Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
              <input
                type="date"
                min={tomorrowStr}
                required
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Reason for Visit</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
            >
              <option value="symptom_flare">Frequent Hot Flashes, Night Sweats or Sleep Changes</option>
              <option value="hrt_review">Hormone Therapy (HRT) Review & Discussion</option>
              <option value="cycle_irregularity">Irregular Bleeding or Heavy Flow</option>
              <option value="general_checkup">Routine Menopause Health Check-In</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">Notes for Your Doctor (Optional)</label>
            <textarea
              rows={3}
              placeholder="Tell your doctor what you would like to discuss..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium text-white bg-sage-dark hover:bg-[#3E5437] rounded-xl shadow-warm-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Request Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
