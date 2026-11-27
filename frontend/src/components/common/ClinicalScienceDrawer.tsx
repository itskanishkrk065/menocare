import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Activity,
  Heart,
  Droplet,
  Info,
} from 'lucide-react';
import {
  CLINICAL_STANDARDS,
  SYMPTOM_TERMINOLOGY,
  DOMAIN_TERMINOLOGY,
  STAGE_TERMINOLOGY,
} from '../../utils/terminology';

interface ClinicalScienceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalScienceDrawer: React.FC<ClinicalScienceDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'standards' | 'glossary'>('standards');

  if (!isOpen) return null;

  const glossaryItems = Object.entries(SYMPTOM_TERMINOLOGY).map(([key, item]) => ({
    id: key,
    patientName: item.patient,
    clinicalName: item.doctor,
    description: item.patientDescription,
    clinicalContext: item.doctorDescription,
    category: 'Symptom',
  }));

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clinicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-cream border-l border-[#E2DBD0] shadow-warm-xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-ivory border-b border-[#E2DBD0] flex items-start justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sage-soft text-sage-dark border border-sage/20">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-sage-dark">
                  Clinical Methodology & Science
                </span>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal">
                The Medical Science Behind MenoCare
              </h2>
              <p className="text-xs text-charcoal-muted max-w-md">
                MenoCare translates validated clinical instruments into everyday language so you stay informed while your physician receives medically precise data.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-cream hover:bg-oat-light border border-[#E2DBD0] text-charcoal-muted hover:text-charcoal transition-colors focus-visible:ring-2 focus-visible:ring-sage-dark"
              aria-label="Close science drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subnav Toggle */}
          <div className="px-6 py-3 bg-white/70 border-b border-[#E2DBD0] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory('standards')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'standards'
                    ? 'bg-sage-dark text-white shadow-warm-sm'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-oat-light'
                }`}
              >
                Validated Instruments & Standards
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('glossary')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'glossary'
                    ? 'bg-sage-dark text-white shadow-warm-sm'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-oat-light'
                }`}
              >
                Medical Terminology Guide ({filteredGlossary.length})
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {activeCategory === 'standards' ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-sage-soft/50 border border-sage/20 text-xs text-charcoal leading-relaxed space-y-1">
                  <span className="font-semibold text-sage-dark flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sage-dark" />
                    Evidence-Based Clinical Foundation
                  </span>
                  <p className="text-charcoal-muted text-[12px]">
                    Rather than relying on unverified questionnaires, MenoCare is built upon gold-standard clinical research recognized by gynaecological and endocrine societies worldwide.
                  </p>
                </div>

                <div className="space-y-4">
                  {CLINICAL_STANDARDS.map((std) => (
                    <div
                      key={std.code}
                      className="p-5 rounded-2xl bg-white border border-[#E2DBD0] shadow-warm-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-semibold text-charcoal">
                              {std.title}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-soft text-teal-dark border border-teal/20">
                              {std.badge}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-charcoal-muted block mt-0.5">
                            {std.scientificName}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-charcoal leading-relaxed">
                        {std.summary}
                      </p>

                      <div className="p-3 bg-ivory rounded-xl border border-[#E2DBD0]/70 text-[11px] space-y-1">
                        <span className="font-semibold text-sage-dark block">
                          Why It Matters For You:
                        </span>
                        <p className="text-charcoal-muted">
                          {std.whyItMatters}
                        </p>
                      </div>

                      <div className="text-[10px] text-charcoal-light italic font-mono pt-1">
                        Ref: {std.citation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search symptom or medical term..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
                  />
                </div>

                <p className="text-xs text-charcoal-muted">
                  How everyday sensations map directly to the medical terms your healthcare provider uses:
                </p>

                <div className="space-y-3">
                  {filteredGlossary.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border border-[#E2DBD0] shadow-warm-sm space-y-2 hover:border-sage/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="font-serif text-base font-semibold text-charcoal">
                          {item.patientName}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-soft text-sage-dark border border-sage/20 self-start sm:self-auto">
                          {item.clinicalName}
                        </span>
                      </div>

                      <p className="text-xs text-charcoal-muted leading-relaxed">
                        {item.description}
                      </p>

                      {item.clinicalContext && (
                        <div className="text-[11px] text-charcoal-light border-t border-[#E2DBD0]/60 pt-2 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                          <span><strong>Clinical Context:</strong> {item.clinicalContext}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-ivory border-t border-[#E2DBD0] text-center text-xs text-charcoal-muted shrink-0">
            MenoCare Architecture: Validated Clinical Scoring (MRS) • STRAW+10 Staging • NAMS Protocol Guidelines
          </div>

        </div>
      </div>
    </div>
  );
};
