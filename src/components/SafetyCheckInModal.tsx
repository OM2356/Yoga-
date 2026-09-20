import React, { useState } from 'react';
import { SafetyProfile } from '../types';
import { ShieldCheck, AlertCircle, Check, X } from 'lucide-react';

interface SafetyCheckInModalProps {
  isOpen: boolean;
  currentProfile: SafetyProfile;
  onSaveProfile: (profile: SafetyProfile) => void;
  onSkip: () => void;
  canClose?: boolean;
}

export const SafetyCheckInModal: React.FC<SafetyCheckInModalProps> = ({
  isOpen,
  currentProfile,
  onSaveProfile,
  onSkip,
  canClose = false
}) => {
  const [formData, setFormData] = useState<SafetyProfile>({
    completed: true,
    skipped: false,
    pregnantOrPostpartum: currentProfile.pregnantOrPostpartum || false,
    recentInjury: currentProfile.recentInjury || false,
    highBloodPressure: currentProfile.highBloodPressure || false,
    glaucomaOrEye: currentProfile.glaucomaOrEye || false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...formData,
      completed: true,
      skipped: false
    });
  };

  const questions: {
    key: keyof Pick<SafetyProfile, 'pregnantOrPostpartum' | 'recentInjury' | 'highBloodPressure' | 'glaucomaOrEye'>;
    title: string;
    description: string;
    filterImpact: string;
  }[] = [
    {
      key: 'pregnantOrPostpartum',
      title: 'Pregnancy or Postpartum Stage',
      description: 'Are you currently pregnant or within 12 months postpartum?',
      filterImpact: 'Hides deep twists, overheating flows, and late supine postures'
    },
    {
      key: 'recentInjury',
      title: 'Recent Spinal or Joint Injury',
      description: 'Any herniation, neck trauma, or joint surgery in the last 6 months?',
      filterImpact: 'Removes deep twists and strenuous core load'
    },
    {
      key: 'highBloodPressure',
      title: 'Elevated Blood Pressure or Heart Condition',
      description: 'Hypertension or cardiovascular cautions requiring head-above-heart?',
      filterImpact: 'Silently filters out head-below-heart inversions & intense backbends'
    },
    {
      key: 'glaucomaOrEye',
      title: 'Glaucoma or Retinal Cautions',
      description: 'Any eye pressure conditions sensitive to head inversion pressure?',
      filterImpact: 'Silently removes inversions like downward dog or legs-up-wall'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-[#DCE4DD] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E3EBE4] bg-[#F7FAF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E1ECE3] text-[#28573A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1A261F]">
                FlowState Safety Check-In
              </h3>
              <p className="text-xs text-[#5D6F63]">
                One-time check to automatically safeguard your sequence
              </p>
            </div>
          </div>

          {canClose && (
            <button
              onClick={onSkip}
              className="p-1.5 rounded-full text-[#6B7E72] hover:bg-[#EAEFEA]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#526458] leading-relaxed">
            Rather than showing lengthy warning disclaimers, FlowState silently customizes and filters poses so you never have to guess what is safe.
          </p>

          <div className="space-y-2.5">
            {questions.map((q) => {
              const active = formData[q.key];
              return (
                <div
                  key={q.key}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, [q.key]: !prev[q.key] }))
                  }
                  className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#F2F7F3] border-[#4D7E5D] ring-1 ring-[#4D7E5D]/20'
                      : 'bg-[#FAFBF9] border-[#E2EAE3] hover:border-[#CAD8CD]'
                  }`}
                >
                  <div className="pr-3">
                    <div className="text-xs font-semibold text-[#1C2720]">
                      {q.title}
                    </div>
                    <div className="text-[11px] text-[#5C6E62] mt-0.5">
                      {q.description}
                    </div>
                    {active && (
                      <div className="text-[10px] text-[#2E5E40] font-medium mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Filter active: {q.filterImpact}</span>
                      </div>
                    )}
                  </div>

                  {/* Toggle Switch Pill */}
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-1 ${
                      active ? 'bg-[#3B6A4E]' : 'bg-[#D2DDD5]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-[#E5EDE6]">
            <button
              type="button"
              onClick={onSkip}
              className="w-full sm:w-auto text-xs text-[#5D6F63] hover:text-[#212E25] py-2 px-3 hover:underline text-center"
            >
              I’ll do this later (Standard Safe Mode)
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#2D5A3F] hover:bg-[#244A34] text-white font-medium text-xs shadow-xs transition-colors"
            >
              Save Profile & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
