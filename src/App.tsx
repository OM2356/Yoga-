/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ActiveScreen, 
  BodyZoneId, 
  MoodId, 
  SafetyProfile, 
  Session,
  User,
  UserProfile
} from './types';
import { 
  getSosSessionForMood, 
  getRoutineForBodyZones, 
  getDeepDiveSession 
} from './data/curations';
import { Navbar } from './components/Navbar';
import { MoodCheckIn } from './components/MoodCheckIn';
import { BodyMap } from './components/BodyMap';
import { SessionList } from './components/SessionList';
import { SessionPlayer } from './components/SessionPlayer';
import { CycleSyncedFlows } from './components/CycleSyncedFlows';
import { PrenatalPathway } from './components/PrenatalPathway';
import { DeepDiveScreen } from './components/DeepDiveScreen';
import { AsanaLibrary } from './components/AsanaLibrary';
import { KnowledgeHub } from './components/KnowledgeHub';
import { SafetyCheckInModal } from './components/SafetyCheckInModal';
import { GiftPeaceModal } from './components/GiftPeaceModal';
import { YogaAssistant } from './components/YogaAssistant';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { AskGuideModal } from './components/AskGuideModal';
import { WordPressHub } from './components/WordPressHub';
import { api } from './utils/api';

const DEFAULT_SAFETY_PROFILE: SafetyProfile = {
  completed: false,
  skipped: false,
  pregnantOrPostpartum: false,
  recentInjury: false,
  highBloodPressure: false,
  glaucomaOrEye: false
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('mood-checkin');
  const [selectedZones, setSelectedZones] = useState<BodyZoneId[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAskGuideModal, setShowAskGuideModal] = useState(false);

  // Safety profile state
  const [safetyProfile, setSafetyProfile] = useState<SafetyProfile>(() => {
    try {
      const saved = localStorage.getItem('flowstate_safety_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // LocalStorage fallback
    }
    return DEFAULT_SAFETY_PROFILE;
  });

  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingSessionToStart, setPendingSessionToStart] = useState<Session | null>(null);
  const [showGiftPeaceModal, setShowGiftPeaceModal] = useState(false);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const authData = await api.getMe();
        if (authData) {
          setCurrentUser(authData.user);
          setUserProfile(authData.profile);
          if (authData.profile.safetyFlags) {
            setSafetyProfile(authData.profile.safetyFlags);
          }
        }
      } catch (err) {
        console.warn('Session restore note:', err);
      }
    }
    restoreSession();
  }, []);

  // Persist safety profile locally & to server if authenticated
  useEffect(() => {
    try {
      localStorage.setItem('flowstate_safety_profile', JSON.stringify(safetyProfile));
    } catch {
      // LocalStorage write error fallback
    }

    if (currentUser) {
      api.updateProfile({ safetyFlags: safetyProfile }).catch(() => {});
    }
  }, [safetyProfile, currentUser]);

  // Handle Mood selection from Landing Screen
  const handleSelectMood = (mood: MoodId) => {
    api.logMood(mood);

    if (mood === 'sore') {
      setSelectedZones([]);
      setActiveScreen('body-map');
    } else if (mood === 'cramping') {
      setActiveScreen('cycle-flows');
    } else {
      const session = getSosSessionForMood(mood, safetyProfile);
      setActiveSession(session);
      setActiveScreen('sos-session');
    }
  };

  // Body map zone toggling
  const handleToggleZone = (zone: BodyZoneId) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  // Body map submit
  const handleBodyMapSubmit = () => {
    if (selectedZones.length === 0) return;
    api.logMood('sore', selectedZones);

    const session = getRoutineForBodyZones(selectedZones, safetyProfile);
    setActiveSession(session);
    setActiveScreen('sos-session');
  };

  // Triggering a session start
  const handleStartSession = (session: Session) => {
    if (!safetyProfile.completed && !safetyProfile.skipped) {
      setPendingSessionToStart(session);
      setShowSafetyModal(true);
      return;
    }

    setActiveSession(session);
    setActiveScreen('player');
  };

  const handleSaveSafetyProfile = (updatedProfile: SafetyProfile) => {
    setSafetyProfile(updatedProfile);
    setShowSafetyModal(false);

    if (pendingSessionToStart) {
      setActiveSession(pendingSessionToStart);
      setPendingSessionToStart(null);
      setActiveScreen('player');
    }
  };

  const handleSkipSafety = () => {
    setSafetyProfile((prev) => ({ ...prev, skipped: true }));
    setShowSafetyModal(false);

    if (pendingSessionToStart) {
      setActiveSession(pendingSessionToStart);
      setPendingSessionToStart(null);
      setActiveScreen('player');
    }
  };

  // Session completed in player
  const handleSessionComplete = () => {
    if (activeSession) {
      api.completeSession({
        sessionId: activeSession.id,
        sessionTitle: activeSession.title,
        sessionType: activeSession.type,
        durationMinutes: activeSession.durationMinutes,
        rating: 'helped'
      });
    }
    setShowGiftPeaceModal(true);
  };

  const handleFinishGiftPeace = () => {
    setShowGiftPeaceModal(false);
    setActiveScreen('mood-checkin');
  };

  const handleAuthSuccess = (user: User, profile: UserProfile) => {
    setCurrentUser(user);
    setUserProfile(profile);
    if (profile.safetyFlags && profile.safetyFlags.completed) {
      setSafetyProfile(profile.safetyFlags);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setUserProfile(null);
    setActiveScreen('mood-checkin');
  };

  // Fallback user for dashboard exploration
  const effectiveUser: User = currentUser || {
    id: 'practitioner-preview',
    email: 'guest@flowstate.yoga',
    name: 'Practitioner',
    isGuest: true
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#242724] font-sans antialiased selection:bg-[#20382B]/15">
      {/* Universal Clean Navbar (Hidden in active player mode) */}
      {activeScreen !== 'player' && (
        <Navbar
          activeScreen={activeScreen}
          onNavigate={(screen) => setActiveScreen(screen)}
          currentUser={currentUser}
          safetyProfile={safetyProfile}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSafetyModal={() => setShowSafetyModal(true)}
        />
      )}

      {/* 1. Landing / Mood Check-In Screen */}
      {activeScreen === 'mood-checkin' && (
        <MoodCheckIn
          onSelectMood={handleSelectMood}
          onOpenDeepDive={() => setActiveScreen('deep-dive')}
          onOpenCycleFlows={() => setActiveScreen('cycle-flows')}
          onOpenPrenatal={() => setActiveScreen('prenatal-pathway')}
          onOpenSafetyModal={() => setShowSafetyModal(true)}
          onOpenAIAssistant={() => setActiveScreen('ai-assistant')}
          onOpenAskGuide={() => setShowAskGuideModal(true)}
          onOpenDashboard={() => setActiveScreen('dashboard')}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenWordPressHub={() => setActiveScreen('wordpress-hub')}
          onOpenYogaLibrary={() => setActiveScreen('yoga-library')}
          onOpenKnowledgeHub={() => setActiveScreen('knowledge-hub')}
          currentUser={currentUser}
          safetyProfileConfigured={safetyProfile.completed}
        />
      )}

      {/* 2. Interactive Body Map Screen */}
      {activeScreen === 'body-map' && (
        <BodyMap
          selectedZones={selectedZones}
          onToggleZone={handleToggleZone}
          onSubmit={handleBodyMapSubmit}
          onBack={() => setActiveScreen('mood-checkin')}
        />
      )}

      {/* 3. SOS / Targeted Session List Screen */}
      {activeScreen === 'sos-session' && activeSession && (
        <SessionList
          session={activeSession}
          onStartSession={handleStartSession}
          onBack={() => setActiveScreen('mood-checkin')}
          safety={safetyProfile}
          onUpdateSessionPoses={(updatedPoses) => {
            setActiveSession((prev) => prev ? { ...prev, poses: updatedPoses } : null);
          }}
        />
      )}

      {/* 4. Cycle-Synced Flows */}
      {activeScreen === 'cycle-flows' && (
        <CycleSyncedFlows
          onStartSession={handleStartSession}
          onBack={() => setActiveScreen('mood-checkin')}
          safety={safetyProfile}
        />
      )}

      {/* 5. Prenatal & Postpartum Pathway */}
      {activeScreen === 'prenatal-pathway' && (
        <PrenatalPathway
          onStartSession={handleStartSession}
          onBack={() => setActiveScreen('mood-checkin')}
          safety={safetyProfile}
        />
      )}

      {/* 6. Asana Library & 3D Studio */}
      {activeScreen === 'yoga-library' && (
        <AsanaLibrary
          onStartSession={handleStartSession}
          safety={safetyProfile}
          onBackToHome={() => setActiveScreen('mood-checkin')}
        />
      )}

      {/* 7. Editorial Knowledge Hub */}
      {activeScreen === 'knowledge-hub' && (
        <KnowledgeHub
          onBackToHome={() => setActiveScreen('mood-checkin')}
        />
      )}

      {/* 8. AI Yoga Routine Assistant ("Ask FlowState") */}
      {activeScreen === 'ai-assistant' && (
        <YogaAssistant
          onBack={() => setActiveScreen('mood-checkin')}
          onStartSession={handleStartSession}
          safety={safetyProfile}
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 9. Personalized User Dashboard & Routines History */}
      {activeScreen === 'dashboard' && (
        <UserDashboard
          user={effectiveUser}
          profile={userProfile || { userId: effectiveUser.id, safetyFlags: safetyProfile, cycleTrackingEnabled: false }}
          onBack={() => setActiveScreen('mood-checkin')}
          onStartSession={handleStartSession}
          onOpenSafetyModal={() => setShowSafetyModal(true)}
          onOpenAIAssistant={() => setActiveScreen('ai-assistant')}
          onLogout={handleLogout}
        />
      )}

      {/* 10. Deep Dive Weekend Reset */}
      {activeScreen === 'deep-dive' && (
        <DeepDiveScreen
          onStartSession={handleStartSession}
          onBack={() => setActiveScreen('mood-checkin')}
          safety={safetyProfile}
        />
      )}

      {/* 11. WordPress & LearnDash Stack Hub */}
      {activeScreen === 'wordpress-hub' && (
        <WordPressHub
          onBack={() => setActiveScreen('mood-checkin')}
        />
      )}

      {/* Guided Session Player (Active playback mode) */}
      {activeScreen === 'player' && activeSession && (
        <SessionPlayer
          session={activeSession}
          onExit={() => setActiveScreen('mood-checkin')}
          onComplete={handleSessionComplete}
        />
      )}

      {/* Mandatory Safety Check-In Modal */}
      <SafetyCheckInModal
        isOpen={showSafetyModal}
        currentProfile={safetyProfile}
        onSaveProfile={handleSaveSafetyProfile}
        onSkip={handleSkipSafety}
        canClose={safetyProfile.completed || safetyProfile.skipped}
      />

      {/* Auth Modal (Login / Sign Up / Guest) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        safetyProfile={safetyProfile}
      />

      {/* Conversational Guide Modal */}
      <AskGuideModal
        isOpen={showAskGuideModal}
        onClose={() => setShowAskGuideModal(false)}
        safety={safetyProfile}
        onOpenRoutineGenerator={() => {
          setActiveScreen('ai-assistant');
        }}
      />

      {/* Gift Peace Referral & Mood Shift Modal */}
      {activeSession && (
        <GiftPeaceModal
          session={activeSession}
          isOpen={showGiftPeaceModal}
          onClose={() => setShowGiftPeaceModal(false)}
          onDone={handleFinishGiftPeace}
        />
      )}
    </div>
  );
}
