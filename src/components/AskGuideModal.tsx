import React, { useState } from 'react';
import { api } from '../utils/api';
import { SafetyProfile } from '../types';
import { Sparkles, Send, X, ShieldAlert, HeartHandshake } from 'lucide-react';

interface AskGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  safety: SafetyProfile;
  onOpenRoutineGenerator: (presetPrompt?: string) => void;
}

export const AskGuideModal: React.FC<AskGuideModalProps> = ({
  isOpen,
  onClose,
  safety,
  onOpenRoutineGenerator
}) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; actionPrompt?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello. I’m FlowState’s somatic guide. Tell me how you feel, or what pressure your body is under right now.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.askGuide(userText, { safetyFlags: safety });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          actionPrompt: userText
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Take a gentle breath. For quick relief, we suggest trying our 12-Minute Postural Decompression or resting in Child’s Pose.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#DCE4DD] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E3ECE4] bg-[#F7FAF7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2D5A3F] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1A261F]">
                Ask FlowState Guide
              </h3>
              <p className="text-[11px] text-[#5D6F63]">
                Conversational guidance & clinical boundary triage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6B7E72] hover:bg-[#EAEFEA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clinical Disclaimer */}
        <div className="px-4 py-2 bg-[#FFF7F4] border-b border-[#F7DFD5] text-[10px] text-[#7C3F2B] flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#B55636] shrink-0" />
          <span>General somatic wellness support — not emergency or medical care.</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFBF9]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#2D5A3F] text-white rounded-br-xs'
                    : 'bg-white text-[#202E25] border border-[#DEE6DF] shadow-2xs rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {m.actionPrompt && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRoutineGenerator(m.actionPrompt);
                  }}
                  className="mt-1 text-[11px] text-[#2D5A3F] font-semibold hover:underline flex items-center gap-1 bg-[#EAF2EC] px-2.5 py-1 rounded-lg border border-[#D5E3D8]"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Build full routine from this inquiry →</span>
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-[#627768] italic p-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B6A4E] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B6A4E] animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B6A4E] animate-bounce delay-200" />
              <span>Listening...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-[#E3ECE4] bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Work deadline in 20 min and shoulders killing me..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#D4DFD7] focus:outline-hidden focus:ring-2 focus:ring-[#3B6A4E]/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#2D5A3F] hover:bg-[#224832] disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
