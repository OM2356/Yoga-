import React from 'react';

interface PoseIllustrationProps {
  poseId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isBreathing?: boolean;
}

export const PoseIllustration: React.FC<PoseIllustrationProps> = ({
  poseId,
  size = 'md',
  className = '',
  isBreathing = false
}) => {
  const dims = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];

  const strokeColor = '#4A6B56'; // serene sage
  const accentColor = '#8EAA97'; // soft eucalyptus
  const highlightColor = '#E2ECE5'; // gentle mint mist

  const renderGraphic = () => {
    switch (poseId) {
      case 'childs-pose':
        return (
          <g>
            {/* Mat line */}
            <path d="M10 54 H70" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Feet/legs */}
            <path d="M22 52 C20 48 24 42 28 42 C32 42 34 46 36 50" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Torso resting on thighs */}
            <path d="M28 42 C36 34 50 36 58 48" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Head resting */}
            <circle cx="62" cy="49" r="5" fill={accentColor} />
            {/* Arms extending forward */}
            <path d="M52 42 L68 51" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Spine decompression arc */}
            <path d="M30 36 Q44 28 56 40" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          </g>
        );

      case 'cat-cow':
        return (
          <g>
            <path d="M12 56 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Four limbs tabletop */}
            <path d="M22 56 V40" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M58 56 V40" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            {/* Spine curve */}
            <path d="M22 40 C32 30 46 30 58 40" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Head */}
            <circle cx="64" cy="36" r="4.5" fill={accentColor} />
            {/* Spinal flow indicator */}
            <path d="M26 34 Q40 24 54 34" stroke="#86EFAC" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          </g>
        );

      case 'thread-the-needle':
        return (
          <g>
            <path d="M10 56 H70" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 56 L24 42 L42 42" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Threaded arm */}
            <path d="M42 42 L58 54" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="48" cy="48" r="4.5" fill={accentColor} />
            {/* Upper support arm */}
            <path d="M38 42 L34 54" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'seated-neck-trapezius-release':
      case 'seated-neck':
        return (
          <g>
            {/* Cross-legged base */}
            <path d="M20 54 C26 50 36 50 40 54 C44 50 54 50 60 54" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Upright spine */}
            <path d="M40 50 V28" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Neck tilting */}
            <path d="M40 28 L46 22" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="48" cy="18" r="5" fill={accentColor} />
            {/* Trapezius tension release wave */}
            <path d="M30 26 C33 22 37 24 40 28" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'seated-eagle-arms':
      case 'eagle-arms':
        return (
          <g>
            <path d="M22 54 C30 50 50 50 58 54" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M40 50 V30" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            {/* Wrapped eagle arms */}
            <path d="M32 34 Q40 26 42 34 Q40 42 48 30" stroke={accentColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="18" r="4.5" fill={strokeColor} />
          </g>
        );

      case 'seated-spinal-twist':
      case 'seated-twist':
        return (
          <g>
            <path d="M20 54 C30 48 50 48 60 54" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Twisted spine */}
            <path d="M38 50 C40 38 46 32 44 24" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="46" cy="18" r="4.5" fill={accentColor} />
            {/* Arm reaching around */}
            <path d="M40 34 L26 44" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M44 32 L56 46" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'supine-spinal-twist':
      case 'supine-twist':
        return (
          <g>
            <path d="M12 52 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Torso lying down */}
            <path d="M20 48 L46 48" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="16" cy="48" r="4.5" fill={accentColor} />
            {/* Twisted leg dropped */}
            <path d="M46 48 C50 42 54 36 62 38" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Open arm */}
            <path d="M32 48 L32 34" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'legs-up-the-wall':
      case 'legs-up-wall':
        return (
          <g>
            {/* Wall & Floor */}
            <path d="M10 54 H56 V12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            {/* Torso on floor */}
            <path d="M20 52 L52 52" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="16" cy="52" r="4.5" fill={accentColor} />
            {/* Legs extended up wall */}
            <path d="M52 52 V18" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Venous flow gentle dots */}
            <circle cx="56" cy="24" r="1.5" fill="#38BDF8" />
            <circle cx="56" cy="34" r="1.5" fill="#38BDF8" />
            <circle cx="56" cy="44" r="1.5" fill="#38BDF8" />
          </g>
        );

      case 'sun-salutation-flow':
      case 'sun-salutation':
        return (
          <g>
            <path d="M15 56 H65" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Upward salute posture */}
            <path d="M40 56 V26" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="40" cy="20" r="4.5" fill={accentColor} />
            {/* Arms overhead */}
            <path d="M32 10 L40 24 L48 10" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="40" cy="8" r="2" fill="#FBBF24" />
          </g>
        );

      case 'warrior-two':
        return (
          <g>
            <path d="M12 56 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Bent front knee + straight back leg */}
            <path d="M24 56 L34 42 L56 56" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Torso upright */}
            <path d="M38 42 V26" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="38" cy="20" r="4.5" fill={accentColor} />
            {/* Extended arms */}
            <path d="M18 28 H58" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'tree-pose':
        return (
          <g>
            <path d="M15 56 H65" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Standing leg */}
            <path d="M40 56 V38" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Bent tree leg */}
            <path d="M40 46 L52 42 L40 38" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Torso */}
            <path d="M40 38 V24" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="40" cy="18" r="4.5" fill={accentColor} />
            {/* Prayer hands */}
            <path d="M36 28 L40 24 L44 28" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );

      case 'camel-pose':
        return (
          <g>
            <path d="M12 56 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Kneeling thighs */}
            <path d="M28 56 V40" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Arching back */}
            <path d="M28 40 C34 32 44 32 50 42" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="52" cy="46" r="4.5" fill={accentColor} />
            {/* Hand to heel support */}
            <path d="M44 36 L30 52" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'supported-bridge':
      case 'bridge-pose':
        return (
          <g>
            <path d="M12 54 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Shoulders on floor */}
            <circle cx="20" cy="50" r="4.5" fill={accentColor} />
            {/* Pelvic arch */}
            <path d="M24 50 C32 34 46 34 54 54" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Block under sacrum */}
            <rect x="36" y="44" width="10" height="10" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
          </g>
        );

      case 'goddess-pose':
        return (
          <g>
            <path d="M12 56 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Wide squat legs */}
            <path d="M20 56 L26 44 L54 44 L60 56" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Torso */}
            <path d="M40 44 V26" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="40" cy="20" r="4.5" fill={accentColor} />
            {/* Cactus arms */}
            <path d="M26 22 V30 H54 V22" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );

      case 'reclined-bound-angle':
      case 'bound-angle':
        return (
          <g>
            <path d="M12 52 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Torso */}
            <path d="M22 48 H46" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="16" cy="48" r="4.5" fill={accentColor} />
            {/* Butterfly knees */}
            <path d="M46 48 C50 40 56 40 60 48" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M46 48 C50 56 56 56 60 48" stroke={accentColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'seated-forward-fold':
      case 'forward-fold':
        return (
          <g>
            <path d="M12 54 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Legs flat */}
            <path d="M30 52 H64" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Folded torso */}
            <path d="M30 52 C34 40 48 40 58 48" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="62" cy="47" r="4.5" fill={accentColor} />
            {/* Hands to feet */}
            <path d="M46 42 L62 51" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'supported-pigeon-figure-four':
      case 'figure-four':
        return (
          <g>
            <path d="M12 52 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Supine body */}
            <path d="M20 48 H44" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="16" cy="48" r="4.5" fill={accentColor} />
            {/* Bent knees figure 4 */}
            <path d="M44 48 L56 34" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M48 40 L62 44" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'pelvic-tilts-transverse':
      case 'pelvic-tilt':
        return (
          <g>
            <path d="M12 52 H68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 48 H44" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="16" cy="48" r="4.5" fill={accentColor} />
            <path d="M44 48 L56 38 L62 52" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Subtle transverse activation pulse */}
            <circle cx="36" cy="46" r="3.5" fill="#86EFAC" fillOpacity="0.5" />
          </g>
        );

      case 'box-breath-pranayama':
      case 'box-breath':
        return (
          <g>
            {/* Geometric breath square */}
            <rect x="22" y="16" width="36" height="36" rx="4" fill="none" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="3 3" />
            {/* Seated meditator center */}
            <circle cx="40" cy="30" r="4.5" fill={strokeColor} />
            <path d="M30 46 C34 40 46 40 50 46" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Breathing arrow pulse */}
            <path d="M40 18 V14" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 42 V46" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'savasana-guided-rest':
      case 'savasana':
      default:
        return (
          <g>
            <path d="M10 52 H70" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            {/* Supine relaxed body */}
            <path d="M24 48 H62" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="18" cy="48" r="4.5" fill={accentColor} />
            {/* Surrendered palms */}
            <path d="M34 50 L34 46" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M44 50 L44 46" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-[#F2F5F2] p-1 text-[#242A27] overflow-hidden border border-[#E1E8E2] ${dims} ${
        isBreathing ? 'animate-breathe' : ''
      } ${className}`}
      title={poseId}
    >
      <svg
        viewBox="0 0 80 70"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="80" height="70" rx="10" fill={highlightColor} fillOpacity="0.4" />
        {renderGraphic()}
      </svg>
    </div>
  );
};
