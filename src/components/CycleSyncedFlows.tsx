import React, { useState } from 'react';
import { CyclePhaseId, SafetyProfile, Session } from '../types';
import { getCycleSyncedSession } from '../data/curations';
import { SessionList } from './SessionList';
import { ArrowLeft, Calendar, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface CycleSyncedFlowsProps {
  onStartSession: (session: Session) => void;
  onBack: () => void;
  safety: SafetyProfile;
}

interface PhaseDetail {
  id: CyclePhaseId;
  name: string;
  days: string;
  movement: string;
  energy: string;
  suggestedPractices: string;
  thingsToConsider: string;
}

const PHASE_DETAILS: PhaseDetail[] = [
  {
    id: 'menstrual',
    name: 'Menstrual Phase',
    days: 'Days 1–5',
    movement: 'Passive pelvic floor decompression, gentle sacral traction, supine postures with supported props.',
    energy: 'Inward & Restorative — Physiological energy is naturally reserved for uterine shedding.',
    suggestedPractices: 'Balasana (Child’s Pose), Supta Baddha Konasana with bolster, gentle diaphragmatic pacing.',
    thingsToConsider: 'Avoid intense core contractions, deep closed twists, and full inversions which impede downward apana vayu.'
  },
  {
    id: 'follicular',
    name: 'Follicular Phase',
    days: 'Days 6–13',
    movement: 'Progressive spinal articulation, kinetic mobility, gentle standing flows and lunges.',
    energy: 'Rising & Expansive — Estrogen ascends, improving ligament elasticity and cognitive stamina.',
    suggestedPractices: 'Cat-Cow spinal waves, Low Lunge hip-flexor release, Gentle Sun Salutation variations.',
    thingsToConsider: 'An ideal window to build joint mobility and re-establish regular practice rhythm.'
  },
  {
    id: 'ovulation',
    name: 'Ovulation Phase',
    days: 'Days 14–17',
    movement: 'Rooted balance, supported chest expansion, open hip stability without over-flexibility.',
    energy: 'Peak Vitality — Testosterone and estrogen peak; steady endurance and mental confidence.',
    suggestedPractices: 'Vrikshasana (Tree Pose), Warrior II grounding, gentle heart-opening camel variations.',
    thingsToConsider: 'High estrogen can increase joint laxity; avoid over-stretching past comfortable anatomical boundaries.'
  },
  {
    id: 'luteal',
    name: 'Luteal Phase',
    days: 'Days 18–28',
    movement: 'Slow isometric holds, deep piriformis/glute release, and central nervous down-regulation.',
    energy: 'Winding Down — Progesterone dominance invites warmth, steady ground contact, and lowered stimulation.',
    suggestedPractices: 'Viparita Karani (Legs Up the Wall), Reclined Pigeon, restorative side-lying savasana.',
    thingsToConsider: 'If PMS irritability, headaches, or fluid retention arise, prioritize extended exhalations over physical exertion.'
  }
];

export const CycleSyncedFlows: React.FC<CycleSyncedFlowsProps> = ({
  onStartSession,
  onBack,
  safety
}) => {
  const [activePhase, setActivePhase] = useState<CyclePhaseId>('menstrual');
  const [cycleDay, setCycleDay] = useState<number | ''>('');

  const handleCycleDayChange = (val: number) => {
    setCycleDay(val);
    if (val >= 1 && val <= 5) {
      setActivePhase('menstrual');
    } else if (val >= 6 && val <= 13) {
      setActivePhase('follicular');
    } else if (val >= 14 && val <= 17) {
      setActivePhase('ovulation');
    } else if (val >= 18 && val <= 35) {
      setActivePhase('luteal');
    }
  };

  const currentDetail = PHASE_DETAILS.find((p) => p.id === activePhase) || PHASE_DETAILS[0];
  const currentSession = getCycleSyncedSession(activePhase, safety);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#242724] flex flex-col max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#506355] hover:text-[#1E3325] hover:bg-[#EFEAE2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-mono font-semibold tracking-wider text-[#85533A] uppercase bg-[#FAF0EB] px-3 py-1 rounded-md border border-[#ECD8CE]">
          Hormonal Awareness
        </span>
      </div>

      <div className="border-b border-[#E8E1D5] pb-5 mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A2E20]">
          Movement Synced to Biological Rhythm
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6E61] mt-1 leading-relaxed">
          Your endocrine system naturally alternates between restoration, mobility, vitality, and grounding. Adapt your yoga practice to respect each phase.
        </p>

        {/* Day Logger */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white border border-[#DDD6CB] text-xs">
          <div className="flex items-center gap-2 text-[#4A5D50]">
            <Calendar className="w-3.5 h-3.5 text-[#85533A]" />
            <span>Optional: Enter current cycle day for auto-alignment:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="35"
              placeholder="Day"
              value={cycleDay}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num)) {
                  handleCycleDayChange(num);
                } else {
                  setCycleDay('');
                }
              }}
              className="w-14 px-2 py-1 text-xs border border-[#CCD5CE] rounded-lg text-center bg-[#FAF8F5] focus:outline-hidden focus:border-[#20382B]"
            />
            {cycleDay && (
              <span className="text-[11px] text-[#85533A] font-medium">
                → {currentDetail.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Phase Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {PHASE_DETAILS.map((p, idx) => {
          const active = activePhase === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-white border-[#20382B] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E3DDD2] hover:bg-white text-[#4A5A4E]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-[#85533A] font-semibold">
                <span>0{idx + 1}</span>
                <span>{p.days}</span>
              </div>
              <div className={`text-xs font-semibold mt-1 ${active ? 'text-[#192E21]' : 'text-[#4A5D50]'}`}>
                {p.name.replace(' Phase', '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Structured Phase Details (Movement, Energy, Suggested, Considerations) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DCD5C8] shadow-xs space-y-4 mb-6">
        <div className="flex items-center justify-between border-b border-[#EFECE5] pb-3">
          <h2 className="text-xl font-serif-display font-medium text-[#1A2E20]">
            {currentDetail.name} ({currentDetail.days})
          </h2>
          <span className="text-xs font-mono text-[#85533A] bg-[#FAF0EB] px-2 py-0.5 rounded font-medium">
            {currentDetail.energy.split('—')[0].trim()}
          </span>
        </div>

        {/* 1. Energy */}
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#667A6B]">
            Biological Energy State
          </div>
          <p className="text-xs text-[#3C4A40] leading-relaxed">
            {currentDetail.energy}
          </p>
        </div>

        {/* 2. Movement Focus */}
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#667A6B]">
            Recommended Movement
          </div>
          <p className="text-xs text-[#3C4A40] leading-relaxed">
            {currentDetail.movement}
          </p>
        </div>

        {/* 3. Suggested Practices */}
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#667A6B]">
            Suggested Classical Practices
          </div>
          <p className="text-xs text-[#3C4A40] leading-relaxed font-serif italic">
            {currentDetail.suggestedPractices}
          </p>
        </div>

        {/* 4. Things to Consider */}
        <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E7DFD2] space-y-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#85533A] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Things to Consider</span>
          </div>
          <p className="text-xs text-[#526356] leading-relaxed">
            {currentDetail.thingsToConsider}
          </p>
        </div>
      </div>

      {/* Suggested Curated Practice */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#54685A] mb-3">
          Curated Flow for this Phase ({currentSession.durationMinutes} Min)
        </h3>
        <SessionList
          session={currentSession}
          onStartSession={onStartSession}
          onBack={onBack}
          safety={safety}
        />
      </div>
    </div>
  );
};
