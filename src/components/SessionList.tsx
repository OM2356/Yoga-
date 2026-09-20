import React, { useState } from 'react';
import { Pose, SafetyProfile, Session } from '../types';
import { PoseIllustration } from './PoseIllustration';
import { PoseSwapDrawer } from './PoseSwapDrawer';
import { 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  Play, 
  Clock, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

interface SessionListProps {
  session: Session;
  onStartSession: (session: Session) => void;
  onBack: () => void;
  safety: SafetyProfile;
  onUpdateSessionPoses?: (poses: Pose[]) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  session,
  onStartSession,
  onBack,
  safety,
  onUpdateSessionPoses
}) => {
  const [poses, setPoses] = useState<Pose[]>(session.poses);
  const [swappingPoseIndex, setSwappingPoseIndex] = useState<number | null>(null);

  // Update poses and propagate if needed
  const updatePoses = (newPoses: Pose[]) => {
    setPoses(newPoses);
    if (onUpdateSessionPoses) {
      onUpdateSessionPoses(newPoses);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPoses = [...poses];
    const temp = newPoses[index];
    newPoses[index] = newPoses[index - 1];
    newPoses[index - 1] = temp;
    updatePoses(newPoses);
  };

  const handleMoveDown = (index: number) => {
    if (index === poses.length - 1) return;
    const newPoses = [...poses];
    const temp = newPoses[index];
    newPoses[index] = newPoses[index + 1];
    newPoses[index + 1] = temp;
    updatePoses(newPoses);
  };

  const handleSwapSelect = (newPose: Pose) => {
    if (swappingPoseIndex === null) return;
    const newPoses = [...poses];
    newPoses[swappingPoseIndex] = newPose;
    updatePoses(newPoses);
    setSwappingPoseIndex(null);
  };

  const totalSeconds = poses.reduce((acc, p) => acc + p.duration, 0);
  const totalMinutes = Math.ceil(totalSeconds / 60);

  const activeSessionWithPoses: Session = {
    ...session,
    durationMinutes: totalMinutes,
    poses
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9F6] text-[#242A27] flex flex-col justify-between max-w-xl mx-auto pb-28 pt-4 px-4 sm:px-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4D5E53] hover:text-[#1F2622] hover:bg-[#EAEFEA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-[#355E44] bg-[#E3EFE6] px-3 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              {session.durationMinutes}-Minute {session.type === 'sos' ? 'SOS Reset' : 'Targeted Routine'}
            </span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-2xl font-serif-display font-medium text-[#1C2620]">
            {session.title}
          </h1>
          {session.subtitle && (
            <p className="text-xs sm:text-sm text-[#5C6E61] mt-1 leading-relaxed">
              {session.subtitle}
            </p>
          )}

          {/* Frictionless indicator */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#47604F] bg-[#EEF4EF] px-2.5 py-0.5 rounded-md border border-[#E0EBE2]">
              <ShieldCheck className="w-3 h-3 text-[#2E6845]" />
              Audio-guided cues · Camera optional
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#55695C] bg-[#F1F4F1] px-2.5 py-0.5 rounded-md border border-[#E3ECE4]">
              {poses.length} poses sequenced
            </span>
          </div>
        </div>

        {/* Poses List (reusing exercise-list reference layout) */}
        <div className="space-y-2.5 mt-4">
          {poses.map((pose, index) => (
            <div
              key={`${pose.id}-${index}`}
              id={`pose-row-${pose.id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF] border border-[#E1E8E2] shadow-2xs hover:border-[#CBD8CE] transition-all"
            >
              {/* Left: Pose Illustration Thumbnail */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <PoseIllustration poseId={pose.id} size="sm" />
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#3B6A4E] text-white text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Center: Name and Duration */}
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#1F2B23] truncate">
                    {pose.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7B70] mt-0.5">
                    <span className="font-mono text-[#3B6A4E] font-medium">
                      {formatDuration(pose.duration)}
                    </span>
                    <span>·</span>
                    <span className="italic truncate">{pose.sanskritName}</span>
                  </div>
                  {/* Subtle target tag */}
                  <div className="flex gap-1 mt-1">
                    {pose.target_zones.slice(0, 2).map((z) => (
                      <span
                        key={z}
                        className="text-[10px] text-[#56705F] bg-[#F0F5F1] px-1.5 py-0.2 rounded"
                      >
                        {z.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Reorder handle + Swap icon */}
              <div className="flex items-center gap-1 ml-2">
                {/* Reorder Buttons */}
                <div className="flex flex-col">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-[#EEF4EF] transition-colors ${
                      index === 0 ? 'text-[#D1DCD3] cursor-not-allowed' : 'text-[#5C7162]'
                    }`}
                    title="Move up"
                    aria-label={`Move ${pose.name} up`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === poses.length - 1}
                    className={`p-1 rounded hover:bg-[#EEF4EF] transition-colors ${
                      index === poses.length - 1
                        ? 'text-[#D1DCD3] cursor-not-allowed'
                        : 'text-[#5C7162]'
                    }`}
                    title="Move down"
                    aria-label={`Move ${pose.name} down`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Swap Button */}
                <button
                  onClick={() => setSwappingPoseIndex(index)}
                  className="p-2 rounded-lg text-[#4E6856] hover:bg-[#EEF4EF] hover:text-[#28573A] transition-colors"
                  title="Swap with alternative or easier pose"
                  aria-label={`Swap ${pose.name}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empathetic note */}
        <div className="mt-4 p-3 rounded-xl bg-[#F0F5F1] border border-[#E0EBE2] flex items-start gap-2.5 text-xs text-[#526658]">
          <Info className="w-4 h-4 text-[#356144] shrink-0 mt-0.5" />
          <span>
            During playback you can skip any pose or tap <strong>“Show easier variation”</strong> at any time. Zero streak penalty, zero guilt.
          </span>
        </div>
      </div>

      {/* Pinned Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF7F2]/95 backdrop-blur-xs border-t border-[#E8E1D5] z-30 flex justify-center">
        <div className="w-full max-w-xl">
          <button
            id="btn-start-guided-session"
            onClick={() => onStartSession(activeSessionWithPoses)}
            className="w-full py-3.5 px-6 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start {totalMinutes}-Minute Reset</span>
          </button>
        </div>
      </div>

      {/* Swap Drawer Modal */}
      {swappingPoseIndex !== null && (
        <PoseSwapDrawer
          currentPose={poses[swappingPoseIndex]}
          isOpen={swappingPoseIndex !== null}
          onClose={() => setSwappingPoseIndex(null)}
          onSelectSwap={handleSwapSelect}
          safety={safety}
        />
      )}
    </div>
  );
};
