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
      <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DBD0]/70 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-teal" />
              <h3 className="text-base font-serif font-semibold text-charcoal">Telehealth & Consultation Hub</h3>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Manage clinical appointments, review patient consultation requests, and launch virtual sessions
            </p>
          </div>

          <button
            onClick={() => onOpenScheduleModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium shadow-warm-sm transition-colors"
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
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-sage-dark text-white font-semibold'
                  : 'bg-ivory text-charcoal-muted hover:text-charcoal border border-[#E2DBD0]'
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
          <div className="p-12 text-center text-xs text-charcoal-muted">Loading consultations...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-cream rounded-2xl p-12 text-center text-xs text-charcoal-muted border border-[#E2DBD0] shadow-warm-sm">
            No consultations found in this category.
          </div>
        ) : (
          filtered.map((appt) => (
            <div
              key={appt.id}
              className="bg-cream rounded-2xl p-5 border border-[#E2DBD0] shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-semibold text-sm text-charcoal">
                    {appt.patient_name || 'Patient'}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                      appt.status === 'confirmed'
                        ? 'bg-sage-soft text-sage-dark border-sage/30'
                        : appt.status === 'completed'
                        ? 'bg-oat text-charcoal-muted border-[#E2DBD0]'
                        : 'bg-peach-soft text-peach border-peach/30'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Requested: {appt.date_time || appt.requested_date || 'Date Pending'}
                </p>
                {appt.reason && (
                  <p className="text-xs text-charcoal mt-1">
                    <b>Reason:</b> {appt.reason}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {appt.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                    className="px-3.5 py-1.5 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Confirm Session
                  </button>
                )}
                {appt.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'completed')}
                    className="px-3.5 py-1.5 bg-ivory hover:bg-oat text-charcoal border border-[#E2DBD0] rounded-xl text-xs font-medium transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
                {appt.meeting_link && (
                  <a
                    href={appt.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-teal-soft text-teal-dark border border-teal/20 hover:bg-teal/20 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
