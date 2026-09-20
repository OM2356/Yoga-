import React, { useState } from 'react';
import { Pose, SafetyProfile, Session, TrimesterStageId } from '../types';
import { getPrenatalSession } from '../data/curations';
import { SessionList } from './SessionList';
import { ArrowLeft, ShieldAlert, Heart, Flower2, Sparkles, Baby } from 'lucide-react';

interface PrenatalPathwayProps {
  onStartSession: (session: Session) => void;
  onBack: () => void;
  safety: SafetyProfile;
}

const STAGES: {
  id: TrimesterStageId;
  label: string;
  weeks: string;
  focus: string;
  contraindicatedSummary: string;
}[] = [
  {
    id: 'first',
    label: '1st Trimester',
    weeks: 'Weeks 1–13',
    focus: 'Cellular rooting & fatigue relief',
    contraindicatedSummary: 'Overheating & deep core work removed'
  },
  {
    id: 'second',
    label: '2nd Trimester',
    weeks: 'Weeks 14–27',
    focus: 'Pelvic symmetry & spine opening',
    contraindicatedSummary: 'Deep asymmetrical lunges removed (SI joint protection)'
  },
  {
    id: 'third',
    label: '3rd Trimester',
    weeks: 'Weeks 28–40+',
    focus: 'Space creation & pelvic release',
    contraindicatedSummary: 'Prolonged supine poses removed (vena cava safety)'
  },
  {
    id: 'postpartum',
    label: 'Postpartum',
    weeks: '4th Trimester+',
    focus: 'Transverse core & diastasis recti care',
    contraindicatedSummary: 'Crunches & boat pose removed; transverse rebuild'
  }
];

export const PrenatalPathway: React.FC<PrenatalPathwayProps> = ({
  onStartSession,
  onBack,
  safety
}) => {
  const [activeStage, setActiveStage] = useState<TrimesterStageId>('second');

  const currentSession = getPrenatalSession(activeStage, safety);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F4] text-[#2D2622] flex flex-col max-w-xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#645248] hover:text-[#2B1F19] hover:bg-[#EFE9E3] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to check-in</span>
        </button>

        <span className="text-xs font-semibold tracking-wider text-[#A25C43] uppercase bg-[#F8EAE4] px-3 py-1 rounded-full border border-[#EACFC4]">
          Specialized Pathway
        </span>
      </div>

      {/* Persistent Non-Dismissible Safety Note Banner */}
      <div className="p-3.5 rounded-xl bg-[#FFF5F0] border border-[#F4D1C3] text-xs text-[#7A3F28] mb-4 flex items-start gap-2.5 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-[#B85734] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-[#8B3B1C]">Clinical Safety Guideline:</strong> FlowState prenatal sequences are curated specifically around physiological changes (relaxin ligament laxity, vena cava hemodynamics, and diastasis recti preservation). This is a somatic support tool, not a replacement for your OB-GYN or midwife care.
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#291F1A]">
          Prenatal & Postpartum Sanctuary
        </h1>
        <p className="text-xs sm:text-sm text-[#66554D] mt-1 leading-relaxed">
          Select your current stage. Contraindicated postures are automatically filtered out so you never have to guess what is safe.
        </p>
      </div>

      {/* 4 Stage Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {STAGES.map((s) => {
          const active = activeStage === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                active
                  ? 'bg-[#FFFFFF] border-[#B86B50] shadow-xs ring-1 ring-[#B86B50]/20'
                  : 'bg-[#F3ECE5] border-[#E5DAD0] text-[#5C4D44] hover:bg-[#EAE1D7]'
              }`}
            >
              <div>
                <div className={`text-xs font-semibold ${active ? 'text-[#87412A]' : 'text-[#4A3D36]'}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-[#7A6960] mt-0.5">
                  {s.weeks}
                </div>
              </div>

              <div className={`text-[10px] mt-2 font-medium ${active ? 'text-[#A04E34]' : 'text-[#6C5B52]'}`}>
                {s.focus.split('&')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Safeguards Box */}
      <div className="p-3 rounded-xl bg-[#F8ECE5] border border-[#E9D5CA] text-xs text-[#6B4636] mb-3">
        <span className="font-semibold text-[#8E4429]">
          Active Stage Filter ({STAGES.find((s) => s.id === activeStage)?.label}):
        </span>{' '}
        {STAGES.find((s) => s.id === activeStage)?.contraindicatedSummary}.
      </div>

      {/* Session List Component */}
      <div className="flex-1">
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
