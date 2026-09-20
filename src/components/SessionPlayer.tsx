import React, { useState, useEffect, useRef } from 'react';
import { Pose, Session } from '../types';
import { PoseIllustration } from './PoseIllustration';
import { audioEngine } from '../utils/audio';
import { 
  Play, 
  Pause, 
  SkipForward, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Camera, 
  CameraOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  X
} from 'lucide-react';

interface SessionPlayerProps {
  session: Session;
  onExit: () => void;
  onComplete: () => void;
}

export const SessionPlayer: React.FC<SessionPlayerProps> = ({
  session,
  onExit,
  onComplete
}) => {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.poses[0]?.duration || 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showingEasierVariation, setShowingEasierVariation] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const poses = session.poses;
  const currentPose: Pose | undefined = poses[currentPoseIndex];

  // Initialize or transition pose
  useEffect(() => {
    if (!currentPose) return;
    setTimeLeft(currentPose.duration);
    setShowingEasierVariation(false);

    // Play singing bowl transition chime
    if (!audioMuted) {
      audioEngine.playTransitionChime();
      // Speak first alignment cue or pose name
      setTimeout(() => {
        audioEngine.speakCue(`${currentPose.name}. ${currentPose.alignmentCues[0] || ''}`);
      }, 500);
    }
  }, [currentPoseIndex, audioMuted]);

  // Countdown timer loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance to next pose or complete
          if (currentPoseIndex < poses.length - 1) {
            setCurrentPoseIndex((i) => i + 1);
            return poses[currentPoseIndex + 1]?.duration || 60;
          } else {
            clearInterval(interval);
            onComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, currentPoseIndex, poses, onComplete]);

  // Handle camera mirror toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCameraActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        setStream(mediaStream);
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable', err);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  if (!currentPose) {
    return null;
  }

  const handleNextPose = () => {
    if (currentPoseIndex < poses.length - 1) {
      setCurrentPoseIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex((i) => i - 1);
    }
  };

  const handleToggleEasier = () => {
    const nextState = !showingEasierVariation;
    setShowingEasierVariation(nextState);
    if (nextState && !audioMuted) {
      audioEngine.speakCue(`Switching to ${currentPose.easierVariation.name}. Take your time.`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((currentPose.duration - timeLeft) / currentPose.duration) * 100;
  const overallProgress = ((currentPoseIndex + (1 - timeLeft / currentPose.duration)) / poses.length) * 100;

  return (
    <div className="min-h-screen w-full bg-[#F4F7F4] text-[#222A26] flex flex-col justify-between max-w-2xl mx-auto px-4 py-4 sm:py-6 select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="p-2 rounded-full text-[#4B5E52] hover:bg-[#E3EBE4] transition-colors"
          title="Exit session"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold tracking-wider text-[#356144] uppercase bg-[#E1ECE3] px-3 py-0.5 rounded-full">
            Pose {currentPoseIndex + 1} of {poses.length}
          </span>
          <span className="text-[11px] text-[#6A7C70] mt-0.5 font-medium">
            {session.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const muted = !audioMuted;
              setAudioMuted(muted);
              audioEngine.enabled = !muted;
              audioEngine.voiceCuesEnabled = !muted;
            }}
            className="p-2 rounded-full text-[#4B5E52] hover:bg-[#E3EBE4] transition-colors"
            title={audioMuted ? 'Unmute Audio Guidance' : 'Mute Audio Guidance'}
          >
            {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#2A573C]" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-2 rounded-full transition-colors ${
              cameraActive ? 'bg-[#2E5E41] text-white' : 'text-[#4B5E52] hover:bg-[#E3EBE4]'
            }`}
            title={cameraActive ? 'Hide Form Mirror' : 'Show Form Mirror'}
          >
            {cameraActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Overall Session Timeline Bar */}
      <div className="w-full bg-[#E0E9E2] h-1.5 rounded-full overflow-hidden my-3">
        <div
          className="bg-[#3B6A4E] h-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Main Focus Stage */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        {/* Camera Mirror PIP if enabled */}
        {cameraActive && (
          <div className="w-full max-w-sm mb-4 rounded-2xl overflow-hidden border border-[#BDD0C1] shadow-md bg-black relative aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
              Private Mirror · No Video Saved
            </span>
          </div>
        )}

        {/* Pose Illustration Canvas */}
        <div className="relative flex flex-col items-center">
          {/* Subtle breathing glow ring */}
          <div className="p-3 rounded-3xl bg-white border border-[#DEE7DF] shadow-xs relative">
            <PoseIllustration
              poseId={currentPose.id}
              size="lg"
              isBreathing={!isPaused}
              className="w-44 h-36 sm:w-56 sm:h-44"
            />

            {/* Circular Timer Ring Pill */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#2D5A3F] text-white px-3.5 py-1 rounded-full font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
              <span>{formatTime(timeLeft)} remaining</span>
            </div>
          </div>
        </div>

        {/* Pose Title & Sanskrit */}
        <div className="text-center mt-6">
          <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A261F]">
            {showingEasierVariation ? currentPose.easierVariation.name : currentPose.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6E61] italic mt-0.5">
            {showingEasierVariation ? 'Gentle Supported Variant' : currentPose.sanskritName}
          </p>

          <p className="text-xs text-[#456A52] font-medium mt-1.5 max-w-md mx-auto">
            {currentPose.anatomicalFocus}
          </p>
        </div>

        {/* Alignment Cues Card */}
        <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEE7E0] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D5A3F] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#356144]" />
            <span>Alignment & Somatic Cue</span>
          </div>

          {showingEasierVariation ? (
            <div className="space-y-1.5 text-xs sm:text-sm text-[#24352A] leading-relaxed">
              <div className="p-2.5 rounded-xl bg-[#F0F5F1] text-[#1E3B27] font-medium border border-[#D5E4D8]">
                {currentPose.easierVariation.description}
              </div>
              <p className="text-xs text-[#627768] pt-1">
                Take full permission to soften tension without striving for perfection.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 text-xs sm:text-sm text-[#38463E] leading-relaxed">
              {currentPose.alignmentCues.map((cue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A795B] mt-1.5 shrink-0" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Persistent "Show easier variation" / "Skip" without guilt */}
        <div className="flex items-center gap-2.5 mt-3">
          <button
            id="btn-easier-variation"
            onClick={handleToggleEasier}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showingEasierVariation
                ? 'bg-[#2E5E41] text-white border-[#2E5E41]'
                : 'bg-[#FFFFFF] text-[#33563F] border-[#CCD8CF] hover:bg-[#F0F5F1]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showingEasierVariation ? 'Return to Standard Pose' : 'Show me an easier variation'}</span>
          </button>

          <button
            id="btn-skip-pose"
            onClick={handleNextPose}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#5B6D61] hover:text-[#1F2B23] hover:bg-[#EAEFEA] transition-colors flex items-center gap-1"
          >
            <span>Skip pose</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Playback Controls Footer */}
      <div className="w-full max-w-md mx-auto pt-2 pb-2">
        <div className="flex items-center justify-between px-6 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#DEE7E0] shadow-xs">
          <button
            onClick={handlePrevPose}
            disabled={currentPoseIndex === 0}
            className={`p-2 rounded-full transition-colors ${
              currentPoseIndex === 0 ? 'text-[#D1DCD3] cursor-not-allowed' : 'text-[#44564A] hover:bg-[#EEF4EF]'
            }`}
            title="Previous Pose"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Primary Pause / Resume Button */}
          <button
            id="btn-player-play-pause"
            onClick={() => setIsPaused(!isPaused)}
            className="w-13 h-13 rounded-full bg-[#2D5A3F] hover:bg-[#234731] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
            title={isPaused ? 'Resume Timer' : 'Pause Timer'}
          >
            {isPaused ? (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            ) : (
              <Pause className="w-6 h-6 fill-white" />
            )}
          </button>

          <button
            onClick={handleNextPose}
            className="p-2 rounded-full text-[#44564A] hover:bg-[#EEF4EF] transition-colors"
            title={currentPoseIndex === poses.length - 1 ? 'Finish Session' : 'Next Pose'}
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
