import React, { useState } from 'react';
import { Session } from '../types';
import { Heart, Gift, Share2, Copy, Check, Sparkles, Smile, ArrowRight, X } from 'lucide-react';

interface GiftPeaceModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

export const GiftPeaceModal: React.FC<GiftPeaceModalProps> = ({
  session,
  isOpen,
  onClose,
  onDone
}) => {
  const [ratedMood, setRatedMood] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const giftCode = 'RESET-PEACE-7DAY';
  const shareUrl = `https://flowstate.app/gift?code=${giftCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const moodRatings = [
    { label: 'Much lighter', icon: '🍃', positive: true },
    { label: 'Tension released', icon: '✨', positive: true },
    { label: 'Mind settled', icon: '🌊', positive: true },
    { label: 'Gentle shift', icon: '🌱', positive: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#DCE5DE] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E3ECE4] bg-[#F7FAF7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B6A4E]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#356144]">
              Session Complete
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6B7D71] hover:bg-[#EAEFEA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Post-session reflection */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#E5F0E7] text-[#2D5C3F] mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#2D5C3F]" />
            </div>
            <h2 className="text-xl font-serif-display font-medium text-[#1A261F]">
              How are you feeling right now?
            </h2>
            <p className="text-xs text-[#5D6F63] mt-1">
              You completed your {session.durationMinutes}-minute reset. Take a moment to notice your breath.
            </p>

            {/* Mood shift rating buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {moodRatings.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setRatedMood(m.label)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    ratedMood === m.label
                      ? 'bg-[#EAF2EC] border-[#3B6A4E] text-[#1D442C] shadow-2xs'
                      : 'bg-[#F9FAF9] border-[#E2EAE3] text-[#425247] hover:border-[#CAD8CD]'
                  }`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* "Gift Peace" Referral Prompt (shown after positive rating or default) */}
          {ratedMood && (
            <div className="p-4 rounded-2xl bg-[#F4F8F5] border border-[#DCE8DF] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A3F] uppercase tracking-wider mb-1">
                <Gift className="w-4 h-4 text-[#356144]" />
                <span>Gift Peace to a Friend</span>
              </div>
              <p className="text-xs text-[#4E6254] leading-relaxed">
                Know someone drowning in work or exam pressure today? Gift them a free <strong>7-day Stress Reset pass</strong>.
              </p>

              {/* Gift Pass Pill */}
              <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#D5E3D8] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-[#6F8275] uppercase tracking-wider">
                    Your Personal Gift Pass
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#1C3624] truncate">
                    {shareUrl}
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-[#2D5A3F] hover:bg-[#224731] text-white text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#A7F3D0]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Gift</span>
                    </>
                  )}
                </button>
              </div>

              {/* Two-Sided Reward */}
              <div className="mt-2.5 text-[11px] text-[#5A7362] flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-[#E11D48] shrink-0" />
                <span>Two-sided gift: When they take their first reset, you both receive 14 days of Weekend Deep Dives.</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onDone}
              className="w-full py-3 rounded-xl bg-[#2D5A3F] hover:bg-[#234933] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Return to FlowState Sanctuary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
