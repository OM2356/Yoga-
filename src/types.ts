export type MoodId = 'anxious' | 'sore' | 'wired' | 'cramping' | 'low-energy';

export type BodyZoneId = 'neck' | 'shoulders' | 'upper_back' | 'lower_back' | 'hips' | 'legs';

export type CyclePhaseId = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type TrimesterStageId = 'first' | 'second' | 'third' | 'postpartum';

export interface Pose {
  id: string;
  name: string;
  sanskritName: string;
  duration: number; // in seconds, default 45 - 90
  target_zones: BodyZoneId[];
  cycle_phase?: CyclePhaseId[];
  trimester_safe?: TrimesterStageId[];
  contraindications: ('inversion' | 'deep_twist' | 'intense_core' | 'supine_late' | 'asymmetrical_lunge' | 'high_bp')[];
  illustration_2d: string;
  anatomicalFocus: string;
  alignmentCues: string[];
  easierVariation: {
    name: string;
    description: string;
  };
  category: 'restorative' | 'release' | 'breath' | 'grounding' | 'stabilize' | 'gentle_flow';
  noMatRequired?: boolean;
}

export interface Session {
  id: string;
  title: string;
  subtitle?: string;
  type: 'sos' | 'body_target' | 'cycle' | 'prenatal' | 'deep_dive';
  durationMinutes: number;
  poses: Pose[];
  tag?: string;
  segments?: {
    name: string;
    durationMinutes: number;
    description: string;
    poses: Pose[];
  }[];
}

export interface SafetyProfile {
  completed: boolean;
  skipped: boolean;
  pregnantOrPostpartum: boolean;
  recentInjury: boolean;
  highBloodPressure: boolean;
  glaucomaOrEye: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

export interface UserProfile {
  userId: string;
  safetyFlags: SafetyProfile;
  cycleTrackingEnabled: boolean;
  trimester?: TrimesterStageId | null;
}

export interface AIRoutinePose {
  name: string;
  duration: number;
  visualCue?: string;
  benefit?: string;
}

export interface AIRoutine {
  title: string;
  focusArea: string;
  precautions?: string;
  poses: AIRoutinePose[];
}

export interface DashboardStats {
  completedCountTotal: number;
  completedCountThisWeek: number;
  totalMinutes: number;
  recentSessions: {
    id: string;
    sessionTitle: string;
    sessionType: string;
    durationMinutes: number;
    rating?: string;
    completedAt: string;
  }[];
  recentMoods: {
    id: string;
    mood: string;
    targetZones?: string[];
    createdAt: string;
  }[];
  routinesCount: number;
}

export type ActiveScreen = 
  | 'mood-checkin'
  | 'body-map'
  | 'sos-session'
  | 'cycle-flows'
  | 'prenatal-pathway'
  | 'deep-dive'
  | 'player'
  | 'ai-assistant'
  | 'dashboard'
  | 'wordpress-hub'
  | 'yoga-library'
  | 'knowledge-hub';

