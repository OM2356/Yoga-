import React from 'react';
import { Pose, SafetyProfile } from '../types';
import { POSE_DATABASE } from '../data/poses';
import { filterSafePoses } from '../data/curations';
import { X, RefreshCw, Check } from 'lucide-react';
import { PoseIllustration } from './PoseIllustration';

interface PoseSwapDrawerProps {
  currentPose: Pose;
  isOpen: boolean;
  onClose: () => void;
  onSelectSwap: (newPose: Pose) => void;
  safety: SafetyProfile;
}

export const PoseSwapDrawer: React.FC<PoseSwapDrawerProps> = ({
  currentPose,
  isOpen,
  onClose,
  onSelectSwap,
  safety
}) => {
  if (!isOpen) return null;

  const safePool = filterSafePoses(POSE_DATABASE, safety);

  // Recommendations: poses sharing same target zones or gentle alternatives
  const recommendations = safePool
    .filter((p) => p.id !== currentPose.id)
    .sort((a, b) => {
      const aCommon = a.target_zones.filter((z) => currentPose.target_zones.includes(z)).length;
      const bCommon = b.target_zones.filter((z) => currentPose.target_zones.includes(z)).length;
      return bCommon - aCommon;
    })
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-t-2xl sm:rounded-2xl border border-[#DCE4DE] shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E3ECE5] flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E5ECE7] flex items-center justify-center text-[#2A573C]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-[#1C2620]">Swap Pose</h3>
              <p className="text-xs text-[#5D6F63]">
                Replacing: <span className="font-semibold text-[#273B2E]">{currentPose.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#55675A] hover:bg-[#EAEFEA]"
            aria-label="Close swap modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Easier direct variation highlighted */}
        <div className="p-4 bg-[#F0F5F1] border-b border-[#E0EAE2]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#356144] mb-1">
            Built-in Easier Variation
          </div>
          <div className="text-sm font-medium text-[#1A2E20]">
            {currentPose.easierVariation.name}
          </div>
          <p className="text-xs text-[#526658] mt-1 leading-relaxed">
            {currentPose.easierVariation.description}
          </p>
        </div>

        {/* Alternative Poses List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-xs font-semibold text-[#5A6E60] uppercase tracking-wider mb-2">
            Targeted Alternatives ({recommendations.length})
          </div>

          {recommendations.map((pose) => (
            <div
              key={pose.id}
              onClick={() => {
                onSelectSwap(pose);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#E3ECE5] hover:border-[#4B795B] hover:bg-[#F4F8F5] cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <PoseIllustration poseId={pose.id} size="sm" />
                <div>
                  <div className="font-medium text-sm text-[#1F2B23] group-hover:text-[#214E34]">
                    {pose.name}
                  </div>
                  <div className="text-xs text-[#6B7C70] italic">
                    {pose.sanskritName} · {Math.floor(pose.duration / 60)}:{(pose.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {pose.target_zones.slice(0, 2).map((z) => (
                      <span
                        key={z}
                        className="text-[10px] bg-[#E5ECE7] text-[#3E5C49] px-1.5 py-0.5 rounded-md"
                      >
                        {z.replace('_', ' ')}
                      </span>
                    ))}
                    {pose.noMatRequired && (
                      <span className="text-[10px] bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded-md">
                        Desk friendly
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button className="px-3 py-1.5 text-xs font-medium text-[#2E5E41] bg-[#E8F0EA] group-hover:bg-[#2E5E41] group-hover:text-white rounded-lg transition-colors flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
