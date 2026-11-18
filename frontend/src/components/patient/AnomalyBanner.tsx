import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';

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
      setSuccessMsg('Appointment consultation request submitted to your attending doctor.');
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
        const isEmergency = alert.severity_level === 'emergency';
        const isUrgent = alert.severity_level === 'urgent';

        return (
          <div
            key={alert.id}
            className={`rounded-2xl p-4 border shadow-sm transition-all ${
              isEmergency
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : isUrgent
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-teal-50/70 border-teal-200 text-teal-950'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    isEmergency ? 'bg-rose-600 text-white' : isUrgent ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'
                  }`}
                >
                  {isEmergency ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm tracking-tight">{alert.condition_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isEmergency ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {alert.severity_level} (Confidence: {alert.confidence_score}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{alert.recommended_action}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedAlert(alert);
                  setReason(`Follow-up consultation for ${alert.condition_name}`);
                }}
                className={`flex-shrink-0 ml-4 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 ${
                  isEmergency
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Consultation</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Appointment Request Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Request Consultation with Doctor
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Triggered by: <span className="font-semibold text-slate-800">{selectedAlert.condition_name}</span>
            </p>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Preferred Date:</label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Reason / Clinical Notes:</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Appointment Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
