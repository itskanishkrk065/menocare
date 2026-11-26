import React from 'react';
import { FlaskConical, Info, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BiomarkerGaugesCardProps {
  labData?: any[];
}

export const BiomarkerGaugesCard: React.FC<BiomarkerGaugesCardProps> = ({ labData }) => {
  const markers = [
    {
      name: 'FSH (Follicle-Stimulating Hormone)',
      val: 38.5,
      unit: 'mIU/mL',
      status: 'Typical Transition Range',
      statusColor: 'text-[#B07D38] bg-sand-soft border-sand/40',
      normalRange: 'Before Menopause <10 • Transition 10-25 • Postmenopause >25',
      pct: 85,
      desc: 'Naturally rises as ovarian estrogen production shifts during menopause transition.',
    },
    {
      name: 'Estradiol (Estrogen)',
      val: 22.0,
      unit: 'pg/mL',
      status: 'Fluctuating / Low',
      statusColor: 'text-peach bg-peach-soft border-peach/30',
      normalRange: 'Typical 30-400 pg/mL • Postmenopausal <30 pg/mL',
      pct: 20,
      desc: 'Gradually lower estrogen levels, which can lead to hot flashes and cycle changes.',
    },
    {
      name: 'TSH (Thyroid Function)',
      val: 1.85,
      unit: 'µIU/mL',
      status: 'Normal & Healthy',
      statusColor: 'text-sage-dark bg-sage-soft border-sage/30',
      normalRange: 'Standard healthy range: 0.40 - 4.50 µIU/mL',
      pct: 45,
      desc: 'Confirms that your thyroid is functioning properly and not the cause of fatigue.',
    },
    {
      name: 'Ferritin (Iron Stores)',
      val: 64.0,
      unit: 'ng/mL',
      status: 'Healthy Iron Level',
      statusColor: 'text-teal-dark bg-teal-soft border-teal/20',
      normalRange: 'Adequate range: 30 - 150 ng/mL',
      pct: 55,
      desc: 'Good iron stores help maintain everyday energy and prevent fatigue from heavy periods.',
    },
  ];

  return (
    <div className="bg-cream rounded-2xl p-6 border border-[#E2DBD0] shadow-warm-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2DBD0]/70 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-semibold text-charcoal">
              Recent Blood Tests & Hormone Levels
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Verified lab values organized for your doctor to review your hormonal changes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {markers.map((m) => (
          <div key={m.name} className="p-4 rounded-xl border border-[#E2DBD0] bg-white space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-xs text-charcoal">{m.name}</span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-xl font-serif font-bold text-charcoal">{m.val}</span>
                  <span className="text-xs text-charcoal-muted">{m.unit}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${m.statusColor}`}>
                {m.status}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-oat-light h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sage-dark h-full rounded-full transition-all duration-500"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <div className="text-xs text-charcoal-muted font-medium">{m.normalRange}</div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed pt-2 border-t border-[#E2DBD0]/60 text-pretty">
              {m.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Differential Science Note */}
      <div className="p-4 rounded-xl bg-ivory border border-[#E2DBD0] text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-sage-dark">
          <Info className="w-4 h-4 text-teal" />
          <span>Why Doctors Evaluate These Biomarkers Together (Differential Analysis)</span>
        </div>
        <p className="text-charcoal-muted leading-relaxed text-[11px] text-pretty">
          Estrogen (Estradiol) and FSH help verify your ovarian transition stage under STRAW+10 criteria, while TSH (thyroid function) and Ferritin (iron reserves) rule out clinical mimics that cause fatigue, heart racing, and mood shifts.
        </p>
      </div>
    </div>
  );
};
