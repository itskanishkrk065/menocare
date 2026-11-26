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
    name: 'Head & Sleep',
    region: 'Brain, Head & Sleep',
    symptomCode: 'MD_MS',
    typicalSymptoms: ['Brain fog & forgetfulness', 'Tension headaches', 'Trouble falling asleep'],
    clinicalSignificance: 'Shifts in estrogen affect sleep cycles and neurotransmitters, leading to temporary brain fog or restless nights.',
    icon: Moon,
    color: 'text-teal-dark',
    badgeBg: 'bg-teal-soft text-teal-dark border-teal/20',
  },
  {
    id: 'chest',
    name: 'Chest, Neck & Face',
    region: 'Neck, Face & Chest',
    symptomCode: 'VM_HF',
    typicalSymptoms: ['Sudden heat wave or flushing', 'Heart fluttering or racing', 'Night sweats'],
    clinicalSignificance: 'Fluctuating hormones affect the brain\'s internal thermostat, triggering sudden sensations of intense warmth.',
    icon: Flame,
    color: 'text-peach',
    badgeBg: 'bg-peach-soft text-peach border-peach/30',
  },
  {
    id: 'pelvis',
    name: 'Period & Pelvic Health',
    region: 'Pelvis, Cycle & Bladder',
    symptomCode: 'VM_NS',
    typicalSymptoms: ['Irregular periods or spotting', 'Pelvic cramps', 'Bladder urgency or dryness'],
    clinicalSignificance: 'Ovaries gradually produce less estrogen, altering cycle frequency, flow heaviness, and natural tissue moisture.',
    icon: Droplet,
    color: 'text-sage-dark',
    badgeBg: 'bg-sage-soft text-sage-dark border-sage/30',
  },
  {
    id: 'joints',
    name: 'Joints & Muscles',
    region: 'Hips, Knees & Hands',
    symptomCode: 'SO_FT',
    typicalSymptoms: ['Morning joint stiffness', 'Aching knees or hands', 'Afternoon fatigue'],
    clinicalSignificance: 'Estrogen helps soothe inflammation in joints and cartilage, so changing levels can cause temporary stiffness.',
    icon: Sparkles,
    color: 'text-[#B07D38]',
    badgeBg: 'bg-sand-soft text-[#B07D38] border-sand/40',
  },
];

export const BodyHotspotMap: React.FC<BodyHotspotMapProps> = ({ onSelectSymptom }) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(HOTSPOTS[1]); // default to chest/vasomotor

  return (
    <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2DBD0]/70 pb-3">
        <div>
          <h3 className="text-base font-serif font-semibold text-charcoal flex items-center gap-2">
            <Activity className="w-5 h-5 text-sage-dark" />
            <span>Where You Feel Symptoms</span>
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Tap a region to see which symptoms commonly occur there and why.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Visual Regions Selection */}
        <div className="md:col-span-5 space-y-2">
          {HOTSPOTS.map((spot) => {
            const Icon = spot.icon;
            const isSelected = activeHotspot.id === spot.id;

            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setActiveHotspot(spot)}
                className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-sage-soft border-sage-dark text-charcoal font-semibold'
                    : 'bg-white border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-ivory border border-[#E2DBD0] ${spot.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-charcoal">{spot.name}</div>
                    <div className="text-xs text-charcoal-muted">{spot.region}</div>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep-Dive Panel for Selected Hotspot */}
        <div className="md:col-span-7 bg-white p-5 rounded-xl border border-[#E2DBD0] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${activeHotspot.badgeBg}`}>
              {activeHotspot.region}
            </span>
            <span className="text-xs text-charcoal-muted font-medium">Symptom Guide</span>
          </div>

          <div>
            <h4 className="text-sm font-serif font-semibold text-charcoal">{activeHotspot.name}</h4>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed text-pretty">
              {activeHotspot.clinicalSignificance}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-charcoal block">
              Common Experiences:
            </span>
            <div className="space-y-1">
              {activeHotspot.typicalSymptoms.map((sym, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-charcoal-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-dark shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2DBD0] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
              <Info className="w-3.5 h-3.5 text-sage-dark" />
              <span>Visible in your doctor summary</span>
            </div>
            {onSelectSymptom && (
              <button
                type="button"
                onClick={() => onSelectSymptom(activeHotspot.symptomCode)}
                className="px-3.5 py-1.5 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl text-xs font-medium transition-colors shadow-warm-sm"
              >
                Log This Today
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
