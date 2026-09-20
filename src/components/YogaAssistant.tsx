import React, { useState } from 'react';
import { api } from '../utils/api';
import { AIRoutine, SafetyProfile, Session, User } from '../types';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Clock, 
  Info, 
  Check, 
  AlertCircle,
  HelpCircle,
  Flame,
  Zap,
  BatteryCharging
} from 'lucide-react';

interface YogaAssistantProps {
  onBack: () => void;
  onStartSession: (session: Session) => void;
  safety: SafetyProfile;
  currentUser: User | null;
  onOpenAuth: () => void;
}

const QUICK_CHIPS = [
  { label: 'Tech-Neck & Desk Fatigue', prompt: 'I have intense tech-neck and stiff upper back from sitting at a computer all day.' },
  { label: 'Anxious & Overstimulated', prompt: 'I feel anxious and wired, needing deep vagus nerve down-regulation.' },
  { label: 'Low Back Tightness', prompt: 'My lower back and hips feel compressed and tight after standing/sitting.' },
  { label: 'Postural Realignment', prompt: 'I want to open my chest, decompress my cervical spine, and restore upright posture.' },
  { label: 'Low Energy Rekindle', prompt: 'I am exhausted but want gentle oxygenating flow without exhausting my adrenals.' },
  { label: 'Pelvic & Sacral Ease', prompt: 'I have lower abdominal cramping and sacral tension, need restorative release.' }
];

export const YogaAssistant: React.FC<YogaAssistantProps> = ({
  onBack,
  onStartSession,
  safety,
  currentUser,
  onOpenAuth
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<AIRoutine | null>(null);
  const [filterNotices, setFilterNotices] = useState<string[]>([]);
  const [safetyFlagsApplied, setSafetyFlagsApplied] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.generateAIRoutine(textToUse.trim(), safety);
      setGeneratedRoutine(res.routine);
      setFilterNotices(res.filteredNotices || []);
      setSafetyFlagsApplied(res.safetyFlagsApplied || []);
    } catch (err: any) {
      setError(err.message || 'Could not generate custom routine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    handleGenerate(chipPrompt);
  };

  // Convert the AI routine to FlowState standard Session object to load in SessionPlayer
  const handleLaunchRoutine = () => {
    if (!generatedRoutine) return;

    const totalDurSec = generatedRoutine.poses.reduce((acc, p) => acc + (p.duration || 60), 0);
    const minutes = Math.max(5, Math.ceil(totalDurSec / 60));

    const session: Session = {
      id: `ai-custom-${Date.now()}`,
      title: generatedRoutine.title,
      subtitle: generatedRoutine.focusArea,
      tag: 'AI Curated & Clinically Filtered',
      type: 'sos',
      durationMinutes: minutes,
      poses: generatedRoutine.poses.map((p, idx) => ({
        id: `ai-pose-${idx}`,
        name: p.name,
        sanskritName: p.name,
        duration: p.duration || 60,
        target_zones: ['neck', 'shoulders', 'lower_back'],
        contraindications: [],
        illustration_2d: 'reclined-butterfly',
        anatomicalFocus: p.benefit || generatedRoutine.focusArea,
        alignmentCues: p.visualCue ? [p.visualCue] : ['Breathe smoothly with neutral spine alignment'],
        easierVariation: {
          name: 'Supported Relaxation',
          description: 'Rest comfortably in neutral alignment with pillows under knees or spine'
        },
        category: 'gentle_flow'
      }))
    };

    onStartSession(session);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAF8] text-[#222A26] flex flex-col max-w-2xl mx-auto px-4 py-6 sm:py-8 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4C6052] hover:text-[#1E2A22] hover:bg-[#EAEFEA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to check-in</span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="text-[11px] font-medium text-[#2C573C] bg-[#E3EDE5] px-3 py-1 rounded-full border border-[#D0DFD4]">
              Logged in as {currentUser.name}
            </span>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[11px] font-medium text-[#2C573C] bg-[#E3EDE5] hover:bg-[#D7E6DA] px-3 py-1 rounded-full border border-[#D0DFD4] transition-colors"
            >
              Sign In to Save
            </button>
          )}
        </div>
      </div>

      {/* Screen Title */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#2D5C3E] font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#2D5C3E]" />
          Conversational Routine Assistant
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#18241D] tracking-tight">
          Describe what your body needs today
        </h1>
        <p className="text-xs sm:text-sm text-[#576B5D] mt-1 leading-relaxed">
          For days that don’t fit a single preset mood. Type your physical sensations or time constraints to receive a tailored somatic sequence.
        </p>
      </div>

      {/* Quick Select Chips */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-[#5A7061] uppercase tracking-wider mb-2">
          Quick Inquiries
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip.prompt)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE5DE] hover:border-[#38664A] hover:bg-[#F2F7F3] text-xs font-medium text-[#3A4E40] transition-all disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Persistent Non-Dismissible Safety Line (Prompt requirement) */}
      <div className="p-3 rounded-xl bg-[#FFF6F2] border border-[#F5D8CD] text-xs text-[#823E25] mb-2 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#A84523] shrink-0" />
        <span className="font-medium">
          This is a general wellness suggestion, not medical advice. If you experience sharp, acute pain or dizziness, please stop and consult a healthcare professional.
        </span>
      </div>

      {/* Prompt Input Box */}
      <div className="p-4 rounded-2xl bg-white border border-[#DBE5DD] shadow-2xs mb-6">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I have 15 minutes between calls, my neck is tight, and my stress is through the roof..."
          className="w-full text-xs sm:text-sm text-[#222E26] placeholder-[#889B8E] resize-none focus:outline-hidden"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#EDF3EE] mt-2">
          <div className="text-[10px] text-[#697E70] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E5E3F]" />
            <span>Deterministic safety filter active</span>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="py-2 px-4 rounded-xl bg-[#2D5A3F] hover:bg-[#224831] disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all"
          >
            {loading ? (
              <span>Curating flow...</span>
            ) : (
              <>
                <span>Generate Routine</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#FFF2F0] border border-[#F9D3CE] text-xs text-[#992E22] mb-5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading && (
        <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#DEE7E0] animate-pulse">
          <div className="h-6 w-3/4 bg-[#E8EFEA] rounded-md" />
          <div className="h-4 w-1/2 bg-[#E8EFEA] rounded-md" />
          <div className="space-y-2 pt-3">
            <div className="h-14 bg-[#F2F6F3] rounded-xl" />
            <div className="h-14 bg-[#F2F6F3] rounded-xl" />
            <div className="h-14 bg-[#F2F6F3] rounded-xl" />
          </div>
        </div>
      )}

      {/* Generated Routine Display */}
      {generatedRoutine && !loading && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Safety Filter Notices Banner if modifications occurred */}
          {filterNotices.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#F0F7F2] border border-[#CDE3D3] text-xs text-[#20492F]">
              <div className="font-semibold flex items-center gap-1.5 mb-1 text-[#1D4A2D]">
                <ShieldCheck className="w-4 h-4 text-[#2E6B43]" />
                <span>Deterministic Safety Gate Applied</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#335C41]">
                {filterNotices.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Routine Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#DCE5DE] shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#346645] bg-[#E3EFE6] px-2.5 py-0.5 rounded-md">
                  Custom AI Sequence
                </span>
                <h2 className="text-xl font-serif-display font-medium text-[#18261E] mt-1.5">
                  {generatedRoutine.title}
                </h2>
                <p className="text-xs text-[#526658] mt-1">
                  <strong>Focus Area:</strong> {generatedRoutine.focusArea}
                </p>
                {generatedRoutine.precautions && (
                  <p className="text-[11px] text-[#718577] mt-1 italic">
                    {generatedRoutine.precautions}
                  </p>
                )}
              </div>
            </div>

            {/* Posture List Breakdown */}
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#526758] flex items-center justify-between">
                <span>Sequenced Postures ({generatedRoutine.poses.length})</span>
                <span className="font-mono text-[11px]">
                  ~{Math.ceil(generatedRoutine.poses.reduce((a, b) => a + (b.duration || 60), 0) / 60)} min total
                </span>
              </div>

              {generatedRoutine.poses.map((pose, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#E3ECE5] flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#E5ECE7] text-[#29563A] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[#1C2921]">
                        {pose.name}
                      </div>
                      {pose.visualCue && (
                        <div className="text-[11px] text-[#55695B] mt-0.5 leading-snug">
                          {pose.visualCue}
                        </div>
                      )}
                      {pose.benefit && (
                        <div className="text-[10px] text-[#2A5C3C] font-medium mt-1">
                          ✦ {pose.benefit}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium text-[#3A6B4B] bg-[#EEF5F0] px-2 py-0.5 rounded-md shrink-0">
                    {pose.duration}s
                  </span>
                </div>
              ))}
            </div>

            {/* Launch into existing SessionPlayer */}
            <div className="mt-6 pt-4 border-t border-[#E8EFEA]">
              <button
                id="btn-start-ai-routine"
                onClick={handleLaunchRoutine}
                className="w-full py-3.5 px-5 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start This Routine in Session Player</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
