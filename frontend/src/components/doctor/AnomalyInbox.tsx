import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { api } from '../../api/client';

interface AnomalyInboxProps {
  alerts: any[];
  onSelectPatient: (patientId: string) => void;
  onRefresh: () => void;
}

export const AnomalyInbox: React.FC<AnomalyInboxProps> = ({ alerts, onSelectPatient, onRefresh }) => {
  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.acknowledgeAlert(alertId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge alert.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinical Anomaly & Red-Flag Inbox</h3>
            <p className="text-xs text-slate-500">Real-time alerts requiring clinician attention</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          {alerts.length} Pending
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No unacknowledged alerts or red flags in your clinical panel.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isEmergency = alert.severity_level === 'emergency';
            const isUrgent = alert.severity_level === 'urgent';

            return (
              <div
                key={alert.id}
                onClick={() => onSelectPatient(alert.patient_id)}
                className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                  isEmergency
                    ? 'bg-rose-50/60 border-rose-300'
                    : isUrgent
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isEmergency
                            ? 'bg-rose-200 text-rose-900'
                            : isUrgent
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {alert.severity_level} • {alert.confidence_score}% Confidence
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{alert.condition_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                    <p className="text-xs font-medium text-teal-800 mt-1">
                      <b>Recommended Action:</b> {alert.recommended_action}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm font-medium"
                      title="Mark reviewed"
                    >
                      Acknowledge
                    </button>
                    <div className="text-teal-600 p-1">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
