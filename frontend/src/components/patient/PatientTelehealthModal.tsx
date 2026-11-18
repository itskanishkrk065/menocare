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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Request Clinical Consultation</h3>
            <p className="text-xs text-slate-500">
              With {doctorName || 'Your Attending Clinician'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Preferred Date</label>
            <div className="relative mt-1">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                min={tomorrowStr}
                required
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Primary Reason for Visit</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="symptom_flare">Acute Symptom Flare-Up (Hot Flashes, Night Sweats, Sleep)</option>
              <option value="bleeding_review">Abnormal Bleeding / Cycle Irregularity Assessment</option>
              <option value="lab_review">Review Local Lab Biomarkers (FSH, Estradiol, Thyroid)</option>
              <option value="hrt_counseling">Hormone Replacement Therapy (HRT) Discussion</option>
              <option value="routine_checkin">Routine STRAW Transition Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Notes & Questions for Your Doctor</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="E.g., Hot flashes have increased in frequency this week, waking me up twice per night. Would like to review my recent TSH and estrogen levels."
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-teal-900">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Automatic Clinical Brief Attached</span>
            </div>
            <p className="text-teal-800">
              When submitted, your recent 30-day symptom trends, adherence %, and latest lab values will be summarized
              for your physician automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Confirm Appointment Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
