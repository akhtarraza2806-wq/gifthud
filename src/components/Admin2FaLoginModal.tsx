import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap
} from 'lucide-react';
import {
  generateTotpCode,
  verifyTotpCode,
  generateOtpAuthUrl,
  getTotpRemainingSeconds,
  Admin2FaConfig,
  AdminAuthSession,
  saveAdminAuthSession
} from '../utils/totpAuth';

interface Admin2FaLoginModalProps {
  isOpen: boolean;
  onSuccess: (session: AdminAuthSession) => void;
  onClose?: () => void;
  onCancel?: () => void;
  config: Admin2FaConfig;
  onUpdateConfig?: (newConfig: Admin2FaConfig) => void;
  challengeActionTitle?: string;
  challengeActionDesc?: string;
  actionTitle?: string;
  actionDescription?: string;
}

export const Admin2FaLoginModal: React.FC<Admin2FaLoginModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  onCancel,
  config,
  onUpdateConfig,
  challengeActionTitle,
  challengeActionDesc,
  actionTitle = 'Executive Atelier 2FA Verification',
  actionDescription = 'Enter the 6-digit verification code from your Authenticator app to proceed.',
}) => {
  const displayTitle = challengeActionTitle || actionTitle;
  const displayDescription = challengeActionDesc || actionDescription;
  const handleDismiss = onClose || onCancel || (() => {});

  // Authentication steps: 'password' | 'totp' | 'backup' | 'setup_guide'
  const [step, setStep] = useState<'password' | 'totp' | 'backup'>('password');
  
  // Password Step
  const [adminEmail, setAdminEmail] = useState('concierge@giftlove.luxury');
  const [adminPassword, setAdminPassword] = useState('Atelier-Admin-2026');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // TOTP Code Step
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [liveSimulatorCode, setLiveSimulatorCode] = useState<string>('000000');
  const [showSimulator, setShowSimulator] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Backup code step
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [backupError, setBackupError] = useState<string | null>(null);

  // Setup / QR view drawer
  const [showQrDrawer, setShowQrDrawer] = useState(false);

  // Synchronize Live TOTP Simulation for tester convenience
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const update = async () => {
      setRemainingSeconds(getTotpRemainingSeconds());
      if (config?.secret) {
        const code = await generateTotpCode(config.secret);
        setLiveSimulatorCode(code);
      }
    };

    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [config?.secret]);

  // Focus the first input on TOTP step
  useEffect(() => {
    if (step === 'totp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Simple demo credential validation
    if (!adminEmail.includes('@')) {
      setPasswordError('Please provide a valid concierge administrator email address.');
      return;
    }
    if (adminPassword.length < 6) {
      setPasswordError('Invalid password. Minimum 6 characters required.');
      return;
    }

    // Advance to 2FA step
    setStep('totp');
  };

  const handleDigitChange = (index: number, value: string) => {
    // Handle pasting 6 digits at once
    if (value.length > 1) {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || '';
        }
        setDigits(nextDigits);
        if (clean.length === 6) {
          triggerVerify(clean);
        } else {
          const nextIndex = Math.min(clean.length, 5);
          inputRefs.current[nextIndex]?.focus();
        }
      }
      return;
    }

    const singleDigit = value.replace(/\D/g, '');
    const nextDigits = [...digits];
    nextDigits[index] = singleDigit;
    setDigits(nextDigits);
    setTotpError(null);

    // Auto advance
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all 6 filled
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6) {
      triggerVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerVerify = async (code: string) => {
    setIsVerifying(true);
    setTotpError(null);

    try {
      const result = await verifyTotpCode(code, config.secret);
      if (result.valid) {
        const session: AdminAuthSession = {
          isAuthenticated: true,
          is2FaVerified: true,
          adminEmail,
          adminName: 'Seraphina Dupré (Executive Admin)',
          verifiedAt: Date.now(),
          expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours session
        };
        saveAdminAuthSession(session);
        onSuccess(session);
      } else {
        setTotpError(result.reason || 'Invalid 6-digit code. Please check your authenticator.');
      }
    } catch (err) {
      setTotpError('Verification error. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError(null);

    const cleanInput = backupCodeInput.trim().toUpperCase();
    const availableBackupCodes = config.backupCodes || [];
    const usedBackupCodes = config.usedBackupCodes || [];

    if (availableBackupCodes.includes(cleanInput) && !usedBackupCodes.includes(cleanInput)) {
      // Mark code as used
      if (onUpdateConfig) {
        onUpdateConfig({
          ...config,
          usedBackupCodes: [...usedBackupCodes, cleanInput],
        });
      }

      const session: AdminAuthSession = {
        isAuthenticated: true,
        is2FaVerified: true,
        adminEmail,
        adminName: 'Seraphina Dupré (Executive Admin - Backup Key)',
        verifiedAt: Date.now(),
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };
      saveAdminAuthSession(session);
      onSuccess(session);
    } else {
      setBackupError('Invalid, expired, or already used recovery backup code.');
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const otpAuthUrl = generateOtpAuthUrl(
    config.secret,
    adminEmail,
    'Giftlove Atelier Haute Gifting'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleDismiss}
        className="fixed inset-0 bg-velvet-950/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white dark:bg-velvet-900 rounded-[32px] overflow-hidden border border-romantic-200 dark:border-velvet-700 shadow-2xl z-10 my-auto"
      >
        {/* Header Ribbon */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-romantic-500/10 via-champagne-500/10 to-rose-500/10 border-b border-romantic-100 dark:border-velvet-800 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-romantic-500 to-rose-600 text-white shadow-romantic-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-romantic-600 dark:text-champagne-400">
                    High Security Chamber
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    RFC 6238 TOTP
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-romantic-950 dark:text-white">
                  {displayTitle}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-velvet-400 hover:text-velvet-600 dark:hover:text-white p-1 rounded-full text-xs font-semibold"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-velvet-600 dark:text-velvet-300 mt-2">
            {displayDescription}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* STEP 1: PASSWORD AUTH */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-xs text-velvet-600 dark:text-velvet-300">
                Sign in with your Atelier administrative credentials before completing two-factor authentication.
              </p>

              {passwordError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                  Concierge Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white pr-10"
                  />
                  <Lock className="w-4 h-4 text-velvet-400 absolute right-3.5 top-3" />
                </div>
                <p className="text-[10px] text-velvet-400 dark:text-velvet-500 mt-1">
                  Default pre-filled demo credential: <span className="font-mono font-bold">Atelier-Admin-2026</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-romantic-500 via-rose-500 to-champagne-500 text-white font-bold text-xs shadow-romantic-md hover:shadow-romantic-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to 2FA Authenticator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: TOTP CODE ENTRY */}
          {step === 'totp' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <p className="text-xs text-velvet-600 dark:text-velvet-300">
                  {actionDescription}
                </p>
                <p className="text-[11px] font-mono text-romantic-600 dark:text-champagne-400 font-semibold">
                  Account: {adminEmail}
                </p>
              </div>

              {totpError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{totpError}</span>
                </motion.div>
              )}

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border transition-all outline-none ${
                      digit
                        ? 'border-romantic-500 bg-romantic-50/70 dark:bg-romantic-950/40 text-romantic-950 dark:text-white shadow-sm'
                        : 'border-romantic-200 dark:border-velvet-700 bg-romantic-50/30 dark:bg-velvet-800/60 text-velvet-900 dark:text-white'
                    } focus:ring-2 focus:ring-romantic-400`}
                  />
                ))}
              </div>

              {/* Timer Progress Bar */}
              <div className="p-3 rounded-2xl bg-romantic-50/60 dark:bg-velvet-800/60 border border-romantic-200/60 dark:border-velvet-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-velvet-600 dark:text-velvet-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-romantic-500" />
                  <span>Next code refresh in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-romantic-200 dark:bg-velvet-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-romantic-500 to-champagne-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(remainingSeconds / 30) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-romantic-700 dark:text-champagne-400">
                    {remainingSeconds}s
                  </span>
                </div>
              </div>

              {/* Live Testing Simulator & QR Code Helper */}
              <div className="pt-2 border-t border-romantic-100 dark:border-velvet-800 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="text-xs font-semibold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-champagne-500" />
                    <span>{showSimulator ? 'Hide Live Token Simulator' : 'Show Live Token Simulator (1-Click Fill)'}</span>
                    {showSimulator ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQrDrawer(!showQrDrawer)}
                    className="text-xs font-semibold text-velvet-500 dark:text-velvet-400 hover:text-romantic-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{showQrDrawer ? 'Close QR Code' : 'Scan Authenticator QR'}</span>
                  </button>
                </div>

                {/* Simulator Dropdown */}
                {showSimulator && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-champagne-50 to-romantic-50 dark:from-velvet-950 dark:to-velvet-800 border border-champagne-300 dark:border-velvet-700 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-velvet-700 dark:text-velvet-300">
                        <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
                        <span>Built-in RFC 6238 TOTP Simulator</span>
                      </div>
                      <span className="text-[10px] font-mono bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-champagne-300 px-2 py-0.5 rounded-full font-bold">
                        Active Token
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-velvet-900 p-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700">
                      <span className="font-mono text-xl font-bold tracking-widest text-romantic-600 dark:text-champagne-400">
                        {liveSimulatorCode.slice(0, 3)} {liveSimulatorCode.slice(3)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const arr = liveSimulatorCode.split('');
                            setDigits(arr);
                            triggerVerify(liveSimulatorCode);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-romantic-500 hover:bg-romantic-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Autofill &amp; Verify</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(liveSimulatorCode, 'code')}
                          className="p-1.5 rounded-lg border border-romantic-200 dark:border-velvet-700 hover:bg-romantic-50 text-velvet-600 dark:text-velvet-300 text-xs"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* QR Code Drawer */}
                {showQrDrawer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-white dark:bg-velvet-950 border border-romantic-200 dark:border-velvet-700 text-center space-y-3"
                  >
                    <p className="text-xs font-semibold text-velvet-700 dark:text-velvet-300">
                      Scan with Google Authenticator, Authy, or 1Password:
                    </p>

                    <div className="inline-block p-3 bg-white rounded-2xl border-2 border-champagne-300 shadow-md">
                      <QRCodeSVG
                        value={otpAuthUrl}
                        size={150}
                        level="M"
                        includeMargin={false}
                        fgColor="#1e1b4b"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-velvet-400 uppercase font-mono">
                        Base32 Secret Key
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <code className="px-3 py-1 bg-romantic-50 dark:bg-velvet-800 rounded-lg text-xs font-mono font-bold text-romantic-700 dark:text-champagne-300">
                          {config.secret}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(config.secret, 'secret')}
                          className="p-1.5 rounded-lg border border-romantic-200 dark:border-velvet-700 hover:bg-romantic-50 text-velvet-600 dark:text-velvet-300 text-xs"
                          title="Copy Secret"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons & Alternate recovery options */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="text-xs font-semibold text-velvet-500 hover:text-velvet-700 dark:hover:text-white"
                >
                  ← Back to Login
                </button>

                <button
                  type="button"
                  onClick={() => setStep('backup')}
                  className="text-xs font-semibold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Use Emergency Recovery Code</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BACKUP RECOVERY CODE */}
          {step === 'backup' && (
            <form onSubmit={handleBackupSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-champagne-100 dark:bg-velvet-800 text-champagne-600 dark:text-champagne-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-romantic-950 dark:text-white">
                  Emergency Recovery Code
                </h4>
                <p className="text-xs text-velvet-600 dark:text-velvet-300">
                  Enter one of your single-use emergency recovery backup keys generated during 2FA setup.
                </p>
              </div>

              {backupError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{backupError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                  8-Character Backup Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8F92-4A1C"
                  value={backupCodeInput}
                  onChange={(e) => setBackupCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white uppercase"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Sample Available Recovery Codes:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {config.backupCodes?.filter(c => !config.usedBackupCodes?.includes(c)).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBackupCodeInput(c)}
                      className="px-2 py-0.5 rounded bg-white dark:bg-velvet-900 border border-amber-300 dark:border-amber-700 font-mono text-[10px] hover:border-romantic-400 cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('totp')}
                  className="px-4 py-2 text-xs font-semibold text-velvet-500 hover:text-velvet-700"
                >
                  ← Back to TOTP
                </button>
                <button
                  type="submit"
                  className="btn-romantic text-xs px-5 py-2.5 shadow-romantic-sm"
                >
                  Verify Backup Key
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
