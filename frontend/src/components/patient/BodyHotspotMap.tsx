import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Sparkles,
  Heart,
  Droplet,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface BodyHotspotMapProps {
  onSelectSymptom?: (symptomCode: string) => void;
}

interface Hotspot {
  id: string;
  name: string;
  region: string;
  symptomCode: string;
  typicalSymptoms: string[];
  clinicalSignificance: string;
  icon: any;
  color: string;
  badgeBg: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'head',
    name: 'Head & Neurocognitive',
    region: 'Brain, Eyes & Forehead',
    symptomCode: 'MD_MS',
    typicalSymptoms: ['Brain fog & word search lapses', 'Migraines & tension headaches', 'Sleep-onset insomnia'],
    clinicalSignificance: 'Estrogen fluctuation affects hypothalamic neurosteroid receptors and serotonin regulation.',
    icon: Moon,
    color: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'chest',
    name: 'Vasomotor & Cardiopulmonary',
    region: 'Neck, Face & Chest',
    symptomCode: 'VM_HF',
    typicalSymptoms: ['Sudden intense heat flush', 'Heart palpitations', 'Profuse nocturnal sweating'],
    clinicalSignificance: 'Narrowing of the hypothalamic thermoneutral zone triggered by decline in circulating estradiol.',
    icon: Flame,
    color: 'text-rose-600',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'pelvis',
    name: 'Pelvic & Endocrine Dynamics',
    region: 'Uterus, Ovaries & Bladder',
    symptomCode: 'VM_NS',
    typicalSymptoms: ['Irregular cycles & flow flooding', 'Pelvic cramps & ovulatory pain', 'Urinary frequency & dryness'],
    clinicalSignificance: 'Straw stage marker; screening for fibroids, endometrial hyperplasia, or PCOD phenotype.',
    icon: Droplet,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'joints',
    name: 'Musculoskeletal & Vitality',
    region: 'Hips, Knees, Wrists & General',
    symptomCode: 'SO_FT',
    typicalSymptoms: ['Morning joint stiffness & aches', 'Mid-afternoon fatigue crashes', 'Loss of muscle stamina'],
    clinicalSignificance: 'Estrogen receptors in cartilage and joint synovium modulate systemic inflammation and thyroid balance.',
    icon: Sparkles,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

export const BodyHotspotMap: React.FC<BodyHotspotMapProps> = ({ onSelectSymptom }) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(HOTSPOTS[1]); // default to chest/vasomotor

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Interactive Body Map & Symptom Hotspots</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tap a body region to explore localized hormonal manifestations and clinical pathways.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column: Visual Anatomical Regions Selection */}
        <div className="md:col-span-5 space-y-2">
          {HOTSPOTS.map((spot) => {
            const Icon = spot.icon;
            const isSelected = activeHotspot.id === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setActiveHotspot(spot)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-50 to-slate-50 border-teal-500 shadow-sm scale-101'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-white border border-slate-200 shadow-2xs ${spot.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{spot.name}</div>
                    <div className="text-[10px] text-slate-500">{spot.region}</div>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Panel for Selected Hotspot */}
        <div className="md:col-span-7 bg-gradient-to-br from-slate-50 to-teal-50/20 p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${activeHotspot.badgeBg}`}>
              {activeHotspot.region}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Clinical Focus</span>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-slate-900">{activeHotspot.name}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {activeHotspot.clinicalSignificance}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Characteristic Sensations & Symptoms:
            </span>
            <div className="space-y-1">
              {activeHotspot.typicalSymptoms.map((sym, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Synced with attending physician chart</span>
            </div>
            {onSelectSymptom && (
              <button
                type="button"
                onClick={() => onSelectSymptom(activeHotspot.symptomCode)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Log This Symptom Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
