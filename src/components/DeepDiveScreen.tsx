import React, { useState } from 'react';
import { SafetyProfile, Session } from '../types';
import { getDeepDiveSession } from '../data/curations';
import { PoseIllustration } from './PoseIllustration';
import { ArrowLeft, Clock, ShieldCheck, Play, Wind, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface DeepDiveScreenProps {
  onStartSession: (session: Session) => void;
  onBack: () => void;
  safety: SafetyProfile;
}

export const DeepDiveScreen: React.FC<DeepDiveScreenProps> = ({
  onStartSession,
  onBack,
  safety
}) => {
  const session = getDeepDiveSession(safety);
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: '01',
      title: 'What is it?',
      content: 'A long-form, non-performative somatic inquiry. Unlike rapid vinyasa classes that spike adrenaline, this immersion holds restorative postures for 3 to 6 minutes, allowing the deep thoracolumbar fascia and the psoas to release protective tension.'
    },
    {
      num: '02',
      title: 'Why practice it?',
      content: 'Sedentary screen work chronically traps the autonomic nervous system in sympathetic tone. Deep restorative immersion stimulates the baroreceptors in your carotid sinuses, activating the vagal brake to lower heart rate and reduce metabolic fatigue.'
    },
    {
      num: '03',
      title: 'Step-by-step Phase Sequence',
      content: 'The 75-minute arc is divided into 4 natural neurological phases: 1. Grounding & Kinetic Unwinding (15 min) → 2. Thoracic & Lateral Opening (20 min) → 3. Deep Sacral Release (25 min) → 4. Parasympathetic Stillness (15 min).'
    },
    {
      num: '04',
      title: 'Breathing Cadence',
      content: 'Sama Vritti and extended exhalations. Inhale through the nose for 4 counts, pause softly without holding pressure for 1 count, and exhale gently for 6 counts. The lengthened exhalation triggers acetylcholine release in cardiac tissue.'
    },
    {
      num: '05',
      title: 'Common Mistakes to Avoid',
      content: 'Do not pull or force the body into maximum flexibility limits. If you feel muscular shaking or joint pinching, back out immediately. Restorative yoga works through stillness and passive gravity, not muscular force.'
    },
    {
      num: '06',
      title: 'Clinical Precautions',
      content: 'If you have acute disc herniation, severe sciatica, or uncontrolled hypertension, avoid inverted postures and keep a neutral spine using bolsters or rolled blankets under your knees and pelvis.'
    },
    {
      num: '07',
      title: 'Practice Guided Session',
      content: 'Enter the distraction-free guided practice with continuous voice cues, chime intervals, and optional modifications for every body archetype.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#242724] flex flex-col max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#506355] hover:text-[#1E3325] hover:bg-[#EFEAE2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Check-in</span>
        </button>

        <span className="text-xs font-mono font-semibold tracking-wider text-[#2A5C3D] uppercase bg-[#E8EFEA] px-3 py-1 rounded-md border border-[#D5E2D8]">
          75-Min Weekend Ritual
        </span>
      </div>

      {/* Editorial Title */}
      <div className="border-b border-[#E7E1D6] pb-6 mb-8">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#7A5641] font-semibold">
          DEEP DIVE INQUIRY
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-medium text-[#1A3123] tracking-tight mt-1">
          Understanding Somatic Rest & Vagal Down-Regulation
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6E61] mt-2 max-w-xl leading-relaxed">
          An intentional, unhurried study of classical restorative sequencing. Read the seven principles below before entering the practice.
        </p>

        <div className="flex items-center gap-3 mt-4 text-xs text-[#4F6053]">
          <span className="flex items-center gap-1 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-[#2C573B]" />
            75 Minutes
          </span>
          <span>·</span>
          <span>4 Progressive Phases</span>
          <span>·</span>
          <span>{session.poses.length} Classical Asanas</span>
        </div>
      </div>

      {/* Seven Sequential Steps */}
      <div className="space-y-3 mb-10">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCurrent = activeStep === stepNum;

          return (
            <div
              key={step.num}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-white border-[#20382B] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E3DDD2] hover:border-[#BFB8AB]'
              }`}
            >
              <button
                onClick={() => setActiveStep(isCurrent ? 0 : stepNum)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-bold text-[#86563F]">
                    {step.num}
                  </span>
                  <span className="font-serif-display font-medium text-base text-[#1A2F21]">
                    {step.title}
                  </span>
                </div>

                <div className="text-[#6D7F72]">
                  {isCurrent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isCurrent && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#4A5C50] leading-relaxed border-t border-[#F2EDE5] ml-9 mr-4">
                  <p>{step.content}</p>

                  {stepNum === 3 && session.segments && (
                    <div className="mt-4 space-y-2">
                      {session.segments.map((seg, sIdx) => (
                        <div key={seg.name} className="p-2.5 rounded-lg bg-[#F5F2EC] border border-[#E4DDCF] flex items-center justify-between text-xs">
                          <span className="font-medium text-[#1E3326]">{sIdx + 1}. {seg.name}</span>
                          <span className="font-mono text-[11px] text-[#718274]">{seg.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {stepNum === 7 && (
                    <div className="mt-4 pt-2">
                      <button
                        onClick={() => onStartSession(session)}
                        className="px-5 py-2.5 rounded-xl bg-[#20382B] text-white text-xs font-semibold hover:bg-[#2D4E3C] transition-colors flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Launch 75-Min Immersion</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Restorative Guarantee notice */}
      <div className="p-4 rounded-xl bg-[#EFF4F0] border border-[#D0E0D4] text-xs text-[#2A5237] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#20492E] shrink-0" />
        <span>
          Includes gentle voice pacing, mindful silence intervals, and zero streak penalties. Rest whenever your body requests stillness.
        </span>
      </div>

      {/* Pinned Start Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF7F2]/95 backdrop-blur-xs border-t border-[#E8E1D5] z-30 flex justify-center">
        <div className="w-full max-w-3xl flex items-center justify-between gap-4">
          <div className="hidden sm:block text-xs text-[#596B5E]">
            Ready to begin? Unroll your mat and adjust your room lighting.
          </div>

          <button
            id="btn-start-deep-dive"
            onClick={() => onStartSession(session)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice (75 Min)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
