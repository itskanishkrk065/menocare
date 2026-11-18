import React, { useState, useEffect } from 'react';
import { X, Send, Stethoscope, ShieldCheck, CheckCheck, Clock } from 'lucide-react';
import { api } from '../../api/client';

interface CareTeamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string | null;
}

export const CareTeamChatModal: React.FC<CareTeamChatModalProps> = ({
  isOpen,
  onClose,
  doctorName,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const msgs = await api.getMessages();
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      const newMsg = await api.sendMessage({ message_text: inputText.trim() });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-600/30">
              AS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900">
                  {doctorName || 'Dr. Ananya Sharma, MD'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
              </div>
              <div className="text-[11px] text-teal-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Attending Clinician • HIPAA Encrypted</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 space-y-2">
              <Stethoscope className="w-8 h-8 text-teal-400 mx-auto" />
              <p>No messages in this clinical thread yet.</p>
              <p className="text-[11px]">Send a note or question to your doctor below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isDoctor = m.sender_role === 'doctor';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                      isDoctor
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        : 'bg-teal-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {isDoctor && (
                      <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">
                        Dr. Sharma
                      </span>
                    )}
                    <p className="leading-relaxed">{m.message_text}</p>
                    <div
                      className={`text-[9px] flex items-center justify-end gap-1 ${
                        isDoctor ? 'text-slate-400' : 'text-teal-200'
                      }`}
                    >
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isDoctor && <CheckCheck className="w-3 h-3 text-teal-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your clinical question or update for Dr. Sharma..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-teal-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
