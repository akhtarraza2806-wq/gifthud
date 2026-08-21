import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Download,
  AlertTriangle,
  Lock,
  Sparkles,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  generateTotpSecret,
  generateOtpAuthUrl,
  generateBackupCodes,
  verifyTotpCode,
  generateTotpCode,
  getTotpRemainingSeconds,
  Admin2FaConfig,
  AdminAuthSession,
  saveAdmin2FaConfig
} from '../utils/totpAuth';

interface Admin2FaSettingsManagerProps {
  config: Admin2FaConfig;
  session?: AdminAuthSession | null;
  onConfigUpdate?: (newConfig: Admin2FaConfig) => void;
  onConfigChange?: (newConfig: Admin2FaConfig) => void;
  onRequestVerify?: () => void;
  showToast?: (msg: string) => void;
}

export const Admin2FaSettingsManager: React.FC<Admin2FaSettingsManagerProps> = ({
  config,
  session,
  onConfigUpdate,
  onConfigChange,
  onRequestVerify,
  showToast,
}) => {
  const triggerConfigChange = (newCfg: Admin2FaConfig) => {
    if (onConfigUpdate) onConfigUpdate(newCfg);
    if (onConfigChange) onConfigChange(newCfg);
  };

  const [isReconfiguring, setIsReconfiguring] = useState(false);
  const [tempSecret, setTempSecret] = useState(config.secret);
  const [tempBackupCodes, setTempBackupCodes] = useState<string[]>(config.backupCodes || []);
  const [verifyTestCode, setVerifyTestCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  
  // Real-time live code tracker
  const [liveCode, setLiveCode] = useState('000000');
  const [remainingSec, setRemainingSec] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const activeSecret = isReconfiguring ? tempSecret : config.secret;
    const update = async () => {
      setRemainingSec(getTotpRemainingSeconds());
      if (activeSecret) {
        const c = await generateTotpCode(activeSecret);
        setLiveCode(c);
      }
    };
    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [config.secret, tempSecret, isReconfiguring]);

  const handleStartReconfig = () => {
    const newSecret = generateTotpSecret(16);
    const newBackup = generateBackupCodes(6);
    setTempSecret(newSecret);
    setTempBackupCodes(newBackup);
    setVerifyTestCode('');
    setVerifyError(null);
    setIsReconfiguring(true);
  };

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  const handleConfirmReconfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    const result = await verifyTotpCode(verifyTestCode, tempSecret);
    if (result.valid) {
      const updated: Admin2FaConfig = {
        ...config,
        isEnabled: true,
        secret: tempSecret,
        enrolledAt: new Date().toISOString(),
        backupCodes: tempBackupCodes,
        usedBackupCodes: [],
      };
      saveAdmin2FaConfig(updated);
      triggerConfigChange(updated);
      setIsReconfiguring(false);
      notify('TOTP 2FA Secret updated and enrolled successfully!');
    } else {
      setVerifyError(result.reason || 'Verification code failed. Please check your authenticator.');
    }
  };

  const handleToggleRequireForActions = () => {
    const updated: Admin2FaConfig = {
      ...config,
      requireForSensitiveActions: !config.requireForSensitiveActions,
    };
    saveAdmin2FaConfig(updated);
    triggerConfigChange(updated);
    notify(
      updated.requireForSensitiveActions
        ? '2FA is now strictly required for high-risk administrative actions.'
        : '2FA requirement for inline actions relaxed.'
    );
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(isReconfiguring ? tempSecret : config.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    notify('Base32 Secret copied to clipboard.');
  };

  const copyBackupCodesToClipboard = () => {
    const codes = config.backupCodes.join('\n');
    navigator.clipboard.writeText(`Giftlove Atelier Emergency 2FA Backup Codes:\n${codes}`);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    notify('Emergency recovery codes copied.');
  };

  const downloadBackupCodes = () => {
    const content = `GIFTLOVE ATELIER - TWO-FACTOR AUTHENTICATION RECOVERY CODES
Generated: ${new Date().toLocaleString()}
Account: concierge@giftlove.luxury

Keep these single-use codes in a secure vault:
------------------------------------------------
${config.backupCodes.map((c, i) => `${i + 1}. ${c} ${config.usedBackupCodes?.includes(c) ? '(USED)' : '(AVAILABLE)'}`).join('\n')}
------------------------------------------------`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'giftlove-2fa-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
    notify('Backup codes text file downloaded.');
  };

  const qrUrl = generateOtpAuthUrl(
    isReconfiguring ? tempSecret : config.secret,
    'concierge@giftlove.luxury',
    'Giftlove Atelier'
  );

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-romantic-100 dark:border-velvet-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-romantic-500 to-rose-600 text-white shadow-romantic-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg sm:text-xl text-romantic-950 dark:text-white">
                Two-Factor Authentication (2FA / TOTP)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active &amp; Enforced
              </span>
            </div>
            <p className="text-xs text-velvet-500 dark:text-velvet-400 mt-0.5">
              Protects sensitive administrative actions, wire approvals, and store configuration via RFC 6238 TOTP.
            </p>
          </div>
        </div>

        {!isReconfiguring && (
          <button
            type="button"
            onClick={handleStartReconfig}
            className="btn-romantic-outline text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Enroll / Reset Authenticator</span>
          </button>
        )}
      </div>

      {/* RECONFIGURATION MODAL / DRAWER */}
      <AnimatePresence>
        {isReconfiguring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-romantic-50/70 to-champagne-50/50 dark:from-velvet-950 dark:to-velvet-850 border border-romantic-300 dark:border-velvet-700 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-romantic-600 dark:text-champagne-400" />
                <h4 className="font-display font-bold text-base text-romantic-950 dark:text-white">
                  Enroll New Authenticator Device
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsReconfiguring(false)}
                className="text-xs font-semibold text-velvet-500 hover:text-velvet-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-velvet-900 rounded-2xl border border-romantic-200 dark:border-velvet-700 text-center space-y-3">
                <div className="p-3 bg-white rounded-2xl border-2 border-champagne-300 shadow-md">
                  <QRCodeSVG
                    value={qrUrl}
                    size={170}
                    level="M"
                    includeMargin={false}
                    fgColor="#1e1b4b"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-velvet-400">
                    Secret Key
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <code className="px-2.5 py-1 bg-romantic-50 dark:bg-velvet-800 rounded text-xs font-mono font-bold text-romantic-700 dark:text-champagne-300">
                      {tempSecret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecretToClipboard}
                      className="p-1 rounded hover:bg-romantic-100 text-velvet-600"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions & Confirmation Form */}
              <form onSubmit={handleConfirmReconfig} className="space-y-4">
                <div className="space-y-2 text-xs text-velvet-600 dark:text-velvet-300">
                  <p className="font-semibold text-romantic-950 dark:text-white">
                    Setup Steps:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Google Authenticator, Authy, or 1Password.</li>
                    <li>Scan the QR code or manually enter the secret key above.</li>
                    <li>Enter the generated 6-digit code below to confirm setup.</li>
                  </ol>
                </div>

                {verifyError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      maxLength={6}
                      value={verifyTestCode}
                      onChange={(e) => setVerifyTestCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-center font-mono text-base font-bold tracking-widest outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                    <button
                      type="button"
                      onClick={() => setVerifyTestCode(liveCode)}
                      className="px-3 py-2 rounded-2xl bg-champagne-100 hover:bg-champagne-200 dark:bg-velvet-800 text-champagne-800 dark:text-champagne-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Autofill ({liveCode})</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-romantic-500 hover:bg-romantic-600 text-white font-bold text-xs shadow-romantic-sm transition-all cursor-pointer"
                >
                  Confirm &amp; Save Authenticator
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Active 2FA Status & Live Monitor */}
        <div className="p-5 rounded-2xl bg-romantic-50/40 dark:bg-velvet-950/40 border border-romantic-100 dark:border-velvet-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
              Live TOTP Cycle Monitor
            </span>
            <div className="flex items-center gap-1.5 text-xs text-romantic-600 dark:text-champagne-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{remainingSec}s remaining</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-velvet-400 block mb-0.5">
                Current Time-Based Code
              </span>
              <span className="font-mono text-2xl font-bold tracking-widest text-romantic-600 dark:text-champagne-400">
                {liveCode.slice(0, 3)} {liveCode.slice(3)}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-romantic-100/60 dark:bg-velvet-800 text-romantic-600 dark:text-champagne-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 text-xs text-velvet-600 dark:text-velvet-300">
            <div className="flex justify-between py-1 border-b border-romantic-100 dark:border-velvet-800">
              <span className="text-velvet-500">Algorithm</span>
              <span className="font-mono font-semibold text-velvet-800 dark:text-white">HMAC-SHA1 (RFC 6238)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-romantic-100 dark:border-velvet-800">
              <span className="text-velvet-500">Time Window Step</span>
              <span className="font-mono font-semibold text-velvet-800 dark:text-white">30 Seconds</span>
            </div>
            <div className="flex justify-between py-1 border-b border-romantic-100 dark:border-velvet-800">
              <span className="text-velvet-500">Enrolled Date</span>
              <span className="font-semibold text-velvet-800 dark:text-white">
                {config.enrolledAt ? new Date(config.enrolledAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Security Policies & Inline Action Enforcement */}
        <div className="p-5 rounded-2xl bg-romantic-50/40 dark:bg-velvet-950/40 border border-romantic-100 dark:border-velvet-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400 block">
              Administrative Protection Policies
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-700/80">
              <div className="space-y-0.5 pr-3">
                <span className="text-xs font-bold text-romantic-950 dark:text-white block">
                  Re-Authenticate for Sensitive Actions
                </span>
                <p className="text-[11px] text-velvet-500 dark:text-velvet-400">
                  Require 2FA verification before wire approvals and changing store currencies.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleRequireForActions}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.requireForSensitiveActions ? 'bg-romantic-500' : 'bg-velvet-300 dark:bg-velvet-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    config.requireForSensitiveActions ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Backup Codes Widget */}
          <div className="p-4 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-romantic-950 dark:text-white">
                <KeyRound className="w-3.5 h-3.5 text-champagne-500" />
                <span>Emergency Backup Codes ({config.backupCodes.length - (config.usedBackupCodes?.length || 0)} available)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyBackupCodesToClipboard}
                  className="text-xs font-semibold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={downloadBackupCodes}
                  className="text-xs font-semibold text-velvet-600 dark:text-velvet-300 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {config.backupCodes.map((code, idx) => {
                const isUsed = config.usedBackupCodes?.includes(code);
                return (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 rounded-lg border text-center font-mono text-[11px] font-bold ${
                      isUsed
                        ? 'bg-velvet-100 dark:bg-velvet-800/50 border-velvet-300 dark:border-velvet-700 text-velvet-400 line-through'
                        : 'bg-romantic-50/50 dark:bg-velvet-800 border-romantic-200 dark:border-velvet-700 text-romantic-800 dark:text-champagne-300'
                    }`}
                  >
                    {code}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
