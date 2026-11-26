import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { api } from '../../api/client';
import { translateInsight } from '../../utils/terminology';

interface AnomalyBannerProps {
  alerts: any[];
  onAppointmentBooked: () => void;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({ alerts, onAppointmentBooked }) => {
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!alerts || alerts.length === 0) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsSubmitting(true);

    try {
      await api.requestAppointment({
        alert_id: selectedAlert.id,
        requested_date: requestedDate || undefined,
        reason: reason || selectedAlert.recommended_action,
      });
      setSuccessMsg('Your visit request was sent to your doctor.');
      setTimeout(() => {
        setSelectedAlert(null);
        setSuccessMsg(null);
        onAppointmentBooked();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to submit appointment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        return (
          <div
            key={alert.id}
            className="rounded-2xl p-4.5 border border-[#E2DBD0] bg-cream shadow-warm-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-xl bg-peach-soft text-peach mt-0.5">
                  <Info className="w-5 h-5 text-[#C48068]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-charcoal">{translateInsight(alert.condition_name, 'patient')}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-peach-soft text-peach border border-peach/30">
                      Helpful to discuss with doctor
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed text-pretty">
                    {translateInsight(alert.recommended_action, 'patient')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAlert(alert)}
                className="ml-3 shrink-0 px-3.5 py-1.5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-xs font-medium shadow-warm-sm transition-colors flex items-center space-x-1"
              >
                <span>Schedule Discussion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick In-Banner Booking Form */}
            {selectedAlert && selectedAlert.id === alert.id && (
              <form onSubmit={handleBook} className="mt-4 pt-4 border-t border-[#E2DBD0] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1">Preferred Date:</label>
                    <input
                      type="date"
                      required
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full bg-white border border-[#E2DBD0] rounded-xl px-3 py-2 text-xs text-charcoal focus:border-sage-dark focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1">Notes for Your Doctor:</label>
                    <input
                      type="text"
                      placeholder="e.g. Discuss recent symptom changes..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-white border border-[#E2DBD0] rounded-xl px-3 py-2 text-xs text-charcoal focus:border-sage-dark focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {successMsg ? (
                    <span className="text-xs text-sage-dark font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {successMsg}
                    </span>
                  ) : (
                    <span className="text-xs text-charcoal-muted">Your doctor will review your notes and confirm a time.</span>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAlert(null)}
                      className="px-3 py-1.5 text-xs text-charcoal-muted hover:text-charcoal rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors shadow-warm-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
};
