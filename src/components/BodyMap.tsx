import React from 'react';
import { BodyZoneId } from '../types';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

interface BodyMapProps {
  selectedZones: BodyZoneId[];
  onToggleZone: (zone: BodyZoneId) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const ZONE_DEFINITIONS: {
  id: BodyZoneId;
  label: string;
  sublabel: string;
  cx: number;
  cy: number;
  r: number;
  rx?: number;
  ry?: number;
}[] = [
  { id: 'neck', label: 'Neck & Cervical Spine', sublabel: 'Tech-neck, occipital tension', cx: 160, cy: 95, r: 16 },
  { id: 'shoulders', label: 'Shoulders & Trapezius', sublabel: 'Rounded posture, shoulder tight', cx: 160, cy: 128, r: 24, rx: 55, ry: 16 },
  { id: 'upper_back', label: 'Upper Back & Thoracic', sublabel: 'Scapular knots, shallow breathing', cx: 160, cy: 175, r: 22, rx: 36, ry: 20 },
  { id: 'lower_back', label: 'Lower Back & Lumbar', sublabel: 'Chair compression, SI joint ache', cx: 160, cy: 232, r: 24, rx: 34, ry: 18 },
  { id: 'hips', label: 'Hips & Pelvic Girdle', sublabel: 'Shortened hip flexors, tightness', cx: 160, cy: 280, r: 26, rx: 42, ry: 20 },
  { id: 'legs', label: 'Legs & Hamstrings', sublabel: 'Hamstring shortening, leg fatigue', cx: 160, cy: 375, r: 36, rx: 36, ry: 60 }
];

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedZones,
  onToggleZone,
  onSubmit,
  onBack
}) => {
  const isSelected = (id: BodyZoneId) => selectedZones.includes(id);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F7F9F6] text-[#242A27] px-4 py-6 md:py-10 max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium text-[#4A554E] hover:text-[#1F2622] hover:bg-[#EAEFEA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to check-in</span>
        </button>

        <span className="text-xs font-semibold tracking-wider text-[#688270] uppercase bg-[#E8EFE9] px-3 py-1 rounded-full">
          Pain Point Targeting
        </span>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1E2520] tracking-tight">
          Where does your body feel tight or sore?
        </h1>
        <p className="text-[#556359] text-sm sm:text-base mt-1.5 max-w-md mx-auto">
          Tap one or more tension zones on the silhouette. FlowState will automatically filter poses for immediate myofascial relief.
        </p>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
        {/* Silhouette Column */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-[#FFFFFF] rounded-2xl border border-[#E3ECE5] shadow-xs relative">
          <div className="w-full max-w-[280px] sm:max-w-[310px] aspect-[320/490] relative select-none">
            <svg
              viewBox="0 0 320 490"
              className="w-full h-full drop-shadow-xs"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E6ECE7" />
                  <stop offset="100%" stopColor="#D9E3DA" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Minimalist Human Silhouette Path */}
              <g fill="url(#bodyGradient)" stroke="#BDCDBD" strokeWidth="1.5">
                {/* Head */}
                <circle cx="160" cy="52" r="24" />
                {/* Neck */}
                <path d="M152 74 H168 V96 H152 Z" />
                {/* Torso & Shoulders */}
                <path d="M152 96 C135 96 112 108 104 128 C100 138 98 160 96 195 C95 210 98 245 106 270 C112 288 128 300 142 305 L146 312 H174 L178 305 C192 300 208 288 214 270 C222 245 225 210 224 195 C222 160 220 138 216 128 C208 108 185 96 168 96 Z" />
                {/* Arms */}
                <path d="M102 130 C90 148 78 190 74 235 C72 260 70 280 68 295 C66 304 74 310 82 306 C86 295 90 270 94 240 C98 200 102 168 108 145 Z" />
                <path d="M218 130 C230 148 242 190 246 235 C248 260 250 280 252 295 C254 304 246 310 238 306 C234 295 230 270 226 240 C222 200 218 168 212 145 Z" />
                {/* Left Leg */}
                <path d="M128 304 C128 340 126 380 128 420 C129 445 126 465 124 478 C123 483 130 486 138 486 C144 486 148 480 149 468 C153 430 156 380 156 312 Z" />
                {/* Right Leg */}
                <path d="M192 304 C192 340 194 380 192 420 C191 445 194 465 196 478 C197 483 190 486 182 486 C176 486 172 480 171 468 C167 430 164 380 164 312 Z" />
              </g>

              {/* Anatomical spinal alignment reference line */}
              <path
                d="M160 92 V265"
                stroke="#A7BAAC"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Interactive Zone Hotspots */}
              {ZONE_DEFINITIONS.map((zone) => {
                const active = isSelected(zone.id);
                return (
                  <g
                    key={zone.id}
                    onClick={() => onToggleZone(zone.id)}
                    className="cursor-pointer transition-all duration-300"
                    id={`hotspot-${zone.id}`}
                  >
                    {/* Pulsing ring when active */}
                    {active && (
                      <ellipse
                        cx={zone.cx}
                        cy={zone.cy}
                        rx={(zone.rx || zone.r) + 8}
                        ry={(zone.ry || zone.r) + 6}
                        fill="#548265"
                        fillOpacity="0.25"
                        filter="url(#glowFilter)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Zone base target ellipse */}
                    <ellipse
                      cx={zone.cx}
                      cy={zone.cy}
                      rx={zone.rx || zone.r}
                      ry={zone.ry || zone.r}
                      fill={active ? '#3B6A4E' : '#FFFFFF'}
                      fillOpacity={active ? '0.85' : '0.4'}
                      stroke={active ? '#1D412C' : '#657E6B'}
                      strokeWidth={active ? '2.5' : '1.5'}
                      strokeDasharray={active ? undefined : '3 2'}
                      className="transition-colors hover:fill-opacity-60"
                    />

                    {/* Center icon / dot */}
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={active ? 5 : 3.5}
                      fill={active ? '#FFFFFF' : '#4C6955'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 text-xs text-[#6B7970] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3B6A4E] inline-block"></span>
            Tap body areas to add to your personalized sequence
          </div>
        </div>

        {/* Selection List Column */}
        <div className="md:col-span-6 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#5A6E60] mb-1">
              Select one or multiple focus zones:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ZONE_DEFINITIONS.map((zone) => {
                const active = isSelected(zone.id);
                return (
                  <button
                    key={zone.id}
                    id={`zone-card-${zone.id}`}
                    onClick={() => onToggleZone(zone.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-[#EAF2EC] border-[#5E8B6E] text-[#1E3325] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E3ECE5] text-[#333D37] hover:border-[#CAD8CD]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            active ? 'bg-[#3B6A4E]' : 'bg-[#9BB0A1]'
                          }`}
                        />
                        {zone.label}
                      </div>
                      <div className="text-xs text-[#68776D] mt-0.5">
                        {zone.sublabel}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                        active
                          ? 'bg-[#3B6A4E] border-[#3B6A4E] text-white'
                          : 'border-[#CAD6CD] bg-white'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active summary & Primary Action */}
          <div className="pt-3 border-t border-[#E3ECE5] mt-2">
            <div className="flex items-center justify-between text-xs text-[#526357] mb-3">
              <span>Selected areas:</span>
              <span className="font-semibold text-[#273B2E]">
                {selectedZones.length} {selectedZones.length === 1 ? 'zone' : 'zones'} active
              </span>
            </div>

            {selectedZones.length > 0 ? (
              <button
                id="btn-show-routine"
                onClick={onSubmit}
                className="w-full py-3.5 px-6 rounded-xl bg-[#2D5A3F] hover:bg-[#254A34] text-white font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
                <span>Show my routine ({selectedZones.length} {selectedZones.length === 1 ? 'area' : 'areas'})</span>
              </button>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-[#F0F4F1] border border-dashed border-[#CBD8CE] text-center text-xs text-[#65776A]">
                Tap at least one body area above to generate your customized session
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
