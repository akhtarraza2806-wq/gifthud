import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  ShieldCheck,
  Crown,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Gift,
  CheckCircle2,
  LockKeyhole,
  Feather,
  Sliders,
  ChevronDown
} from 'lucide-react';

/* ======================================================================
   TYPES & INTERFACES
   ====================================================================== */

export type PasswordTheme = 'romantic' | 'champagne' | 'midnight' | 'burgundy';

export interface PasswordProtectionProps {
  /** The correct passcode or secret phrase required to unlock */
  correctPassword?: string;
  /** Optional romantic hint displayed when requested */
  hint?: string;
  /** Title of the protected gift experience */
  giftTitle?: string;
  /** Recipient name */
  recipientName?: string;
  /** Sender name */
  senderName?: string;
  /** Luxury theme style */
  theme?: PasswordTheme;
  /** Whether the overlay is initially locked */
  defaultLocked?: boolean;
  /** Controlled lock state (optional) */
  isLocked?: boolean;
  /** Maximum failed attempts before temporary cooldown */
  maxAttempts?: number;
  /** Callback fired upon successful unlock */
  onUnlock?: () => void;
  /** Callback fired when re-locking */
  onLock?: () => void;
  /** Child content revealed after unlocking */
  children?: React.ReactNode;
  /** Whether to show the luxury configuration bar (demo helper) */
  showDemoControls?: boolean;
  /** Custom overlay backdrop blur */
  blurIntensity?: 'light' | 'medium' | 'heavy';
}

export const PasswordProtection: React.FC<PasswordProtectionProps> = ({
  correctPassword = 'forever',
  hint = 'Our special anniversary word (Hint: "forever")',
  giftTitle = 'Exclusive Romantic Hamper & Wax-Sealed Letter',
  recipientName = 'Eleanor',
  senderName = 'Alexander',
  theme = 'romantic',
  defaultLocked = true,
  isLocked: controlledLocked,
  maxAttempts = 5,
  onUnlock,
  onLock,
  children,
  showDemoControls = true,
  blurIntensity = 'heavy',
}) => {
  // State management
  const [internalLocked, setInternalLocked] = useState<boolean>(defaultLocked);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState<number>(0);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [unlockSuccessAnim, setUnlockSuccessAnim] = useState<boolean>(false);

  // Demo customization state
  const [activeTheme, setActiveTheme] = useState<PasswordTheme>(theme);
  const [secretCode, setSecretCode] = useState<string>(correctPassword);
  const [secretHint, setSecretHint] = useState<string>(hint);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Sync controlled / uncontrolled
  const isCurrentlyLocked = controlledLocked !== undefined ? controlledLocked : internalLocked;

  useEffect(() => {
    setSecretCode(correctPassword);
  }, [correctPassword]);

  useEffect(() => {
    setSecretHint(hint);
  }, [hint]);

  useEffect(() => {
    setActiveTheme(theme);
  }, [theme]);

  /* ======================================================================
     VALIDATION & UNLOCK LOGIC
     ====================================================================== */

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fb7185', '#d4af37', '#f43f5e', '#fff1f2'],
      });
    } catch {
      // Fallback silently if canvas context is unmounted
    }
  };

  const handleUnlockAttempt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedInput = inputPassword.trim();
    if (!trimmedInput) {
      setErrorMessage('Please enter the secret password to reveal your gift.');
      setShakeKey((prev) => prev + 1);
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Simulate luxury authentication verification delay
    setTimeout(() => {
      setIsVerifying(false);

      if (trimmedInput.toLowerCase() === secretCode.trim().toLowerCase()) {
        // SUCCESS
        setUnlockSuccessAnim(true);
        triggerConfetti();

        setTimeout(() => {
          setUnlockSuccessAnim(false);
          setInternalLocked(false);
          setAttemptsCount(0);
          setInputPassword('');
          setErrorMessage(null);
          onUnlock?.();
        }, 900);
      } else {
        // FAILED
        const nextAttempts = attemptsCount + 1;
        setAttemptsCount(nextAttempts);
        const remaining = maxAttempts - nextAttempts;

        if (remaining > 0) {
          setErrorMessage(`Incorrect passcode. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
        } else {
          setErrorMessage('Too many attempts. Please review the secret hint or contact the sender.');
        }

        setShakeKey((prev) => prev + 1);
      }
    }, 450);
  };

  const handleRelock = () => {
    setInternalLocked(true);
    setInputPassword('');
    setErrorMessage(null);
    setShowHint(false);
    onLock?.();
  };

  /* ======================================================================
     THEME STYLES
     ====================================================================== */

  const getThemeStyles = () => {
    switch (activeTheme) {
      case 'champagne':
        return {
          cardBg: 'bg-white/95 dark:bg-velvet-900/95 border-champagne-300 dark:border-champagne-700/80 shadow-champagne-glow',
          badgeBg: 'bg-champagne-100 dark:bg-champagne-950/70 text-champagne-800 dark:text-champagne-300 border-champagne-300 dark:border-champagne-700',
          accentColor: 'text-champagne-600 dark:text-champagne-400',
          buttonClass: 'btn-champagne shadow-md',
          inputBorder: 'focus:border-champagne-500 focus:ring-champagne-400/30',
          glowGradient: 'from-champagne-300/30 via-romantic-200/20 to-transparent',
        };
      case 'midnight':
        return {
          cardBg: 'bg-velvet-950/95 border-velvet-700 text-white shadow-velvet-card',
          badgeBg: 'bg-velvet-800 text-romantic-300 border-velvet-700',
          accentColor: 'text-romantic-400',
          buttonClass: 'bg-gradient-to-r from-romantic-600 to-velvet-800 text-white hover:brightness-110 shadow-md',
          inputBorder: 'focus:border-romantic-500 focus:ring-romantic-500/30',
          glowGradient: 'from-romantic-900/40 via-velvet-900/30 to-transparent',
        };
      case 'burgundy':
        return {
          cardBg: 'bg-white/95 dark:bg-velvet-900/95 border-romantic-300 dark:border-romantic-800 shadow-romantic-md',
          badgeBg: 'bg-romantic-100 dark:bg-romantic-950/70 text-romantic-800 dark:text-romantic-200 border-romantic-300 dark:border-romantic-800',
          accentColor: 'text-romantic-700 dark:text-romantic-300',
          buttonClass: 'btn-romantic shadow-romantic-md',
          inputBorder: 'focus:border-romantic-600 focus:ring-romantic-500/30',
          glowGradient: 'from-romantic-500/20 via-champagne-300/20 to-transparent',
        };
      case 'romantic':
      default:
        return {
          cardBg: 'bg-white/95 dark:bg-velvet-900/95 border-romantic-200 dark:border-velvet-800 shadow-romantic-lg',
          badgeBg: 'bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 border-romantic-200 dark:border-velvet-700',
          accentColor: 'text-romantic-500',
          buttonClass: 'btn-romantic shadow-romantic-md',
          inputBorder: 'focus:border-romantic-500 focus:ring-romantic-400/30',
          glowGradient: 'from-romantic-400/25 via-champagne-400/20 to-transparent',
        };
    }
  };

  const currentStyle = getThemeStyles();

  const getBlurClass = () => {
    switch (blurIntensity) {
      case 'light':
        return 'backdrop-blur-sm bg-velvet-950/30';
      case 'medium':
        return 'backdrop-blur-md bg-velvet-950/50';
      case 'heavy':
      default:
        return 'backdrop-blur-xl bg-velvet-950/65';
    }
  };

  /* ======================================================================
     DEFAULT DEMO GIFT CONTENT (If no children passed)
     ====================================================================== */
  const defaultGiftContent = (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-romantic-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-romantic-100 dark:border-velvet-800">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vault Unlocked with Love</span>
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
            {giftTitle}
          </h3>
          <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300">
            Specially penned &amp; prepared by <span className="font-semibold text-romantic-600 dark:text-champagne-400">{senderName}</span> for <span className="font-semibold text-romantic-600 dark:text-champagne-400">{recipientName}</span>.
          </p>
        </div>

        <button
          onClick={handleRelock}
          className="btn-romantic-outline text-xs px-4 py-2 flex items-center gap-2 self-start sm:self-auto"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Relock Experience</span>
        </button>
      </div>

      {/* Love Letter Preview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-romantic-50/70 dark:bg-velvet-950/50 border border-romantic-200/80 dark:border-velvet-800 relative overflow-hidden space-y-4 shadow-inner">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-romantic-500 pointer-events-none">
          <Heart className="w-32 h-32 fill-current" />
        </div>

        <div className="flex items-center gap-2 text-romantic-600 dark:text-romantic-400 text-xs font-serif italic">
          <Feather className="w-4 h-4" />
          <span>Handwritten Parchment Note</span>
        </div>

        <p className="font-serif italic text-lg sm:text-xl text-velvet-900 dark:text-romantic-100 leading-relaxed">
          "Dearest {recipientName}, each moment spent beside you feels like an eternity of grace. May this little treasure remind you of the golden hours we share and the promises of all tomorrow holds."
        </p>

        <div className="pt-4 flex items-center justify-between border-t border-romantic-200/60 dark:border-velvet-800 text-xs text-velvet-500">
          <span className="font-display font-semibold text-romantic-900 dark:text-champagne-300">
            Forever Yours, {senderName}
          </span>
          <span className="flex items-center gap-1 text-romantic-500">
            <Heart className="w-3 h-3 fill-current" /> Wax Sealed with Beeswax
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* ======================================================================
          OPTIONAL DEMO & SETTINGS CONTROLLER BAR
          ====================================================================== */}
      {showDemoControls && (
        <div className="p-4 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-800 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600 dark:text-champagne-400">
                <LockKeyhole className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-velvet-900 dark:text-white">
                  Password Protection Overlay Controller
                </h4>
                <p className="text-[11px] text-velvet-500">
                  Status: <strong className={isCurrentlyLocked ? 'text-rose-500' : 'text-emerald-500'}>
                    {isCurrentlyLocked ? '🔒 Content Locked' : '🔓 Vault Unlocked'}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isCurrentlyLocked) {
                    setInternalLocked(false);
                    onUnlock?.();
                  } else {
                    handleRelock();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-romantic-50 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-romantic-700 dark:text-romantic-300 hover:border-romantic-400 transition-all"
              >
                {isCurrentlyLocked ? '⚡ Fast Unlock (Demo)' : '🔒 Relock Vault'}
              </button>

              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="p-1.5 rounded-xl bg-romantic-50 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-velvet-600 dark:text-velvet-300 hover:text-romantic-600 flex items-center gap-1 text-xs font-semibold"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettingsDrawer ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Collapsible Demo Settings Drawer */}
          <AnimatePresence>
            {showSettingsDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-romantic-100 dark:border-velvet-800 space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Secret Password Setting */}
                  <div className="space-y-1">
                    <label className="font-semibold text-velvet-700 dark:text-velvet-300">
                      Secret Passcode:
                    </label>
                    <input
                      type="text"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="e.g. forever"
                      className="w-full px-3 py-1.5 rounded-xl bg-romantic-50/70 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 font-mono text-xs text-velvet-900 dark:text-white outline-none focus:ring-1 focus:ring-romantic-400"
                    />
                  </div>

                  {/* Secret Hint Setting */}
                  <div className="space-y-1">
                    <label className="font-semibold text-velvet-700 dark:text-velvet-300">
                      Romantic Hint Clue:
                    </label>
                    <input
                      type="text"
                      value={secretHint}
                      onChange={(e) => setSecretHint(e.target.value)}
                      placeholder="e.g. Our anniversary word"
                      className="w-full px-3 py-1.5 rounded-xl bg-romantic-50/70 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-xs text-velvet-900 dark:text-white outline-none focus:ring-1 focus:ring-romantic-400"
                    />
                  </div>

                  {/* Theme Selector */}
                  <div className="space-y-1">
                    <label className="font-semibold text-velvet-700 dark:text-velvet-300">
                      Aesthetic Theme:
                    </label>
                    <select
                      value={activeTheme}
                      onChange={(e) => setActiveTheme(e.target.value as PasswordTheme)}
                      className="w-full px-3 py-1.5 rounded-xl bg-romantic-50/70 dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-xs text-velvet-900 dark:text-white outline-none focus:ring-1 focus:ring-romantic-400"
                    >
                      <option value="romantic">🌹 Romantic Rose</option>
                      <option value="champagne">🥂 Champagne Silk</option>
                      <option value="midnight">🌙 Midnight Luxury</option>
                      <option value="burgundy">🍷 Bordeaux Velvet</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ======================================================================
          MAIN WRAPPER WITH OVERLAY
          ====================================================================== */}
      <div className="relative rounded-3xl overflow-hidden min-h-[460px] flex items-center justify-center p-2 sm:p-4">
        {/* Child Content (Behind the overlay blur or fully visible when unlocked) */}
        <div className={`w-full transition-all duration-700 ${isCurrentlyLocked ? 'filter blur-sm select-none pointer-events-none' : 'opacity-100'}`}>
          {children || defaultGiftContent}
        </div>

        {/* OVERLAY: Active when Locked */}
        <AnimatePresence>
          {isCurrentlyLocked && (
            <motion.div
              key="password-lock-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className={`absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 ${getBlurClass()}`}
            >
              {/* Animated Floating Card */}
              <motion.div
                key={shakeKey}
                initial={{ scale: 0.94, opacity: 0, y: 15 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  x: shakeKey % 2 === 1 ? [-8, 8, -6, 6, -3, 3, 0] : 0,
                }}
                transition={{
                  scale: { duration: 0.35 },
                  x: { duration: 0.45, ease: 'easeInOut' },
                }}
                className={`relative w-full max-w-md rounded-3xl p-7 sm:p-9 border backdrop-blur-2xl text-center space-y-6 ${currentStyle.cardBg}`}
              >
                {/* Background Ambient Glow */}
                <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-b ${currentStyle.glowGradient} rounded-full blur-2xl pointer-events-none`} />

                {/* Animated Lock Icon Badge */}
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <motion.div
                    animate={unlockSuccessAnim ? { scale: [1, 1.25, 1], rotate: [0, -15, 0] } : {}}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-romantic-500 to-champagne-400 p-0.5 shadow-romantic-md flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-velvet-900 flex items-center justify-center">
                      {unlockSuccessAnim ? (
                        <Unlock className="w-7 h-7 text-emerald-500 animate-bounce" />
                      ) : (
                        <Lock className={`w-7 h-7 ${currentStyle.accentColor}`} />
                      )}
                    </div>
                  </motion.div>

                  {/* Little Sparkle Accent */}
                  <Sparkles className="w-4 h-4 text-champagne-400 absolute -top-1 -right-1 animate-pulse" />
                </div>

                {/* Header Information */}
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle.badgeBg}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Private &amp; Protected Gift Vault</span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-romantic-950 dark:text-white">
                    Unlock Your Gift
                  </h3>

                  <p className="text-xs text-velvet-600 dark:text-velvet-300 leading-relaxed">
                    {senderName ? (
                      <>
                        <span className="font-semibold text-romantic-600 dark:text-champagne-400">{senderName}</span> has secured this keepsake with a secret passcode for <span className="font-semibold text-romantic-600 dark:text-champagne-400">{recipientName}</span>.
                      </>
                    ) : (
                      'Please enter the recipient passcode to reveal your luxury hamper and handwritten sentiment.'
                    )}
                  </p>
                </div>

                {/* Password Input Form */}
                <form onSubmit={handleUnlockAttempt} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-romantic-500" />
                        Secret Passcode *
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-[11px] font-semibold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                      </button>
                    </label>

                    {/* Input Container */}
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={inputPassword}
                        onChange={(e) => {
                          setInputPassword(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="Enter the secret word or PIN..."
                        autoFocus
                        className={`w-full px-4 py-3.5 pr-12 rounded-2xl bg-white/90 dark:bg-velvet-800/90 border border-romantic-200 dark:border-velvet-700 text-sm font-medium text-velvet-900 dark:text-white outline-none transition-all placeholder:text-velvet-400 shadow-inner ${currentStyle.inputBorder}`}
                      />

                      {/* Password Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-velvet-400 hover:text-velvet-700 dark:hover:text-white transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Hint Drawer */}
                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 rounded-2xl bg-champagne-50/90 dark:bg-velvet-950/70 border border-champagne-200 dark:border-champagne-800 text-xs text-velvet-800 dark:text-champagne-200 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-champagne-600 dark:text-champagne-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[11px] uppercase tracking-wider text-champagne-700 dark:text-champagne-400">
                                Clue from {senderName}:
                              </strong>
                              <span>{secretHint}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Feedback Message */}
                    {errorMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1.5 pt-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifying || unlockSuccessAnim}
                    className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${currentStyle.buttonClass} disabled:opacity-75`}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Secret...</span>
                      </>
                    ) : unlockSuccessAnim ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Vault Unlocked!</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Unlock Gift Experience</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Safe Note */}
                <div className="pt-2 border-t border-romantic-100/70 dark:border-velvet-800/70 flex items-center justify-center gap-1.5 text-[11px] text-velvet-400 font-medium">
                  <Lock className="w-3 h-3 text-romantic-400" />
                  <span>256-Bit Encrypted Romantic Keepsake Vault</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
