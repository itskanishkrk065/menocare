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
    defaultPatientId || (patients.length > 0 ? patients[0].patient_id : '')
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Initiate Clinical Consultation</h3>
              <p className="text-xs text-slate-500">Schedule or launch immediate virtual telehealth session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Consultation Scheduled!</h4>
            <p className="text-xs text-slate-500">Virtual room ready and patient invited.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.full_name} ({p.age || '48'}y, {p.straw_stage})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Mode</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-teal-800 font-semibold flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                  <span>Integrated Telehealth</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Reason / Agenda</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                placeholder="E.g., Review red flag bleeding patterns, discuss ultrasound referral..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telehealth Room Link</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap"
                >
                  Test Room
                </a>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Schedule & Notify Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};