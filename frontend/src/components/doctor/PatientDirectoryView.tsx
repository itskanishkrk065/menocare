import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Video,
  FileText,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../api/client';

interface PatientDirectoryViewProps {
  patients: any[];
  onSelectPatient: (patientId: string) => void;
  onOpenScheduleModal: (patientId: string) => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  patients,
  onSelectPatient,
  onOpenScheduleModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'differential' | 'normal'>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  const filteredPatients = patients.filter((p) => {
    // Search
    const matchesSearch =
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.straw_stage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.alerts?.some((a: any) => a.condition_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Stage filter
    const matchesStage =
      selectedStage === 'all' || p.straw_stage?.toLowerCase().includes(selectedStage.toLowerCase());

    // Category filter
    let matchesCategory = true;
    if (selectedFilter === 'critical') {
      matchesCategory = p.has_high_priority_alerts || p.alerts?.some((a: any) => a.severity_level === 'emergency');
    } else if (selectedFilter === 'differential') {
      matchesCategory = (p.alerts?.length || 0) > 0 && !p.has_high_priority_alerts;
    } else if (selectedFilter === 'normal') {
      matchesCategory = (p.alerts?.length || 0) === 0;
    }

    return matchesSearch && matchesStage && matchesCategory;
  });

  const toggleExpand = (patientId: string) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
  };

  const handleDownloadPdf = (patientId: string) => {
    const url = api.downloadPdfUrl(180, patientId);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Categorical Patient Directory</h3>
            </div>
            <p className="text-xs text-slate-500">
              Structured clinical records classified by detected pathology, STRAW stage, and risk tier
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, disease, or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none w-64"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All Patients (${patients.length})` },
              {
                id: 'critical',
                label: `🚨 Red Flags (${patients.filter((p) => p.has_high_priority_alerts).length})`,
              },
              {
                id: 'differential',
                label: `⚠️ Chronic Differentials (${patients.filter((p) => p.alerts?.length > 0 && !p.has_high_priority_alerts).length})`,
              },
              {
                id: 'normal',
                label: `✅ Stable / Normal (${patients.filter((p) => (p.alerts?.length || 0) === 0).length})`,
              },
            ].map((btn: any) => (
              <button
                key={btn.id}
                onClick={() => setSelectedFilter(btn.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedFilter === btn.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="all">All STRAW Stages</option>
              <option value="early">Early Transition</option>
              <option value="late">Late Transition</option>
              <option value="post">Postmenopause</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Classification Cards (Categorical & Expandable) */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200 shadow-sm">
            No patients match the selected criteria.
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isExpanded = expandedPatientId === patient.patient_id;
            const hasCritical = patient.has_high_priority_alerts;
            const alertsList = patient.alerts || [];

            return (
              <div
                key={patient.patient_id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden hover:shadow-md ${
                  hasCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Row / Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow-sm">
                        {patient.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'PT'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          hasCritical
                            ? 'bg-rose-500 animate-pulse'
                            : alertsList.length > 0
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4
                          onClick={() => onSelectPatient(patient.patient_id)}
                          className="text-sm font-black text-slate-900 hover:text-teal-700 cursor-pointer transition-colors"
                        >
                          {patient.full_name}
                        </h4>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          Age: {patient.age || '48'}
                        </span>
                        <span className="text-xs bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-bold">
                          {patient.straw_stage}
                        </span>
                      </div>

                      {/* Bio line */}
                      <p className="text-[11px] text-slate-500">
                        Amenorrhea: <span className="font-semibold text-slate-700">{patient.surgical_history?.amenorrhea_days ? `${patient.surgical_history.amenorrhea_days}d` : 'None'}</span> • Meds: <span className="font-semibold text-slate-700">{patient.current_medications?.length > 0 ? patient.current_medications.join(', ') : 'None'}</span>
                      </p>

                      {/* Detected Problems / Findings Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {alertsList.length === 0 ? (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Benign Transition (No Pathological Anomalies)</span>
                          </span>
                        ) : (
                          alertsList.map((a: any) => (
                            <span
                              key={a.id}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-1 border ${
                                a.severity_level === 'emergency'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <span>{a.condition_name}</span>
                              <span className="opacity-75 font-mono">({a.confidence_score}%)</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => onSelectPatient(patient.patient_id)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Social Profile & Feed</span>
                    </button>

                    <button
                      onClick={() => onOpenScheduleModal(patient.patient_id)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Consult</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(patient.patient_id)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Download Certified PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(patient.patient_id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                      title="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Categorical Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Clinical Baseline */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-800 block border-b border-slate-100 pb-1">
                          Clinical Baseline
                        </span>
                        <div className="text-slate-600 space-y-1">
                          <p>
                            <b>Birth Year:</b> {patient.birth_year}
                          </p>
                          <p>
                            <b>Prolonged Amenorrhea:</b>{' '}
                            {patient.surgical_history?.amenorrhea_days
                              ? `${patient.surgical_history.amenorrhea_days} days`
                              : 'None recorded'}
                          </p>
                          <p>
                            <b>Medications:</b>{' '}
                            {patient.current_medications?.length > 0
                              ? patient.current_medications.join(', ')
                              : 'None reported'}
                          </p>
                        </div>
                      </div>

                      {/* Active Pathological Findings & Action */}
                      <div className="md:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-800 block border-b border-slate-100 pb-1">
                          Identified Clinical Findings & Recommended Workup
                        </span>
                        {alertsList.length === 0 ? (
                          <p className="text-slate-500">
                            Patient exhibits typical perimenopausal fluctuations within normal variance. No action required.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {alertsList.map((a: any) => (
                              <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{a.condition_name}</span>
                                  <span className="font-mono text-xs font-semibold text-teal-800">
                                    {a.confidence_score}% Confidence
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-1">{a.description}</p>
                                <p className="text-teal-900 font-semibold mt-1">
                                  <b>Recommended Action:</b> {a.recommended_action}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};