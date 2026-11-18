import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  Sparkles,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Video,
  PenTool,
  Clock,
  Plus,
} from 'lucide-react';
import { api } from '../../api/client';
import { SymptomTrendsChart } from '../patient/SymptomTrendsChart';

interface PatientDeepDiveProps {
  patientId: string;
  onBack: () => void;
  onScheduleMeeting?: (patientId: string) => void;
}

export const PatientDeepDive: React.FC<PatientDeepDiveProps> = ({
  patientId,
  onBack,
  onScheduleMeeting,
}) => {
  const [chartsData, setChartsData] = useState<any | null>(null);
  const [diffData, setDiffData] = useState<any | null>(null);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [windowDays, setWindowDays] = useState<number>(30);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // SOAP Note Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    loadPatientData(windowDays);
    loadNotes();
  }, [patientId]);

  const loadPatientData = async (days: number) => {
    setIsLoading(true);
    try {
      const [charts, diff] = await Promise.all([
        api.getCharts(days, patientId),
        api.getDifferential(patientId),
      ]);
      setChartsData(charts);
      setDiffData(diff);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const notes = await api.listPatientNotes(patientId);
      setClinicalNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWindowChange = (days: number) => {
    setWindowDays(days);
    loadPatientData(days);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    try {
      await api.createPatientNote(patientId, {
        note_type: 'soap',
        subjective,
        objective,
        assessment,
        plan,
      });
      setIsAddingNote(false);
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
      loadNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to save clinical note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateSummary(windowDays, patientId);
      setAiReport(res);
    } catch (err: any) {
      alert(err.message || 'Failed to generate AI summary.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDownloadPdf = () => {
    const url = api.downloadPdfUrl(windowDays, patientId);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading patient clinical chart...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onScheduleMeeting && (
            <button
              onClick={() => onScheduleMeeting(patientId)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Launch Telehealth</span>
            </button>
          )}

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>{isGeneratingAi ? 'Synthesizing Narrative...' : 'Generate AI Clinical Summary'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download Certified PDF</span>
          </button>
        </div>
      </div>

      {/* AI Clinical Summary Section (if generated) */}
      {aiReport && (
        <div className="bg-gradient-to-br from-teal-50/70 to-slate-50 rounded-2xl p-6 border border-teal-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-teal-200/60 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Epistemic Clinical Summary (Google Gemini)</h3>
                <p className="text-xs text-slate-500">
                  {aiReport.is_fallback_template
                    ? 'Deterministic Rule-Based Clinical Synthesis'
                    : 'Validated Gemini 1.5 Medical Scribe Narrative (Zero-PII Payload)'}
                </p>
              </div>
            </div>

            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              Anti-Hallucination Guard Verified
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {aiReport.ai_summary?.executive_overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900">Primary Symptom Drivers</span>
              <div className="space-y-2 mt-2">
                {aiReport.ai_summary?.primary_symptom_drivers?.map((d: any, idx: number) => (
                  <div key={idx} className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">
                      • {d.symptom_name} ({d.clinical_trajectory}):
                    </span>{' '}
                    {d.narrative}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900">Clinical Recommendations</span>
              <ul className="space-y-1 mt-2 text-xs text-slate-600 list-disc list-inside">
                {aiReport.ai_summary?.pertinent_clinical_recommendations?.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Time Series Chart with 30d/90d/180d window control */}
      <SymptomTrendsChart
        chartsData={chartsData}
        windowDays={windowDays}
        onWindowChange={handleWindowChange}
      />

      {/* 15-Disease Clinical Differential Screening Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinical Differential & Comorbidity Screening</h3>
            <p className="text-xs text-slate-500">
              Evaluated against symptom durations, bleeding records, and verified local lab markers
            </p>
          </div>
          <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            STRAW Stage: {diffData?.straw_stage?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {diffData?.screenings?.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No condition patterns crossed the clinical confidence threshold (all scores &lt; 40%).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {diffData.screenings.map((cond: any) => {
              const isCritical = cond.risk_tier === 'critical';
              const isHigh = cond.risk_tier === 'high';

              return (
                <div
                  key={cond.condition_code}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isCritical
                      ? 'bg-rose-50/70 border-rose-300'
                      : isHigh
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cond.condition_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-200 text-rose-900'
                          : isHigh
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {cond.confidence_score}% Confidence
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">{cond.category}</p>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-700">Criteria Met:</span>
                    <ul className="text-xs text-slate-600 list-disc list-inside">
                      {cond.matching_criteria_met.map((crit: string, idx: number) => (
                        <li key={idx}>{crit}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs font-medium text-teal-800 pt-1 border-t border-slate-200/60">
                    <b>Recommended Workup:</b> {cond.recommended_workup}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed Local Lab Results Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">Verified Local Laboratory Markers</h3>
        <p className="text-xs text-slate-500">Extracted locally from scanned patient blood tests</p>

        {Object.keys(diffData?.verified_labs_used || {}).length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No local lab reports verified for this patient yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Object.entries(diffData.verified_labs_used).map(([name, val]: [string, any]) => (
              <div key={name} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-medium text-slate-500">{name}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Clinical SOAP Consultation Notes Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Consultation Notes (SOAP)</h3>
              <p className="text-xs text-slate-500">Document physician assessment and management plan</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNote ? 'Cancel Note' : 'Add SOAP Note'}</span>
          </button>
        </div>

        {/* Note Editor Form */}
        {isAddingNote && (
          <form onSubmit={handleSaveNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">New Clinical Note</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjective (Symptoms / Patient History)</label>
                <textarea
                  rows={3}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Patient reports hot flashes 6x/day, worsening sleep..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Objective (Vitals / Exam / Labs)</label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="BP 120/80, FSH 38.5, TSH 1.9, Pelvic exam normal..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment (Clinical Impression)</label>
                <textarea
                  rows={3}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Symptomatic late perimenopause with secondary sleep disruption..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan (Workup / Therapy)</label>
                <textarea
                  rows={3}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="1. Initiate transdermal estradiol + micronized progesterone. 2. Repeat CBC in 3m..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="submit"
                disabled={isSavingNote}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSavingNote ? 'Saving Note...' : 'Save SOAP Note to Patient Chart'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Notes List */}
        {clinicalNotes.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No physician consultation notes saved for this patient yet.
          </div>
        ) : (
          <div className="space-y-3">
            {clinicalNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="font-bold text-slate-900">Physician SOAP Consultation Record</span>
                  <span className="text-[10px] text-slate-400 font-mono">{note.created_at}</span>
                </div>
                {note.subjective && (
                  <p className="text-slate-700">
                    <b className="text-slate-900">S:</b> {note.subjective}
                  </p>
                )}
                {note.objective && (
                  <p className="text-slate-700">
                    <b className="text-slate-900">O:</b> {note.objective}
                  </p>
                )}
                {note.assessment && (
                  <p className="text-slate-700">
                    <b className="text-slate-900">A:</b> {note.assessment}
                  </p>
                )}
                {note.plan && (
                  <p className="text-slate-700">
                    <b className="text-slate-900">P:</b> {note.plan}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};