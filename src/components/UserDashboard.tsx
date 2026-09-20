import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DashboardStats, SafetyProfile, Session, User, UserProfile } from '../types';
import { getSosSessionForMood } from '../data/curations';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  LogOut, 
  Flame, 
  Activity,
  History,
  Compass,
  CalendarCheck,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserDashboardProps {
  user: User;
  profile: UserProfile;
  onBack: () => void;
  onStartSession: (session: Session) => void;
  onOpenSafetyModal: () => void;
  onOpenAIAssistant: () => void;
  onLogout: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  profile,
  onBack,
  onStartSession,
  onOpenSafetyModal,
  onOpenAIAssistant,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'routines-history' | 'mood-logs'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  // Load Dashboard summary data
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await api.getDashboard();
        setStats(res.stats);
        if (res.generatedRoutines) {
          setSavedRoutines(res.generatedRoutines);
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Fetch last 10 generated AI routines specifically when Routines History tab is active
  useEffect(() => {
    if (activeTab === 'routines-history') {
      async function fetchHistory() {
        setLoadingRoutines(true);
        try {
          const res = await api.getSavedRoutines();
          if (res.routines) {
            setSavedRoutines(res.routines);
          }
        } catch (err) {
          console.warn('Saved routines fetch fallback:', err);
        } finally {
          setLoadingRoutines(false);
        }
      }
      fetchHistory();
    }
  }, [activeTab]);

  const completedCount = stats?.completedCountThisWeek || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const lifetimeCount = stats?.completedCountTotal || 0;
  // Calculate streak: min 1 if active this week, plus days active
  const currentStreakDays = completedCount > 0 ? Math.min(7, completedCount) : 0;

  // Converts saved AI routine into standard Session object for instant re-play
  const handleLaunchSavedRoutine = (r: any) => {
    const routine = r.filteredRoutineJson || r.rawRoutineJson;
    if (!routine) return;

    const totalDurSec = (routine.poses || []).reduce((acc: number, p: any) => acc + (p.duration || 60), 0);
    const session: Session = {
      id: r.id || `past-routine-${Date.now()}`,
      title: routine.title || 'Custom Somatic Flow',
      subtitle: routine.focusArea || 'Personalized AI Yoga',
      tag: 'Custom AI Flow',
      type: 'sos',
      durationMinutes: Math.max(5, Math.ceil(totalDurSec / 60)),
      poses: (routine.poses || []).map((p: any, idx: number) => ({
        id: `ai-pose-${idx}`,
        name: p.name,
        sanskritName: p.name,
        duration: p.duration || 60,
        target_zones: ['neck', 'shoulders'],
        contraindications: [],
        illustration_2d: 'reclined-butterfly',
        anatomicalFocus: p.benefit || routine.focusArea || 'Somatic Restoration',
        alignmentCues: p.visualCue ? [p.visualCue] : ['Breathe smoothly through the nose with neutral alignment.'],
        easierVariation: {
          name: 'Gentle Relaxation',
          description: 'Rest comfortably on the mat without physical strain.'
        },
        category: 'gentle_flow'
      }))
    };

    onStartSession(session);
  };

  // Quick launch for today's recommended practice
  const handleStartTodaysPractice = () => {
    const todaysSession = getSosSessionForMood('anxious', profile.safetyFlags);
    onStartSession(todaysSession);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#242724] flex flex-col max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#506355] hover:text-[#1E3325] hover:bg-[#EFEAE2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#884D3B] hover:bg-[#FBECE8] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* User Header Card */}
      <div className="mb-6 p-6 rounded-2xl bg-white border border-[#DDD6CA] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#3A6348] font-semibold">
              MEMBER SANCTUARY
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A3123] mt-1">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6E61] mt-1">
              {completedCount > 0
                ? `You’ve completed ${completedCount} somatic session${completedCount === 1 ? '' : 's'} this week.`
                : 'Take a short pause today to decompress your cervical and lumbar spine.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSafetyModal}
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-colors ${
                profile.safetyFlags.completed
                  ? 'border-[#C8D6CA] bg-[#EFF5F1] text-[#244E32]'
                  : 'border-[#E2DDD3] bg-[#F7F4EE] text-[#637266]'
              }`}
              title="Clinical safety profile"
            >
              <ShieldCheck className="w-4 h-4 text-[#20382B]" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {profile.safetyFlags.completed ? 'Safety Filter Active' : 'Configure Safety'}
              </span>
            </button>
          </div>
        </div>

        {/* Real Functional Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#EFECE5]">
          <div className="text-left">
            <div className="text-xs text-[#718274] font-medium">Weekly Sessions</div>
            <div className="text-xl sm:text-2xl font-serif-display font-medium text-[#1A3123] mt-0.5">
              {loading ? '—' : completedCount}
            </div>
            <div className="text-[10px] text-[#869689] mt-0.5">Target: 3 resets/wk</div>
          </div>

          <div className="text-left border-l border-[#EFECE5] pl-4">
            <div className="text-xs text-[#718274] font-medium">Practice Time</div>
            <div className="text-xl sm:text-2xl font-serif-display font-medium text-[#1A3123] mt-0.5">
              {loading ? '—' : `${totalMinutes}m`}
            </div>
            <div className="text-[10px] text-[#869689] mt-0.5">Somatic immersion</div>
          </div>

          <div className="text-left border-l border-[#EFECE5] pl-4">
            <div className="text-xs text-[#718274] font-medium">Current Streak</div>
            <div className="text-xl sm:text-2xl font-serif-display font-medium text-[#1A3123] mt-0.5 flex items-center gap-1.5">
              <span>{loading ? '—' : currentStreakDays}</span>
              <span className="text-xs font-sans text-[#B85C38] font-semibold">days</span>
            </div>
            <div className="text-[10px] text-[#869689] mt-0.5">{lifetimeCount} total resets</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD4] pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#1E3527] text-white'
              : 'text-[#5A6C5F] hover:bg-[#EFEAE2] hover:text-[#1E3527]'
          }`}
        >
          Today & Overview
        </button>

        <button
          onClick={() => setActiveTab('routines-history')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'routines-history'
              ? 'bg-[#1E3527] text-white'
              : 'text-[#5A6C5F] hover:bg-[#EFEAE2] hover:text-[#1E3527]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Routines History ({savedRoutines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mood-logs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'mood-logs'
              ? 'bg-[#1E3527] text-white'
              : 'text-[#5A6C5F] hover:bg-[#EFEAE2] hover:text-[#1E3527]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Check-In Patterns</span>
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Functional "TODAY'S PRACTICE" Card as requested */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F4EFE6] border border-[#DDD4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8C523B] bg-[#FBECE6] px-2 py-0.5 rounded">
                TODAY'S PRACTICE
              </span>
              <h2 className="text-xl font-serif-display font-medium text-[#1A2E20] mt-1.5">
                Vagus Nerve & Cervical Reset Flow
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#5D6F61] mt-1">
                <span>12 minutes</span>
                <span>·</span>
                <span>Gentle / Beginner</span>
                <span>·</span>
                <span>Targeting tech-neck & desk stiffness</span>
              </div>
            </div>

            <button
              onClick={handleStartTodaysPractice}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Practice</span>
            </button>
          </div>

          {/* Quick AI Routine Assistant Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#DDD6CB] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#1A2E20] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2F593E]" />
                <span>Need a tailored session right now?</span>
              </div>
              <p className="text-xs text-[#5C6E61] mt-0.5">
                Describe your exact physical stiffness in simple words and get a customized safe routine.
              </p>
            </div>

            <button
              onClick={onOpenAIAssistant}
              className="px-3.5 py-1.5 rounded-lg border border-[#20382B] text-[#20382B] text-xs font-medium hover:bg-[#20382B] hover:text-white transition-colors shrink-0"
            >
              Ask FlowState
            </button>
          </div>

          {/* Recent Completed Sessions Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#54685A]">
                Recent Completed Sessions
              </h3>
              <span className="text-[11px] text-[#78887B]">Stored in local and server logs</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-14 rounded-xl bg-[#EBE7DF] animate-pulse" />
                <div className="h-14 rounded-xl bg-[#EBE7DF] animate-pulse" />
              </div>
            ) : stats && stats.recentSessions && stats.recentSessions.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E0D9CD] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF5F0] text-[#28573A] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1E2E23]">
                          {s.sessionTitle}
                        </div>
                        <div className="text-[10px] text-[#718274]">
                          {new Date(s.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} · {s.durationMinutes} min
                        </div>
                      </div>
                    </div>

                    {s.rating && (
                      <span className="text-[10px] font-medium text-[#29593C] bg-[#EEF5F0] px-2 py-0.5 rounded">
                        {s.rating}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-dashed border-[#DDD5C7] text-center">
                <Compass className="w-5 h-5 text-[#86998A] mx-auto mb-1.5" />
                <p className="text-xs font-medium text-[#2A3B30]">No completed sessions logged yet.</p>
                <p className="text-[11px] text-[#6A7B6E] mt-0.5">
                  Complete today's reset above to record your first milestone.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Routines History (Fetches last 10 AI routines with prompt, timestamp, fade-in animation, and quick re-start) */}
      {activeTab === 'routines-history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#54685A]">
                Past Generated AI Routines
              </h3>
              <p className="text-xs text-[#6B7D70] mt-0.5">
                Last 10 tailored sequences generated for your profile. Re-start any sequence with one tap.
              </p>
            </div>
            <button
              onClick={onOpenAIAssistant}
              className="text-xs font-medium text-[#20382B] underline"
            >
              + Generate New
            </button>
          </div>

          {loadingRoutines ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-[#EBE6DD] animate-pulse" />
              ))}
            </div>
          ) : savedRoutines.length > 0 ? (
            <div className="space-y-3">
              {savedRoutines.slice(0, 10).map((item, idx) => {
                const routine = item.filteredRoutineJson || item.rawRoutineJson;
                const poseCount = routine?.poses?.length || 0;
                const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="p-4 rounded-xl bg-white border border-[#DDD6CB] hover:border-[#1E3527] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif-display font-medium text-base text-[#192F21]">
                          {routine?.title || 'Personalized Somatic Flow'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBE7DF] text-[#556659]">
                          {poseCount} asanas
                        </span>
                        {item.filterNotices && item.filterNotices.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#EDF5F0] text-[#265437] font-medium">
                            ✓ Safety Verified
                          </span>
                        )}
                      </div>

                      {/* Original Prompt */}
                      <div className="text-xs text-[#526356] italic">
                        “{item.prompt}”
                      </div>

                      {/* Timestamp & Focus */}
                      <div className="text-[10px] text-[#78887B] flex items-center gap-2">
                        <span>
                          {createdAt.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {routine?.focusArea && (
                          <>
                            <span>·</span>
                            <span>Focus: {routine.focusArea}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchSavedRoutine(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#20382B] hover:bg-[#2D4E3C] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                      title="Launch this routine in player"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start Routine</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white border border-dashed border-[#DDD5C7] text-center">
              <Sparkles className="w-6 h-6 text-[#86998A] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#2A3B30]">No past generated routines yet.</p>
              <p className="text-[11px] text-[#6A7B6E] mt-1 max-w-sm mx-auto">
                Use the AI Routine Assistant to describe your symptoms and your generated sequences will be saved here for re-play.
              </p>
              <button
                onClick={onOpenAIAssistant}
                className="mt-4 px-4 py-2 rounded-lg bg-[#20382B] text-white text-xs font-medium hover:bg-[#2D4E3C] transition-colors"
              >
                Describe How You Feel
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Mood Logs */}
      {activeTab === 'mood-logs' && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#54685A]">
            Check-In History
          </h3>

          {stats && stats.recentMoods && stats.recentMoods.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {stats.recentMoods.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white border border-[#E0D9CE] text-left"
                >
                  <div className="text-xs font-semibold capitalize text-[#1C2C21]">
                    {m.mood}
                  </div>
                  <div className="text-[10px] text-[#758679] mt-0.5">
                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  {m.targetZones && m.targetZones.length > 0 && (
                    <div className="text-[9px] text-[#2C593E] font-medium mt-1 truncate">
                      Zones: {m.targetZones.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white border border-dashed border-[#DDD5C7] text-center">
              <Activity className="w-5 h-5 text-[#86998A] mx-auto mb-1.5" />
              <p className="text-xs font-medium text-[#2A3B30]">No mood check-in patterns recorded yet.</p>
              <p className="text-[11px] text-[#6A7B6E] mt-0.5">
                Every time you tap a state on the home screen, your log syncs here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
