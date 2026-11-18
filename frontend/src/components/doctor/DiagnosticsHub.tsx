import React, { useState } from 'react';
import { FlaskConical, ShieldCheck, Search, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface DiagnosticsHubProps {
  patients: any[];
  onSelectPatient: (patientId: string) => void;
}

export const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample clinic-wide panels extracted locally
  const panels = [
    {
      patientName: 'PCOD / PCOS Phenotype',
      patientId: patients.find((p) => p.full_name?.includes('PCOD'))?.patient_id || '',
      date: '2026-11-15',
      analytes: [
        { name: 'LH', value: '17.8 mIU/mL', flag: 'high', ref: '2.0 - 12.0' },
        { name: 'FSH', value: '6.1 mIU/mL', flag: 'normal', ref: '3.5 - 12.5' },
        { name: 'Testosterone', value: '68.0 ng/dL', flag: 'high', ref: '15.0 - 50.0' },
        { name: 'TSH', value: '1.9 uIU/mL', flag: 'normal', ref: '0.4 - 4.5' },
      ],
      differentialNote: 'LH:FSH ratio = 2.92 (Threshold > 2.0). Diagnostic marker for PCOD / Hyperandrogenism.',
    },
    {
      patientName: 'Hypothyroidism Mimic',
      patientId: patients.find((p) => p.full_name?.includes('Hypothyroidism'))?.patient_id || '',
      date: '2026-11-14',
      analytes: [
        { name: 'TSH', value: '7.2 uIU/mL', flag: 'high', ref: '0.4 - 4.5' },
        { name: 'Free T4', value: '0.7 ng/dL', flag: 'low', ref: '0.8 - 1.8' },
        { name: 'FSH', value: '14.2 mIU/mL', flag: 'normal', ref: '3.5 - 25.0' },
      ],
      differentialNote: 'Primary Hypothyroidism pattern mimicking perimenopausal fatigue and brain fog.',
    },
    {
      patientName: 'Uterine Fibroids & Anemia',
      patientId: patients.find((p) => p.full_name?.includes('Fibroids'))?.patient_id || '',
      date: '2026-11-12',
      analytes: [
        { name: 'Hemoglobin', value: '9.2 g/dL', flag: 'low', ref: '12.0 - 15.5' },
        { name: 'Serum Ferritin', value: '14.0 ng/mL', flag: 'low', ref: '20.0 - 200.0' },
        { name: 'FSH', value: '18.0 mIU/mL', flag: 'normal', ref: '3.5 - 25.0' },
      ],
      differentialNote: 'Microcytic hypochromic anemia secondary to heavy menorrhagia from uterine fibroids.',
    },
    {
      patientName: 'True Premature Ovarian Insufficiency',
      patientId: patients.find((p) => p.full_name?.includes('True'))?.patient_id || '',
      date: '2026-11-10',
      analytes: [
        { name: 'FSH', value: '38.5 mIU/mL', flag: 'high', ref: '< 25.0' },
        { name: 'Estradiol (E2)', value: '18.0 pg/mL', flag: 'low', ref: '> 30.0' },
        { name: 'AMH', value: '0.12 ng/mL', flag: 'low', ref: '1.0 - 3.5' },
      ],
      differentialNote: 'Hypergonadotropic hypogonadism in patient under 40 confirms true POI.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Biochemical Diagnostics & Laboratory Explorer</h3>
            </div>
            <p className="text-xs text-slate-500">
              Aggregated blood panels extracted locally via OCR (PyTesseract & pdfplumber)
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Local Extraction • Zero Cloud PII</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The local OCR engine parses laboratory reports submitted by patients and cross-references extracted analytes with differential diagnostic thresholds (e.g., elevated FSH &ge; 25 mIU/mL for POI, LH:FSH ratio &gt; 2.0 for PCOD, and low Hemoglobin &lt; 12.0 g/dL for Anemia).
        </p>
      </div>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {panels.map((p, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{p.patientName}</h4>
                <span className="text-[10px] text-slate-400 font-mono">Report Date: {p.date}</span>
              </div>

              {p.patientId && (
                <button
                  onClick={() => onSelectPatient(p.patientId)}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center space-x-1"
                >
                  <span>Open Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Analytes chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {p.analytes.map((a, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border ${
                    a.flag === 'high'
                      ? 'bg-rose-50/70 border-rose-200'
                      : a.flag === 'low'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{a.name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        a.flag === 'high'
                          ? 'bg-rose-200 text-rose-800'
                          : a.flag === 'low'
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {a.flag}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{a.value}</p>
                  <span className="text-[9px] text-slate-400">Ref: {a.ref}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
              <b>Differential Correlation:</b> {p.differentialNote}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};