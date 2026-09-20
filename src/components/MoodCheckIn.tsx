import React, { useState } from 'react';
import { MoodId } from '../types';
import { 
  HeartHandshake, 
  Target, 
  ZapOff, 
  Flame, 
  BatteryLow, 
  Sparkles,
  ArrowRight,
  Compass,
  CalendarHeart,
  Baby,
  BookOpen,
  Waves,
  ShieldCheck
} from 'lucide-react';

interface MoodCheckInProps {
  onSelectMood: (mood: MoodId) => void;
  onOpenDeepDive: () => void;
  onOpenCycleFlows: () => void;
  onOpenPrenatal: () => void;
  onOpenSafetyModal: () => void;
  onOpenAIAssistant: () => void;
  onOpenAskGuide: () => void;
  onOpenDashboard: () => void;
  onOpenAuth: () => void;
  onOpenWordPressHub: () => void;
  onOpenYogaLibrary: () => void;
  onOpenKnowledgeHub: () => void;
  currentUser: import('../types').User | null;
  safetyProfileConfigured: boolean;
}

const MOOD_OPTIONS: {
  id: MoodId;
  label: string;
  subtext: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'anxious',
    label: 'Anxious',
    subtext: 'Chest tightness, racing thoughts, exam/work overwhelm',
    icon: HeartHandshake
  },
  {
    id: 'sore',
    label: 'Sore',
    subtext: 'Tech-neck, compressed lower back, trapped posture',
    icon: Target
  },
  {
    id: 'wired',
    label: 'Wired',
    subtext: 'Sensory overload, screen fatigue, unable to power down',
    icon: ZapOff
  },
  {
    id: 'cramping',
    label: 'Cramping',
    subtext: 'Pelvic tension, cycle fatigue, sacral heaviness',
    icon: Flame
  },
  {
    id: 'low-energy',
    label: 'Low Energy',
    subtext: 'Sluggish circulation, mental fog, lethargy',
    icon: BatteryLow
  }
];

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({
  onSelectMood,
  onOpenDeepDive,
  onOpenCycleFlows,
  onOpenPrenatal,
  onOpenSafetyModal,
  onOpenAIAssistant,
  onOpenAskGuide,
  onOpenDashboard,
  onOpenAuth,
  onOpenWordPressHub,
  onOpenYogaLibrary,
  onOpenKnowledgeHub,
  currentUser,
  safetyProfileConfigured
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodId>('anxious');

  const handleScrollToReset = () => {
    const el = document.getElementById('sos-reset-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetMe = () => {
    onSelectMood(selectedMood);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#242724] flex flex-col selection:bg-[#20382B]/15">
      {/* 1. HERO SECTION (Minimal, Human, Editorial) */}
      <section className="pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="inline-block mb-3">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#52715E] font-semibold bg-[#EAE5DC] px-3 py-1 rounded-full">
            FLOWSTATE
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif-display font-medium text-[#182F22] tracking-tight leading-[1.15] max-w-2xl mx-auto">
          A few minutes of yoga.<br />
          <span className="italic font-normal text-[#2A4835]">A better state of mind.</span>
        </h1>

        <p className="text-sm sm:text-base text-[#56655A] mt-5 max-w-xl mx-auto leading-relaxed">
          An outcome-based practice designed for students and sedentary professionals. No endless video libraries, no performance anxiety. Tell us how your body feels, and take a purposeful reset.
        </p>

        {/* ONE Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleScrollToReset}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1E3527] hover:bg-[#2B4B38] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Your Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAIAssistant}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white border border-[#D5CEC2] hover:border-[#1E3527] text-[#1E3527] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#376145]" />
            <span>Describe symptoms in words</span>
          </button>
        </div>
      </section>

      {/* 2. SOS RESET (Simple, Direct, Decisive) */}
      <section id="sos-reset-section" className="py-12 px-4 sm:px-6 bg-white border-y border-[#E8E1D5]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7C5A42] font-semibold">
              ONE CHOICE · ZERO PARALYSIS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A2E20] mt-1">
              How are you feeling right now?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6E61] mt-1">
              Select your immediate somatic state. We curate the sequence for you.
            </p>
          </div>

          {/* 5 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {MOOD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedMood === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedMood(opt.id)}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#EFF4F0] border-[#1E3527] text-[#1E3527] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E3DCD1] hover:bg-white text-[#455449]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#1E3527] text-white' : 'bg-[#EAE4D9] text-[#2F4E3A]'
                  }`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="font-serif-display font-medium text-sm text-[#182C1F]">
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Row: [ Reset Me ] Button */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleResetMe}
              className="px-8 py-3 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Reset Me ({selectedMood.replace('-', ' ')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-[#718274]">
              {MOOD_OPTIONS.find(m => m.id === selectedMood)?.subtext}
            </p>
          </div>
        </div>
      </section>

      {/* 3. MEANINGFUL FEATURE LAYOUTS (Diverse patterns, not identical cards) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        
        {/* Layout A: Asana Library & 3D Studio (Large Featured Layout) */}
        <section className="bg-white rounded-2xl border border-[#DDD5C7] p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="lg:max-w-md space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#4A6E57] font-semibold">
              3D ASANA STUDIO & REPOSITORY
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A3123] leading-snug">
              Understand the posture before you move.
            </h3>
            <p className="text-xs sm:text-sm text-[#546558] leading-relaxed">
              Explore our searchable library of classical asanas. Inspect skeletal alignment in interactive 3D, learn the Sanskrit etymology, and understand targeted myofascial benefits.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenYogaLibrary}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3527] hover:underline"
              >
                <span>Browse Asana Library & 3D Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD4] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#718274] border-b border-[#E9E4DC] pb-2">
              <span className="font-serif italic font-medium">Balasana (Child's Pose)</span>
              <span className="font-mono text-[10px]">Restorative</span>
            </div>
            <p className="text-xs text-[#526356] leading-relaxed">
              Softens the thoracolumbar fascia, gently decompresses the lumbar spine, and signals the carotid baroreceptors to trigger the vagal brake.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-[#2C573B] font-semibold bg-[#EBF3ED] px-2 py-0.5 rounded">
                Interactive 3D Mannequin Available
              </span>
              <button
                onClick={onOpenYogaLibrary}
                className="text-xs text-[#1E3527] font-semibold"
              >
                View →
              </button>
            </div>
          </div>
        </section>

        {/* Layout B: Cycle Awareness (Horizontal Timeline / Step Progression) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E7E0D3] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#885A3F] font-semibold">
                SOMATIC CYCLES
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-display font-medium text-[#1A2E20]">
                Cycle Awareness: Movement synced to physiological energy
              </h3>
            </div>
            <button
              onClick={onOpenCycleFlows}
              className="text-xs text-[#1E3527] font-medium hover:underline shrink-0"
            >
              Explore Cycle Flows →
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#5A6C5F] max-w-2xl leading-relaxed">
            Your physiological bandwidth fluctuates naturally across the month. Rather than forcing high-intensity exercise when your body requests restoration, adapt your practice to each phase.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              { phase: 'Menstrual', energy: 'Low / Inward', focus: 'Pelvic ease & sacral traction', asanas: 'Balasana, Supta Baddha Konasana' },
              { phase: 'Follicular', energy: 'Rising / Fresh', focus: 'Spinal mobility & gentle flow', asanas: 'Marjaryasana, Gentle Lunges' },
              { phase: 'Ovulation', energy: 'Peak / Vibrant', focus: 'Steadiness & open postures', asanas: 'Vrikshasana, Extended Side Angle' },
              { phase: 'Luteal', energy: 'Winding Down', focus: 'Decompression & nervous calm', asanas: 'Viparita Karani, Forward Folds' }
            ].map((p, idx) => (
              <div key={p.phase} className="p-4 rounded-xl bg-white border border-[#E0D9CD] text-left space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#78887B]">
                  <span className="font-mono">0{idx + 1}</span>
                  <span className="font-medium text-[#86563E]">{p.energy}</span>
                </div>
                <div className="font-serif-display font-medium text-base text-[#1C2F22]">
                  {p.phase} Phase
                </div>
                <p className="text-xs text-[#526356] leading-relaxed pt-1">
                  {p.focus}
                </p>
                <div className="text-[10px] text-[#718274] italic font-serif pt-1">
                  Key: {p.asanas}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Layout C: Deep Dive & Knowledge Hub (Editorial Split Rows) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deep Dive */}
          <div className="p-6 rounded-2xl bg-[#F6F2E9] border border-[#DDD5C5] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#466952] font-semibold">
                EDUCATIONAL PRACTICE
              </span>
              <h4 className="text-xl font-serif-display font-medium text-[#1A2E20]">
                Weekend Deep Dive: 75-Minute Somatic Reset
              </h4>
              <p className="text-xs text-[#56685B] leading-relaxed">
                A structured seven-step inquiry into somatic down-regulation: 01 What is it? 02 Why practice? 03 Step-by-step 04 Breathing 05 Common mistakes 06 Precautions 07 Practice.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={onOpenDeepDive}
                className="px-4 py-2 rounded-lg bg-[#20382B] text-white text-xs font-semibold hover:bg-[#2E4F3D] transition-colors"
              >
                Enter Deep Dive
              </button>
            </div>
          </div>

          {/* Knowledge Hub */}
          <div className="p-6 rounded-2xl bg-white border border-[#E0D8CC] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A5A3C] font-semibold">
                EDITORIAL INQUIRY
              </span>
              <h4 className="text-xl font-serif-display font-medium text-[#1A2E20]">
                The Science of Vagal Toning & Sutra Wisdom
              </h4>
              <p className="text-xs text-[#56685B] leading-relaxed">
                Read essays on how diaphragmatic psoas release triggers parasympathetic tone, and why Patanjali's Ahimsa transforms competitive student burnout.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={onOpenKnowledgeHub}
                className="px-4 py-2 rounded-lg border border-[#20382B] text-[#20382B] text-xs font-semibold hover:bg-[#20382B] hover:text-white transition-colors"
              >
                Read Knowledge Hub
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 4. FOOTER (Quiet, Minimal, Authentic) */}
      <footer className="mt-auto border-t border-[#E8E1D5] bg-[#FAF8F5] py-8 px-4 sm:px-6 text-xs text-[#637568]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#20382B]" />
            <span className="font-serif-display text-sm font-medium text-[#1E3527]">
              FlowState
            </span>
            <span className="text-[#88988D]">· Outcome-based yoga for mind & body</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            <button onClick={onOpenPrenatal} className="hover:text-[#1E3527] transition-colors">
              Prenatal Pathway
            </button>
            <span>·</span>
            <button onClick={onOpenYogaLibrary} className="hover:text-[#1E3527] transition-colors">
              Asana Library
            </button>
            <span>·</span>
            <button onClick={onOpenKnowledgeHub} className="hover:text-[#1E3527] transition-colors">
              Knowledge Hub
            </button>
            <span>·</span>
            <button onClick={onOpenWordPressHub} className="hover:text-[#1E3527] text-[#2C573B] font-medium transition-colors">
              WP & LearnDash Hub
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
