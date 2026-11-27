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
    <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-cream rounded-t-[28px] sm:rounded-2xl max-w-lg w-full border-t sm:border border-[#E2DBD0] shadow-warm-lg flex flex-col h-[92vh] sm:h-[82vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-ivory">
          <div className="w-12 h-1.5 rounded-full bg-[#E2DBD0]" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-ivory border-b border-[#E2DBD0] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center font-bold text-sm">
              AS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-charcoal">
                  {doctorName || 'Dr. Ananya Sharma, MD'}
                </span>
                <span className="w-2 h-2 rounded-full bg-sage-dark" title="Connected" />
              </div>
              <div className="text-xs text-charcoal-muted flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-dark" />
                <span>Private & Secure Clinical Messaging</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-cream hover:bg-oat-light text-charcoal-muted hover:text-charcoal border border-[#E2DBD0] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-ivory/50">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-charcoal-muted">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-charcoal-muted space-y-2">
              <Stethoscope className="w-8 h-8 text-teal mx-auto" />
              <p className="font-semibold text-charcoal">Send a note to your doctor</p>
              <p className="text-xs text-charcoal-muted">Ask questions about your symptoms, medications, or upcoming visit.</p>
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
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isDoctor
                        ? 'bg-white border border-[#E2DBD0] text-charcoal shadow-warm-sm rounded-tl-xs'
                        : 'bg-sage-dark text-white shadow-warm-sm rounded-tr-xs'
                    }`}
                  >
                    <p className="text-pretty">{m.message_text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-charcoal-muted mt-1 px-1">
                    <span>{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                    {!isDoctor && <CheckCheck className="w-3.5 h-3.5 text-sage-dark" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] bg-cream border-t border-[#E2DBD0] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type your message to your doctor..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white border border-[#E2DBD0] rounded-xl px-4 py-2.5 text-xs text-charcoal focus:border-sage-dark focus:outline-none min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="p-2.5 min-w-[44px] min-h-[44px] bg-sage-dark hover:bg-[#3E5437] text-white rounded-xl transition-colors disabled:opacity-40 shadow-warm-sm flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
