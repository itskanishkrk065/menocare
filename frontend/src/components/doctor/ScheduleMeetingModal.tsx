import React, { useState } from 'react';
import { X, Video, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface ScheduleMeetingModalProps {
  patients: any[];
  defaultPatientId?: string | null;
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  patients,
  defaultPatientId,
  onClose,
  onScheduled,
}) => {
  const [patientId, setPatientId] = useState<string>(
    defaultPatientId || (patients.length > 0 ? (patients[0].patient_id || patients[0].id) : '')
  );
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('Clinical follow-up on reported menopause symptoms and recent lab panel.');
  const [meetingLink, setMeetingLink] = useState<string>(
    `https://meet.jit.si/MenoCare-${Math.random().toString(36).substring(2, 9)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Please select a patient.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.doctorCreateAppointment({
        patient_id: patientId,
        requested_date: dateStr,
        reason,
        meeting_link: meetingLink,
      });
      setSuccess(true);
      setTimeout(() => {
        onScheduled();
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule consultation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-warm-lg border border-[#E2DBD0]">
        <div className="flex items-center justify-between border-b border-[#E2DBD0] pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-charcoal">Schedule Clinical Consultation</h3>
              <p className="text-xs text-charcoal-muted">Schedule or launch a virtual session with your patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-sage-dark mx-auto" />
            <h4 className="text-base font-serif font-semibold text-charcoal">Consultation Scheduled</h4>
            <p className="text-xs text-charcoal-muted">Virtual room is ready and patient record updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Select Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-white border border-[#E2DBD0] rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:border-sage-dark focus:outline-none"
              >
                {patients.map((p) => {
                  const pid = p.patient_id || p.id;
                  return (
                    <option key={pid} value={pid}>
                      {p.full_name || 'Patient'} ({p.straw_stage || 'Early Transition'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Session Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Clinical Agenda / Notes</label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal focus:border-sage-dark focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Encrypted Video Room Link</label>
              <input
                type="text"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ivory border border-[#E2DBD0] rounded-xl text-xs text-charcoal font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2DBD0]">
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
                className="px-5 py-2.5 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors shadow-warm-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
