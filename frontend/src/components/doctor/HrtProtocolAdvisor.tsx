import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Stethoscope,
  Pill,
  ArrowRight,
  Info,
} from 'lucide-react';
import { api } from '../../api/client';

interface HrtProtocolAdvisorProps {
  patient: any;
  onApplyProtocolToSoap?: (planText: string) => void;
}

export const HrtProtocolAdvisor: React.FC<HrtProtocolAdvisorProps> = ({
  patient,
  onApplyProtocolToSoap,
}) => {
  const [hasUterus, setHasUterus] = useState<boolean>(true);
  const [vasomotorSeverity, setVasomotorSeverity] = useState<number>(3);
  const [hasBreastCancer, setHasBreastCancer] = useState<boolean>(false);
  const [hasVteRisk, setHasVteRisk] = useState<boolean>(false);
  const [hasMigraineAura, setHasMigraineAura] = useState<boolean>(false);
  const [hasLiverDisease, setHasLiverDisease] = useState<boolean>(false);
  const [hasUnexplainedBleeding, setHasUnexplainedBleeding] = useState<boolean>(false);

  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const handleEvaluate = async () => {
    setIsLoading(true);
    try {
      const res = await api.evaluateHrtAdvisor({
        has_uterus: hasUterus,
        straw_stage: patient?.straw_stage || 'late_transition',
        age: patient?.age || 49,
        vasomotor_severity: vasomotorSeverity,
        has_breast_cancer_history: hasBreastCancer,
        has_vte_risk: hasVteRisk,
        has_active_liver_disease: hasLiverDisease,
        has_migraine_with_aura: hasMigraineAura,
        has_unexplained_bleeding: hasUnexplainedBleeding,
      });
      setEvaluation(res);
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate clinical protocol.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToSoap = () => {
    if (!evaluation) return;
    const planText = `[NAMS/BMS CLINICAL PROTOCOL: ${evaluation.protocol_name}]\n` +
      (evaluation.estrogen_regimen ? `• Estrogen: ${evaluation.estrogen_regimen}\n` : '') +
      (evaluation.progestogen_regimen ? `• Progestogen: ${evaluation.progestogen_regimen}\n` : '') +
      (evaluation.non_hormonal_first_line ? `• Targeted Therapy: ${evaluation.non_hormonal_first_line}\n` : '') +
      `• Bone Density Support: ${evaluation.bone_density_support}\n` +
      `• Follow-up: Clinical review at ${evaluation.follow_up_weeks} weeks.`;

    if (onApplyProtocolToSoap) {
      onApplyProtocolToSoap(planText);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 3000);
    }
  };

  return (
    <div className="bg-cream rounded-card p-6 border border-outline-variant shadow-warm-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-soft text-teal-dark border border-teal/20">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h3 className="text-base font-serif font-semibold text-charcoal">
              Hormone Therapy Clinical Guide (NAMS / BMS Guidelines)
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Evidence-based decision support evaluating hormone options, uterine status, and cardiovascular safety.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEvaluate}
          disabled={isLoading}
          className="px-4 py-2 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors shadow-warm-sm disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Evaluating...' : 'Run Clinical Safety Check'}</span>
        </button>
      </div>

      {/* Patient Clinical Profile Variables Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
        <div className="space-y-3">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
            Anatomical & Symptom Parameters
          </span>

          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700">Uterine Status</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setHasUterus(true)}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  hasUterus ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Intact Uterus
              </button>
              <button
                type="button"
                onClick={() => setHasUterus(false)}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  !hasUterus ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Hysterectomy
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vasomotor Peak Severity (0 to 4)
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[0, 1, 2, 3, 4].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setVasomotorSeverity(sev)}
                  className={`py-1.5 rounded-lg border font-bold text-xs ${
                    vasomotorSeverity === sev
                      ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contraindication & Risk Toggles */}
        <div className="space-y-3">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
            Contraindication & Safety Flags
          </span>

          <div className="space-y-2">
            {[
              { label: 'Prior Breast Cancer / Hormone Sensitive Malignancy', val: hasBreastCancer, set: setHasBreastCancer },
              { label: 'Elevated VTE / Pulmonary Embolism Risk', val: hasVteRisk, set: setHasVteRisk },
              { label: 'Migraine with Focal Neurological Aura', val: hasMigraineAura, set: setHasMigraineAura },
              { label: 'Active Unexplained Vaginal Bleeding', val: hasUnexplainedBleeding, set: setHasUnexplainedBleeding },
              { label: 'Severe Active Hepatic Dysfunction', val: hasLiverDisease, set: setHasLiverDisease },
            ].map((flag, idx) => (
              <label
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  flag.val
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <span className="text-[11px]">{flag.label}</span>
                <input
                  type="checkbox"
                  checked={flag.val}
                  onChange={(e) => flag.set(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Results Output */}
      {evaluation && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/20 border border-teal-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                Recommended Treatment Protocol
              </span>
              <h4 className="text-base font-black text-slate-900 mt-0.5">
                {evaluation.protocol_name}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  evaluation.is_hrt_eligible
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {evaluation.is_hrt_eligible ? '✓ HRT Indicated' : '⚠️ Non-Hormonal Protocol'}
              </span>

              {onApplyProtocolToSoap && (
                <button
                  type="button"
                  onClick={handleApplyToSoap}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{appliedToast ? 'Inserted!' : 'Insert to SOAP Plan'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {evaluation.estrogen_regimen && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Estrogen Formulation
                </span>
                <p className="font-extrabold text-teal-950">{evaluation.estrogen_regimen}</p>
              </div>
            )}

            {evaluation.progestogen_regimen && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Progestogen Endometrial Protection
                </span>
                <p className="font-extrabold text-slate-900">{evaluation.progestogen_regimen}</p>
              </div>
            )}

            {evaluation.non_hormonal_first_line && (
              <div className="col-span-2 p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Targeted Vasomotor Therapy
                </span>
                <p className="font-bold text-slate-900">{evaluation.non_hormonal_first_line}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <span className="font-extrabold text-slate-900">Clinical Rationale & Monitoring:</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">{evaluation.clinical_rationale}</p>
            <div className="text-[10px] text-teal-800 font-bold pt-1">
              Recommended follow-up interval: {evaluation.follow_up_weeks} weeks.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
