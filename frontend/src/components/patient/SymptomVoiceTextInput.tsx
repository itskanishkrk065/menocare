import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  X,
  RefreshCw,
  Edit3,
  Check,
  ChevronDown,
  Volume2,
} from 'lucide-react';
import { api } from '../../api/client';

interface SymptomVoiceTextInputProps {
  assessmentId?: string;
  onConfirmed?: (confirmedCategories: any[]) => void;
  className?: string;
}

export const SymptomVoiceTextInput: React.FC<SymptomVoiceTextInputProps> = ({
  assessmentId,
  onConfirmed,
  className = '',
}) => {
  // Input Modes & States
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Classification States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [rejectedCodes, setRejectedCodes] = useState<Set<string>>(new Set());
  const [manuallyAddedCodes, setManuallyAddedCodes] = useState<Set<string>>(new Set());

  // Full Taxonomy for manual selection
  const [allTaxonomy, setAllTaxonomy] = useState<any[]>([]);
  const [showTaxonomyPicker, setShowTaxonomyPicker] = useState(false);
  const [searchTaxonomy, setSearchTaxonomy] = useState('');

  // Confirmation state
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Web Speech API recognition reference
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    // Load taxonomy
    api.getSymptomTaxonomy().then((res) => {
      if (res?.categories) {
        setAllTaxonomy(res.categories);
      }
    }).catch(() => {});

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Voice Recording Toggle
  const startRecording = () => {
    setVoiceError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please type below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let accumulated = inputText ? inputText + ' ' : '';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTrans) {
          accumulated += finalTrans;
          setInputText(accumulated.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceError(`Microphone notice: ${event.error}. You can also type directly.`);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setVoiceError('Could not access microphone. Please grant permission or type below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Analyze free text or reviewed voice transcript
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setExtractionResult(null);
    setConfirmedSuccess(false);

    try {
      const res = await api.classifySymptoms({
        text: inputText,
        input_method: inputMode,
        reviewed_transcript: inputMode === 'voice' ? inputText : undefined,
        assessment_id: assessmentId,
      });

      setExtractionResult(res);

      // Preselect non-negated candidate categories with high confidence
      const preselected = new Set<string>();
      const rejected = new Set<string>();

      (res.candidates || []).forEach((c: any) => {
        if (c.preselect && !c.is_negated) {
          preselected.add(c.category_code);
        } else {
          rejected.add(c.category_code);
        }
      });

      setSelectedCodes(preselected);
      setRejectedCodes(rejected);
      setManuallyAddedCodes(new Set());
    } catch (err: any) {
      setVoiceError(err.message || 'Classification service encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle category checkbox
  const toggleCandidate = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
        setRejectedCodes((r) => new Set(r).add(code));
      } else {
        next.add(code);
        setRejectedCodes((r) => {
          const nextR = new Set(r);
          nextR.delete(code);
          return nextR;
        });
      }
      return next;
    });
  };

  // Manually add from taxonomy
  const handleAddManualCategory = (code: string) => {
    setSelectedCodes((prev) => new Set(prev).add(code));
    setManuallyAddedCodes((prev) => new Set(prev).add(code));
    setRejectedCodes((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
    setShowTaxonomyPicker(false);
    setSearchTaxonomy('');
  };

  // Confirm final symptom selections
  const handleConfirm = async () => {
    if (!extractionResult?.extraction_id) return;
    setIsConfirming(true);

    try {
      const confirmedList = Array.from(selectedCodes);
      const rejectedList = Array.from(rejectedCodes);
      const addedList = Array.from(manuallyAddedCodes);

      const res = await api.confirmSymptoms(extractionResult.extraction_id, {
        confirmed_codes: confirmedList,
        rejected_codes: rejectedList,
        added_codes: addedList,
      });

      setConfirmedSuccess(true);
      if (onConfirmed) {
        onConfirmed(res.confirmed_categories || []);
      }
    } catch (err: any) {
      setVoiceError(err.message || 'Failed to confirm structured symptom records.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className={`p-4 bg-white rounded-2xl border border-[#E2DBD0] shadow-warm-sm space-y-4 ${className}`}>
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DBD0]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center border border-sage/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Describe Any Additional Symptoms
            </h3>
            <p className="text-[11px] text-charcoal-muted">
              Speak or type in your own words. MenoCare will identify and ask you to confirm.
            </p>
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center bg-ivory p-1 rounded-xl border border-[#E2DBD0] text-xs">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              inputMode === 'text'
                ? 'bg-white text-charcoal font-bold shadow-warm-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              inputMode === 'voice'
                ? 'bg-sage-dark text-cream font-bold shadow-warm-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak</span>
          </button>
        </div>
      </div>

      {/* Voice Recording Control Bar (When Voice mode is active) */}
      {inputMode === 'voice' && (
        <div className="p-3.5 bg-ivory rounded-xl border border-[#E2DBD0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-warm-sm ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-sage-dark hover:bg-sage text-cream'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-charcoal block">
                {isRecording ? 'Listening to your symptoms...' : 'Tap microphone to start recording'}
              </span>
              <span className="text-[10px] text-charcoal-muted">
                {isRecording
                  ? `Recording in progress (${recordingSeconds}s) — speak naturally`
                  : 'Your words will appear in the editable box below for your review'}
              </span>
            </div>
          </div>

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1.5 bg-red-100 border border-red-300 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200"
            >
              Done Speaking
            </button>
          )}
        </div>
      )}

      {/* Error / Notice Display */}
      {voiceError && (
        <div className="p-3 bg-error-container border border-error/20 text-error text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Text / Editable Transcript Input Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-charcoal-muted font-medium">
          <span>{inputMode === 'voice' ? 'Review & Edit Your Voice Transcript:' : 'Your description:'}</span>
          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setExtractionResult(null);
                setConfirmedSuccess(false);
              }}
              className="text-charcoal-light hover:text-charcoal transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            inputMode === 'voice'
              ? 'Spoken words will appear here. You can edit any transcription typos before analyzing...'
              : 'e.g., I have been waking up soaked in night sweats, feeling anxious in the morning, but no daytime hot flashes.'
          }
          className="w-full p-3 bg-ivory border border-[#E2DBD0] rounded-xl text-xs text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
        />
      </div>

      {/* Analyze Button */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-charcoal-light">
          Supports multiple symptoms, negation (e.g. "no chills"), and informal phrases.
        </span>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isAnalyzing}
          className="px-4 py-2 rounded-xl bg-sage hover:bg-sage-dark text-cream text-xs font-semibold shadow-warm-sm flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing description...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze & Suggest Categories</span>
            </>
          )}
        </button>
      </div>

      {/* Classification Candidate Review & Confirmation Panel */}
      {extractionResult && (
        <div className="p-4 bg-ivory rounded-xl border border-sage/30 space-y-3.5 mt-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-dark" />
              <h4 className="text-xs font-bold text-charcoal">
                Suggested Symptoms (Please Confirm or Adjust)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-charcoal-muted border border-[#E2DBD0]">
              {extractionResult.model_version}
            </span>
          </div>

          {/* Clarification prompt if model detected ambiguity */}
          {extractionResult.clarification_requested && extractionResult.clarification_prompt && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Clarification Needed:</span>
                <p className="text-[11px] leading-relaxed">{extractionResult.clarification_prompt}</p>
              </div>
            </div>
          )}

          {/* Candidate Checkbox List */}
          {extractionResult.candidates && extractionResult.candidates.length > 0 ? (
            <div className="space-y-2">
              {extractionResult.candidates.map((c: any) => {
                const isChecked = selectedCodes.has(c.category_code);
                return (
                  <label
                    key={c.category_code}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white border-sage shadow-warm-sm'
                        : 'bg-cream/40 border-[#E2DBD0] opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCandidate(c.category_code)}
                        className="w-4 h-4 mt-0.5 accent-sage-dark rounded"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-charcoal">{c.category_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-oat-light text-charcoal-muted border border-[#E2DBD0]">
                            {c.domain}
                          </span>
                          {c.is_negated && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold border border-red-200">
                              Negated / Denied
                            </span>
                          )}
                          {c.is_uncertain && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                              Uncertain
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-charcoal-muted mt-0.5">
                          "{c.context_sentence}"
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-charcoal-light shrink-0">
                      {Math.round(c.confidence_score * 100)}% match
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-charcoal-muted italic py-1">
              No specific taxonomy symptoms recognized in this description. You can add them manually below.
            </p>
          )}

          {/* Manually Added Categories */}
          {manuallyAddedCodes.size > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-charcoal block">Manually Added by You:</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(manuallyAddedCodes).map((code) => {
                  const meta = allTaxonomy.find((t) => t.code === code);
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-soft text-teal-dark text-xs font-semibold border border-teal/20"
                    >
                      <span>{meta?.name || code}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCodes((s) => {
                            const next = new Set(s);
                            next.delete(code);
                            return next;
                          });
                          setManuallyAddedCodes((m) => {
                            const next = new Set(m);
                            next.delete(code);
                            return next;
                          });
                        }}
                        className="hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Category from Full Taxonomy Button */}
          <div className="relative pt-1">
            <button
              type="button"
              onClick={() => setShowTaxonomyPicker(!showTaxonomyPicker)}
              className="text-xs text-sage-dark hover:text-charcoal font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another symptom from MenoCare's 30-category taxonomy</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showTaxonomyPicker && (
              <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto p-2 bg-white rounded-xl border border-[#E2DBD0] shadow-warm-lg space-y-2">
                <input
                  type="text"
                  value={searchTaxonomy}
                  onChange={(e) => setSearchTaxonomy(e.target.value)}
                  placeholder="Search taxonomy categories..."
                  className="w-full px-2.5 py-1.5 bg-ivory border border-[#E2DBD0] rounded-lg text-xs"
                />
                <div className="space-y-1">
                  {allTaxonomy
                    .filter(
                      (t) =>
                        !selectedCodes.has(t.code) &&
                        (t.name.toLowerCase().includes(searchTaxonomy.toLowerCase()) ||
                          t.domain.toLowerCase().includes(searchTaxonomy.toLowerCase()))
                    )
                    .map((item) => (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => handleAddManualCategory(item.code)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sage-soft text-xs text-charcoal flex items-center justify-between"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[10px] text-charcoal-muted uppercase">{item.domain}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Final Explicit Confirmation Action */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E2DBD0]/60">
            <span className="text-[11px] text-charcoal-muted">
              {selectedCodes.size} category{selectedCodes.size === 1 ? '' : 's'} selected for structured clinical record.
            </span>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming || selectedCodes.size === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sage-dark to-sage hover:to-teal text-cream text-xs font-semibold shadow-warm-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving record...</span>
                </>
              ) : confirmedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirmed & Saved!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm These Symptoms</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
