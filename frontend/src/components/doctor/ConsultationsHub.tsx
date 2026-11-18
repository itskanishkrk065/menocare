import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, CheckCircle2, XCircle, PlusCircle, ExternalLink, Search } from 'lucide-react';
import { api } from '../../api/client';

interface ConsultationsHubProps {
  onOpenScheduleModal: (patientId?: string) => void;
}

export const ConsultationsHub: React.FC<ConsultationsHubProps> = ({ onOpenScheduleModal }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await api.listAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAppointmentStatus(id, { status });
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment status.');
    }
  };

  const filtered = appointments.filter((a) => (filter === 'all' ? true : a.status === filter));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Telehealth & Consultation Hub</h3>
            </div>
            <p className="text-xs text-slate-500">
              Manage clinical appointments, review patient consultation requests, and launch virtual sessions
            </p>
          </div>

          <button
            onClick={() => onOpenScheduleModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule New Consultation</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 text-xs">
          {[
            { id: 'all', label: `All Sessions (${appointments.length})` },
            { id: 'pending', label: `Pending Requests (${appointments.filter((a) => a.status === 'pending').length})` },
            { id: 'confirmed', label: `Confirmed (${appointments.filter((a) => a.status === 'confirmed').length})` },
            { id: 'completed', label: `Completed (${appointments.filter((a) => a.status === 'completed').length})` },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading consultations...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200 shadow-sm">
            No consultations found in this category.
          </div>
        ) : (
          filtered.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">{appt.patient_name || 'Patient'}</h4>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      appt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appt.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {appt.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{appt.requested_date || 'Today'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed max-w-2xl">
                  {appt.reason}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {appt.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                )}

                {appt.meeting_link && (
                  <a
                    href={appt.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center space-x-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Room</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                )}

                {appt.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'completed')}
                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};