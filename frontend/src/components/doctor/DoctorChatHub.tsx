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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[600px]">
      {/* Left Column: Patient Selector List (4 cols) */}
      <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Patient Threads ({validPatients.length})</span>
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {validPatients.map((p) => {
            const pid = p.patient_id || p.id;
            return (
              <div
                key={pid}
                onClick={() => setSelectedPatientId(pid)}
                className={`p-3.5 cursor-pointer transition-all flex items-center space-x-3 ${
                  selectedPatientId === pid
                    ? 'bg-white border-l-4 border-teal-600 shadow-2xs'
                    : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {p.full_name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 truncate">
                    {p.full_name || 'Patient'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate capitalize">
                    {p.straw_stage?.replace(/_/g, ' ') || 'Stage Unknown'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation (8 cols) */}
      <div className="md:col-span-8 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
          <div>
            <div className="font-extrabold text-xs text-slate-900">
              {selectedPatient?.full_name || 'Select Patient'}
            </div>
            <div className="text-[10px] text-slate-500">
              Direct Clinical Channel • HIPAA Encrypted
            </div>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Active Provider Link
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">
              No messages exchanged with this patient yet. Compose a note below.
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
                    className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                      isDoctor
                        ? 'bg-teal-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {!isDoctor && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Patient Message
                      </span>
                    )}
                    <p className="leading-relaxed">{m.message_text}</p>
                    <div
                      className={`text-[9px] flex items-center justify-end gap-1 ${
                        isDoctor ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isDoctor && <CheckCheck className="w-3 h-3 text-teal-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Reply to ${selectedPatient?.full_name || 'patient'}...`}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
