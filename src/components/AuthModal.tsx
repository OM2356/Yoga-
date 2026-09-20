import React, { useState } from 'react';
import { api } from '../utils/api';
import { SafetyProfile, User, UserProfile } from '../types';
import { Sparkles, Shield, ArrowRight, X, AlertCircle, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, profile: UserProfile) => void;
  safetyProfile: SafetyProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  safetyProfile
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        const res = await api.signup(email.trim(), password, name.trim(), safetyProfile);
        onSuccess(res.user, res.profile);
        onClose();
      } else {
        const res = await api.login(email.trim(), password);
        onSuccess(res.user, res.profile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.loginGuest(safetyProfile);
      onSuccess(res.user, res.profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Guest session could not be initialized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#DCE4DD] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E3EBE4] bg-[#F7FAF7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D5A3F] text-white flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1A261F]">
                {mode === 'login' ? 'Welcome Back to FlowState' : 'Create Your FlowState Account'}
              </h3>
              <p className="text-xs text-[#5D6F63]">
                {mode === 'login' ? 'Sync your mood history and custom routines' : 'Save your personal safety profile and progress'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B7E72] hover:bg-[#EAEFEA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E8EEE9] bg-[#FAFBF9] p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              mode === 'login'
                ? 'bg-white text-[#1C3624] shadow-2xs font-semibold'
                : 'text-[#637769] hover:text-[#213528]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#1C3624] shadow-2xs font-semibold'
                : 'text-[#637769] hover:text-[#213528]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-[#FFF2F0] border border-[#FAD2CD] text-xs text-[#992E22] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#4D6153] mb-1">
                Your Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8C9E92] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5E1D7] focus:outline-hidden focus:ring-2 focus:ring-[#3B6A4E]/30 focus:border-[#3B6A4E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4D6153] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C9E92] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5E1D7] focus:outline-hidden focus:ring-2 focus:ring-[#3B6A4E]/30 focus:border-[#3B6A4E]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#4D6153]">
                Password
              </label>
              <span className="text-[10px] text-[#7C8F82]">Minimum 8 characters</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C9E92] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5E1D7] focus:outline-hidden focus:ring-2 focus:ring-[#3B6A4E]/30 focus:border-[#3B6A4E]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D5A3F] hover:bg-[#234832] disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5EDE7]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-[#7C8F82]">Or continue without password</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl bg-[#F0F5F1] hover:bg-[#E4ECE6] text-[#2D5A3F] text-xs font-medium border border-[#D0DFD4] transition-colors"
          >
            Continue as Guest (Instant Preview)
          </button>
        </form>

        {/* Footer safety statement */}
        <div className="p-3 bg-[#F7FAF7] border-t border-[#E3ECE5] text-center text-[10px] text-[#697D6E] flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-[#3B6A4E]" />
          <span>Encrypted passwords & rate-limited authentication protection</span>
        </div>
      </div>
    </div>
  );
};
