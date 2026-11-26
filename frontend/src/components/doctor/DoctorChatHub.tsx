import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';

interface DoctorChatHubProps {
  patients: any[];
  defaultPatientId?: string | null;
}

export const DoctorChatHub: React.FC<DoctorChatHubProps> = ({
  patients = [],
  defaultPatientId,
}) => {
  const validPatients = (patients || []).filter(Boolean);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    defaultPatientId || (validPatients.length > 0 ? (validPatients[0].patient_id || validPatients[0].id || '') : '')
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPatientId) {
      loadMessages(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadMessages = async (pid: string) => {
    setIsLoading(true);
    try {
      const msgs = await api.getMessages(pid);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPatientId) return;

    setIsSending(true);
    try {
      const newMsg = await api.sendMessage({
        patient_id: selectedPatientId,
        message_text: inputText.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const selectedPatient = validPatients.find((p) => (p.patient_id || p.id) === selectedPatientId);

  return (
    <div className="bg-cream rounded-2xl border border-[#E2DBD0] shadow-warm-sm grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[600px]">
      {/* Left Column: Patient Selector List (4 cols) */}
      <div className="md:col-span-4 border-r border-[#E2DBD0] bg-ivory/50 flex flex-col">
        <div className="p-4 border-b border-[#E2DBD0]">
          <h4 className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-sage-dark" />
            <span>Patient Threads ({validPatients.length})</span>
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E2DBD0]/60">
          {validPatients.map((p) => {
            const pid = p.patient_id || p.id;
            return (
              <div
                key={pid}
                onClick={() => setSelectedPatientId(pid)}
                className={`p-3.5 cursor-pointer transition-colors flex items-center space-x-3 ${
                  selectedPatientId === pid
                    ? 'bg-cream border-l-4 border-sage-dark shadow-warm-sm'
                    : 'hover:bg-oat-light/60'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-sage-soft text-sage-dark font-bold text-xs flex items-center justify-center shrink-0">
                  {p.full_name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-charcoal truncate">
                    {p.full_name || 'Patient'}
                  </div>
                  <div className="text-xs text-charcoal-muted truncate capitalize">
                    {p.straw_stage ? p.straw_stage.replace(/_/g, ' ') : 'Patient'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation (8 cols) */}
      <div className="md:col-span-8 flex flex-col h-full bg-cream">
        {selectedPatient ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#E2DBD0] bg-ivory flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-teal-soft text-teal-dark font-bold text-xs flex items-center justify-center">
                  {selectedPatient.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-sm text-charcoal">
                    {selectedPatient.full_name}
                  </h3>
                  <div className="text-xs text-charcoal-muted flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sage-dark" />
                    <span>Private Patient Communication Channel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-ivory/30">
              {isLoading ? (
                <div className="text-center py-12 text-xs text-charcoal-muted">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-xs text-charcoal-muted space-y-2">
                  <MessageSquare className="w-8 h-8 text-charcoal-muted/40 mx-auto" />
                  <p className="font-medium text-charcoal">No messages in this patient thread yet.</p>
                  <p className="text-xs">Send a note or follow-up recommendation below.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isDoctor = m.sender_role === 'doctor';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isDoctor
                            ? 'bg-sage-dark text-white rounded-tr-xs shadow-warm-sm'
                            : 'bg-white border border-[#E2DBD0] text-charcoal rounded-tl-xs shadow-warm-sm'
                        }`}
                      >
                        <p className="text-pretty">{m.message_text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-charcoal-muted mt-1 px-1">
                        <span>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                        {isDoctor && <CheckCheck className="w-3.5 h-3.5 text-sage-dark" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-[#E2DBD0] bg-cream flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message ${selectedPatient.full_name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white border border-[#E2DBD0] rounded-xl px-4 py-2.5 text-xs text-charcoal focus:border-sage-dark focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="p-2.5 bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl transition-colors disabled:opacity-40 shadow-warm-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-charcoal-muted">
            Select a patient thread to view conversation.
          </div>
        )}
      </div>
    </div>
  );
};
