import React, { useState } from 'react';
import { ActiveScreen, SafetyProfile, User } from '../types';
import { Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  currentUser: User | null;
  safetyProfile: SafetyProfile;
  onOpenAuth: () => void;
  onOpenSafetyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  currentUser,
  safetyProfile,
  onOpenAuth,
  onOpenSafetyModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; screen: ActiveScreen; isMatch: (s: ActiveScreen) => boolean }[] = [
    {
      label: 'Home',
      screen: 'mood-checkin',
      isMatch: (s) => s === 'mood-checkin'
    },
    {
      label: 'Yoga',
      screen: 'yoga-library',
      isMatch: (s) => s === 'yoga-library' || s === 'sos-session' || s === 'body-map'
    },
    {
      label: 'Cycle',
      screen: 'cycle-flows',
      isMatch: (s) => s === 'cycle-flows'
    },
    {
      label: 'Meditation',
      screen: 'deep-dive',
      isMatch: (s) => s === 'deep-dive'
    },
    {
      label: 'Knowledge Hub',
      screen: 'knowledge-hub',
      isMatch: (s) => s === 'knowledge-hub'
    },
    {
      label: 'Dashboard',
      screen: 'dashboard',
      isMatch: (s) => s === 'dashboard'
    }
  ];

  const handleNavClick = (screen: ActiveScreen) => {
    if (screen === 'dashboard' && !currentUser) {
      onOpenAuth();
    } else {
      onNavigate(screen);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E7E2D9] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('mood-checkin')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#20382B] group-hover:bg-[#345942] transition-colors" />
          <div className="flex flex-col">
            <span className="font-serif-display text-xl tracking-tight font-medium text-[#1E3527]">
              FlowState
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#738276] -mt-1 font-sans hidden sm:inline">
              Somatic Recovery
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const active = item.isMatch(activeScreen);
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.screen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'text-[#1E3527] bg-[#EAE5DC] font-semibold'
                    : 'text-[#566359] hover:text-[#1E3527] hover:bg-[#F2EFEA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Safety Badge & Auth Profile */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Clinical Safety Indicator */}
          <button
            onClick={onOpenSafetyModal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
              safetyProfile.completed
                ? 'border-[#CCD8CE] text-[#244630] bg-[#EFF4F0] hover:bg-[#E4ECE6]'
                : 'border-[#E0DAD0] text-[#69756C] bg-[#F7F4EE] hover:bg-[#EFEAE2]'
            }`}
            title="Somatic safety contraindication filter"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${safetyProfile.completed ? 'text-[#285739]' : 'text-[#8E9B91]'}`} />
            <span className="hidden lg:inline text-[11px] font-medium">
              {safetyProfile.completed ? 'Safety Filter Active' : 'Safety Check'}
            </span>
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1E3527] bg-[#E8E2D7] hover:bg-[#DDD6CA] transition-colors border border-[#D5CDC0]"
            >
              <span className="w-5 h-5 rounded-full bg-[#20382B] text-white text-[10px] flex items-center justify-center font-serif">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#1E3527] border border-[#CCD5CE] hover:border-[#1E3527] hover:bg-[#F2EFE8] transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-7 h-7 rounded-full bg-[#20382B] text-white text-xs flex items-center justify-center font-serif"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-medium text-[#1E3527] px-2 py-1 rounded border border-[#CCD5CE]"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#3C4A40] hover:bg-[#EFEAE2] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E2D9] bg-[#FAF8F5] px-4 py-4 space-y-1 shadow-sm">
          {navLinks.map((item) => {
            const active = item.isMatch(activeScreen);
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.screen)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                  active
                    ? 'text-[#1E3527] bg-[#EAE5DC] font-semibold'
                    : 'text-[#566359] hover:bg-[#F2EFEA]'
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#20382B]" />}
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-[#E7E2D9] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSafetyModal();
              }}
              className="text-xs text-[#526357] flex items-center gap-1.5 py-1"
            >
              <ShieldCheck className="w-4 h-4 text-[#20382B]" />
              <span>Safety Filter: {safetyProfile.completed ? 'Active' : 'Unconfigured'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('wordpress-hub');
              }}
              className="text-xs text-[#8A5A3D] font-medium py-1"
            >
              WP / LMS Hub
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
