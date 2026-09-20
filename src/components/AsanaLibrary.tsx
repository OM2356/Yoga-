import React, { useState, useMemo } from 'react';
import { POSE_DATABASE } from '../data/poses';
import { Pose, SafetyProfile, Session } from '../types';
import { AsanaStudio3D } from './AsanaStudio3D';
import { 
  Search, 
  Sparkles, 
  Play, 
  ShieldAlert, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  ArrowRight,
  Filter
} from 'lucide-react';

interface AsanaLibraryProps {
  onStartSession: (session: Session) => void;
  safety: SafetyProfile;
  onBackToHome: () => void;
}

export const AsanaLibrary: React.FC<AsanaLibraryProps> = ({
  onStartSession,
  safety,
  onBackToHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activePoseId, setActivePoseId] = useState<string>(POSE_DATABASE[0]?.id || 'childs-pose');

  // Filtered poses from real database
  const filteredPoses = useMemo(() => {
    return POSE_DATABASE.filter((pose) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        pose.name.toLowerCase().includes(q) ||
        pose.sanskritName.toLowerCase().includes(q) ||
        pose.anatomicalFocus.toLowerCase().includes(q) ||
        pose.target_zones.some(z => z.toLowerCase().includes(q))
      );

      const matchesCat = selectedCategory === 'all' || pose.category === selectedCategory;
      const matchesZone = selectedZone === 'all' || pose.target_zones.includes(selectedZone as any);

      return matchesSearch && matchesCat && matchesZone;
    });
  }, [searchQuery, selectedCategory, selectedZone]);

  const activePose = useMemo(() => {
    return POSE_DATABASE.find(p => p.id === activePoseId) || filteredPoses[0] || POSE_DATABASE[0];
  }, [activePoseId, filteredPoses]);

  // Launch a focused practice around this asana
  const handleStartPosePractice = (pose: Pose) => {
    const session: Session = {
      id: `practice-${pose.id}-${Date.now()}`,
      title: `${pose.name} Alignment Practice`,
      subtitle: `Sanskrit: ${pose.sanskritName}`,
      type: 'sos',
      durationMinutes: Math.max(5, Math.ceil((pose.duration * 3) / 60)),
      poses: [pose]
    };
    onStartSession(session);
  };

  // Derive difficulty from duration & category
  const getDifficulty = (pose: Pose) => {
    if (pose.category === 'restorative' || pose.noMatRequired) return 'Gentle / Accessible';
    if (pose.category === 'release') return 'Mild / Therapeutic';
    return 'Moderate / Focused';
  };

  // Check if pose has any active contraindications for user
  const hasSafetyWarning = useMemo(() => {
    if (!activePose || !safety.completed) return false;
    if (safety.highBloodPressure && activePose.contraindications.includes('high_bp')) return true;
    if (safety.pregnantOrPostpartum && (
      activePose.contraindications.includes('deep_twist') || 
      activePose.contraindications.includes('intense_core') ||
      activePose.contraindications.includes('supine_late')
    )) return true;
    return false;
  }, [activePose, safety]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#242724] px-4 sm:px-6 py-8 sm:py-10 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="mb-8 border-b border-[#E8E2D8] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#547360] font-semibold">
              AUTHENTIC REPOSITORY · {POSE_DATABASE.length} ASANAS RECORDED
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-medium text-[#1C3224] tracking-tight mt-1">
              Asana Library & 3D Alignment Studio
            </h1>
            <p className="text-sm text-[#5D6B60] mt-1.5 max-w-xl">
              Grounded anatomical study of classical yoga postures. Inspect skeletal planes, contraindications, and targeted myofascial benefits before practicing.
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="self-start sm:self-auto text-xs text-[#526356] hover:text-[#1E3326] underline transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7A8A7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English name, Balasana, neck, hips..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DCD6CA] text-xs text-[#242724] placeholder-[#8A988D] focus:outline-hidden focus:border-[#20382B] transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-[#718274] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'restorative', label: 'Restorative' },
              { id: 'release', label: 'Release' },
              { id: 'grounding', label: 'Grounding' },
              { id: 'breath', label: 'Pranayama' },
              { id: 'gentle_flow', label: 'Flow' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#1F382B] text-white font-medium'
                    : 'bg-[#EFECE5] text-[#556358] hover:bg-[#E4DFD6]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left List + Right Detailed 3D Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Asana Browser List (4 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#697A6D] mb-1 px-1">
            Showing {filteredPoses.length} Asanas
          </div>

          {filteredPoses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#DCD6CB]">
              <p className="text-xs text-[#637266]">No postures found matching “{searchQuery}”.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedZone('all'); }}
                className="text-xs text-[#20382B] font-medium underline mt-2"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredPoses.map((p) => {
              const isSelected = p.id === activePose.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePoseId(p.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#20382B] shadow-sm ring-1 ring-[#20382B]/10'
                      : 'bg-[#FAF8F5] border-[#E2DDD3] hover:border-[#BFB8AA] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-serif-display font-medium text-base text-[#192E21]">
                        {p.name}
                      </div>
                      <div className="text-xs italic text-[#725C47] font-serif">
                        {p.sanskritName}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#EBE7DF] text-[#556358] shrink-0">
                      {p.duration}s
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A695E] line-clamp-2 mt-1.5 leading-relaxed">
                    {p.anatomicalFocus}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-[10px]">
                    <span className="bg-[#EAE5DC] text-[#47574B] px-2 py-0.5 rounded-md capitalize">
                      {p.category.replace('_', ' ')}
                    </span>
                    {p.noMatRequired && (
                      <span className="bg-[#E6EFE8] text-[#2D5A3F] px-2 py-0.5 rounded-md font-medium">
                        Chair / No Mat
                      </span>
                    )}
                    <span className="text-[#88998C] ml-auto">
                      {p.target_zones.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: 3D Asana Studio & Deep Dive Guide (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE4DD] p-5 sm:p-6 shadow-xs space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFEBE3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E8EFEA] text-[#295639] font-medium">
                  {getDifficulty(activePose)}
                </span>
                <span className="text-xs text-[#7A8A7D]">·</span>
                <span className="text-xs text-[#6A7B6D]">{activePose.duration} Seconds Hold</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A3123] mt-1">
                {activePose.name}
              </h2>
              <div className="text-sm italic font-serif text-[#785E48]">
                {activePose.sanskritName}
              </div>
            </div>

            <button
              onClick={() => handleStartPosePractice(activePose)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Practice</span>
            </button>
          </div>

          {/* 3D Visualization Studio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4E6253]">
                3D Anatomical Alignment Model
              </span>
              <span className="text-[10px] text-[#788B7D]">Drag to inspect skeletal planes</span>
            </div>
            <AsanaStudio3D pose={activePose} />
          </div>

          {/* Safety Alert (if contraindicated) */}
          {hasSafetyWarning && (
            <div className="p-3.5 rounded-xl bg-[#FBF2EE] border border-[#ECD1C5] flex items-start gap-3 text-xs text-[#8A4630]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B84E33] mt-0.5" />
              <div>
                <span className="font-semibold">Safety Profile Flag: </span>
                This pose involves deep spinal articulation or inversions flagged in your health check-in. Consider the easier modification below.
              </div>
            </div>
          )}

          {/* Step-by-Step Alignment Cues */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#43594A] mb-2.5">
              How to Perform
            </h3>
            <div className="space-y-2">
              {activePose.alignmentCues.map((cue, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#2D3830] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#EAE5DC] text-[#243B2C] text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anatomical Benefits & Breathing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EDE8E0]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#43594A] mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A573A]" />
                <span>Anatomical Focus</span>
              </h3>
              <p className="text-xs text-[#4F6053] leading-relaxed">
                {activePose.anatomicalFocus}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#43594A] mb-1.5 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#426F82]" />
                <span>Breathing Cadence</span>
              </h3>
              <p className="text-xs text-[#4F6053] leading-relaxed">
                Smooth diaphragmatic pacing: 4 counts inhale through the nose, 4 counts extended exhalation to down-regulate the sympathetic nervous system.
              </p>
            </div>
          </div>

          {/* Easier Variation / Modification */}
          <div className="p-3.5 rounded-xl bg-[#F6F4EE] border border-[#E4DDCF]">
            <div className="text-xs font-semibold text-[#1F3526]">
              Modification: {activePose.easierVariation.name}
            </div>
            <p className="text-xs text-[#556357] mt-1 leading-relaxed">
              {activePose.easierVariation.description}
            </p>
          </div>

          {/* Common Mistakes & Contraindications */}
          <div className="pt-2 text-xs text-[#6A786E] space-y-1">
            <span className="font-semibold text-[#2D3D32]">Contraindications: </span>
            <span>
              {activePose.contraindications.length > 0
                ? activePose.contraindications.map(c => c.replace('_', ' ')).join(', ')
                : 'Generally accessible to all body archetypes with proper props.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
