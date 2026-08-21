import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  Crown,
  Palette,
  ExternalLink,
  QrCode as QrCodeIcon,
  RefreshCw,
  Gift,
  Lock,
  ShieldCheck,
  KeyRound,
  X,
  FileText
} from 'lucide-react';
import { downloadCanvasAsPng, downloadFramedGiftQrCard, FramedQrCardOptions } from '../utils/qrCodeGenerator';
import { exportKeepsakeAsPdf } from '../utils/pdfKeepsakeGenerator';
import { PasswordProtection } from './PasswordProtection';
import { useGiftStore } from '../store/useGiftStore';

export interface GiftQrCodeCardProps {
  initialUrl?: string;
  initialRecipient?: string;
  initialSender?: string;
  initialGiftTitle?: string;
  initialTheme?: 'blush' | 'champagne' | 'midnight' | 'burgundy';
}

export const GiftQrCodeCard: React.FC<GiftQrCodeCardProps> = ({
  initialUrl,
  initialRecipient,
  initialSender,
  initialGiftTitle,
  initialTheme,
}) => {
  const storeGiftData = useGiftStore((s) => s.giftData);
  const updateGiftData = useGiftStore((s) => s.updateGiftData);
  const showToast = useGiftStore((s) => s.showToast);

  const [giftUrl, setGiftUrl] = useState<string>(initialUrl || storeGiftData.giftUrl);
  const [recipientName, setRecipientName] = useState<string>(initialRecipient || storeGiftData.recipientName);
  const [senderName, setSenderName] = useState<string>(initialSender || storeGiftData.senderName);
  const [giftTitle, setGiftTitle] = useState<string>(initialGiftTitle || storeGiftData.giftTitle);
  const [tagline, setTagline] = useState<string>(storeGiftData.tagline);
  const [theme, setTheme] = useState<'blush' | 'champagne' | 'midnight' | 'burgundy'>(initialTheme || storeGiftData.selectedTheme);
  const [sealIcon, setSealIcon] = useState<'rose' | 'heart' | 'ring' | 'crown'>('heart');
  const [includeCenterHeart, setIncludeCenterHeart] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(storeGiftData.isPasswordProtected);
  const [giftPassword, setGiftPassword] = useState<string>(storeGiftData.giftPassword);
  const [giftHint, setGiftHint] = useState<string>(storeGiftData.giftHint);
  const [showRecipientModal, setShowRecipientModal] = useState<boolean>(false);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(giftUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Download raw QR code PNG
  const handleDownloadRawQr = () => {
    if (qrCanvasRef.current) {
      downloadCanvasAsPng(qrCanvasRef.current, `qr-code-${recipientName.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  };

  // Download full luxury framed gift card PNG
  const handleDownloadFramedCard = async () => {
    try {
      setIsDownloading(true);
      await downloadFramedGiftQrCard({
        qrCanvasElement: qrCanvasRef.current,
        giftUrl,
        recipientName,
        senderName,
        giftTitle,
        tagline,
        theme,
        sealIcon,
        fileName: `giftlove-card-${recipientName.toLowerCase().replace(/\s+/g, '-') || 'gift'}`,
      });
    } catch (error) {
      console.error('Error generating card PNG:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download printable luxury PDF keepsake
  const handleDownloadPdfCard = async () => {
    try {
      setIsDownloading(true);
      const qrDataUrl = qrCanvasRef.current ? qrCanvasRef.current.toDataURL('image/png') : undefined;
      const themeMapping = theme === 'burgundy' ? 'blush' : theme;
      await exportKeepsakeAsPdf({
        template: 'memory_card',
        recipientName,
        senderName,
        title: giftTitle,
        message: tagline,
        theme: themeMapping,
        sealType: sealIcon === 'crown' ? 'crown' : sealIcon === 'rose' ? 'rose' : sealIcon === 'ring' ? 'ring' : 'heart',
        includeGoldFoil: true,
        includeWatermark: true,
        includeQrCode: true,
        qrDataUrl,
        giftUrl,
        pageSize: 'a4'
      });
    } catch (error) {
      console.error('Error generating PDF card:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // QR colors according to theme
  const getQrColors = () => {
    switch (theme) {
      case 'champagne':
        return { fg: '#453518', bg: '#ffffff' };
      case 'midnight':
        return { fg: '#2b0c1c', bg: '#ffffff' };
      case 'burgundy':
        return { fg: '#380413', bg: '#ffffff' };
      case 'blush':
      default:
        return { fg: '#50091d', bg: '#ffffff' };
    }
  };

  // Theme styling for the preview container
  const getThemeClasses = () => {
    switch (theme) {
      case 'champagne':
        return {
          cardBg: 'bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e7] to-[#ede2cc] text-[#261a06]',
          border: 'border-champagne-300',
          accentText: 'text-champagne-800',
          scriptText: 'text-champagne-700',
          foilBorder: 'border-champagne-400/60',
          sealBg: 'from-champagne-600 via-champagne-500 to-champagne-700',
          qrFrame: 'bg-white border-champagne-300 shadow-md',
          badge: 'bg-champagne-700 text-white',
        };
      case 'midnight':
        return {
          cardBg: 'bg-gradient-to-br from-[#17060e] via-[#260917] to-[#0d0208] text-romantic-100',
          border: 'border-velvet-700',
          accentText: 'text-romantic-300',
          scriptText: 'text-romantic-400',
          foilBorder: 'border-champagne-300/40',
          sealBg: 'from-romantic-600 via-romantic-500 to-velvet-800',
          qrFrame: 'bg-white border-romantic-300 shadow-romantic-md',
          badge: 'bg-romantic-600 text-white',
        };
      case 'burgundy':
        return {
          cardBg: 'bg-gradient-to-br from-[#4c051a] via-[#881337] to-[#31020f] text-white',
          border: 'border-romantic-800',
          accentText: 'text-romantic-200',
          scriptText: 'text-champagne-200',
          foilBorder: 'border-champagne-300/50',
          sealBg: 'from-romantic-500 via-romantic-600 to-romantic-800',
          qrFrame: 'bg-white border-romantic-400 shadow-xl',
          badge: 'bg-champagne-500 text-velvet-950 font-bold',
        };
      case 'blush':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-[#fff5f6] via-[#ffe4e8] to-[#fecdd6] text-romantic-950',
          border: 'border-romantic-300',
          accentText: 'text-romantic-700',
          scriptText: 'text-romantic-600',
          foilBorder: 'border-champagne-400/60',
          sealBg: 'from-romantic-600 via-romantic-500 to-romantic-800',
          qrFrame: 'bg-white border-romantic-200 shadow-romantic-md',
          badge: 'bg-romantic-600 text-white',
        };
    }
  };

  const themeStyle = getThemeClasses();
  const qrColors = getQrColors();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. CUSTOMIZATION CONTROLS PANEL */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-romantic-100 dark:border-velvet-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600 dark:text-romantic-400">
                <QrCodeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-romantic-900 dark:text-white">
                  QR Gift Generator
                </h3>
                <p className="text-xs text-velvet-500 dark:text-velvet-400">
                  Embed links into a luxury physical gift keepsake card
                </p>
              </div>
            </div>
          </div>

          {/* Gift URL Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5 flex items-center justify-between">
              <span>Gift Reveal URL</span>
              <span className="text-[10px] text-romantic-500 font-mono">Real-time QR</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={giftUrl}
                onChange={(e) => setGiftUrl(e.target.value)}
                placeholder="https://giftlove.app/reveal/..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
              />
              <button
                onClick={handleCopyLink}
                title="Copy Link"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-velvet-400 hover:text-romantic-600 hover:bg-romantic-100 dark:hover:bg-velvet-700 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Recipient & Sender Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                Recipient
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Eleanor"
                className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                From / Sign-off
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Alexander"
                className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
              />
            </div>
          </div>

          {/* Gift Title & Tagline */}
          <div>
            <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
              Gift Experience Title
            </label>
            <input
              type="text"
              value={giftTitle}
              onChange={(e) => setGiftTitle(e.target.value)}
              placeholder="The Eternal Rose Hamper"
              className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
              Scan Instructions Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Scan with camera..."
              className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
            />
          </div>

          {/* Card Theme Picker */}
          <div>
            <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">
              Branded Luxury Frame Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'blush', name: 'Petal Blush', color: 'bg-romantic-100 border-romantic-300 text-romantic-900' },
                { id: 'champagne', name: 'Champagne Silk', color: 'bg-champagne-100 border-champagne-300 text-champagne-950' },
                { id: 'midnight', name: 'Midnight Plum', color: 'bg-velvet-950 border-velvet-700 text-romantic-200' },
                { id: 'burgundy', name: 'Royal Bordeaux', color: 'bg-romantic-900 border-romantic-700 text-white' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${item.color} ${
                    theme === item.id ? 'ring-2 ring-romantic-500 scale-[1.02] shadow-sm' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <span>{item.name}</span>
                  {theme === item.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Wax Seal Selector */}
          <div>
            <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">
              Wax Seal Emblem
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'heart', label: '💖 Heart' },
                { id: 'rose', label: '🌹 Rose' },
                { id: 'ring', label: '💍 Gem' },
                { id: 'crown', label: '👑 Crown' },
              ].map((seal) => (
                <button
                  key={seal.id}
                  onClick={() => setSealIcon(seal.id as any)}
                  className={`py-2 px-1 text-xs rounded-xl border text-center transition-all ${
                    sealIcon === seal.id
                      ? 'bg-romantic-500 text-white border-romantic-500 shadow-romantic-sm'
                      : 'bg-white dark:bg-velvet-800 border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300'
                  }`}
                >
                  {seal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Heart Center Icon */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-velvet-700 dark:text-velvet-300">
              <input
                type="checkbox"
                checked={includeCenterHeart}
                onChange={(e) => setIncludeCenterHeart(e.target.checked)}
                className="w-4 h-4 rounded text-romantic-500 focus:ring-romantic-400 border-romantic-300"
              />
              <span>Include Giftlove heart emblem at center of QR code</span>
            </label>
          </div>

          {/* Password Protection Vault Toggle */}
          <div className="p-4 rounded-2xl bg-romantic-50/70 dark:bg-velvet-800/60 border border-romantic-200 dark:border-velvet-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-velvet-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="w-4 h-4 rounded text-romantic-500 focus:ring-romantic-400 border-romantic-300"
                />
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-romantic-500" />
                  Enable Password Protection Vault
                </span>
              </label>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-romantic-100 dark:bg-velvet-700 text-romantic-700 dark:text-romantic-300">
                Security
              </span>
            </div>

            {isPasswordProtected && (
              <div className="space-y-3 pt-2 border-t border-romantic-200/60 dark:border-velvet-700">
                <div>
                  <label className="block text-[11px] font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Secret Passcode:
                  </label>
                  <input
                    type="text"
                    value={giftPassword}
                    onChange={(e) => setGiftPassword(e.target.value)}
                    placeholder="e.g. forever"
                    className="w-full px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-900 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Romantic Hint for {recipientName || 'Recipient'}:
                  </label>
                  <input
                    type="text"
                    value={giftHint}
                    onChange={(e) => setGiftHint(e.target.value)}
                    placeholder="e.g. Our anniversary date"
                    className="w-full px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-900 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowRecipientModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-romantic-500 hover:bg-romantic-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-romantic-sm transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Preview Recipient Unlocking Experience</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 space-y-3">
            <button
              onClick={handleDownloadFramedCard}
              disabled={isDownloading}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-romantic-500 via-romantic-600 to-champagne-500 hover:from-romantic-600 hover:to-champagne-600 text-white font-semibold text-sm shadow-romantic-md hover:shadow-romantic-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Keepsake...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Branded Frame Card (PNG)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPdfCard}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 rounded-xl bg-romantic-50 dark:bg-velvet-800 border border-romantic-300 dark:border-velvet-700 hover:border-romantic-500 text-romantic-800 dark:text-champagne-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-romantic-500" />
              <span>Export as Printable PDF Keepsake (300 DPI)</span>
            </button>

            <button
              onClick={handleDownloadRawQr}
              className="w-full py-2 px-4 rounded-xl bg-white dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 hover:border-romantic-400 text-velvet-700 dark:text-velvet-300 font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <QrCodeIcon className="w-3.5 h-3.5 text-romantic-500" />
              <span>Download Standalone QR Only (PNG)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE STYLISH BRANDED FRAME PREVIEW */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Framed Card Physical Container */}
          <div
            className={`w-full p-8 sm:p-9 rounded-[32px] shadow-2xl transition-all duration-300 relative border ${themeStyle.cardBg} ${themeStyle.border}`}
          >
            {/* Dual Gold Foil Filigree Borders */}
            <div className={`absolute inset-3 border ${themeStyle.foilBorder} rounded-[24px] pointer-events-none`} />
            <div className={`absolute inset-4.5 border border-dashed ${themeStyle.foilBorder} opacity-60 rounded-[20px] pointer-events-none`} />

            {/* Corner Ornaments */}
            <div className="absolute top-5 left-5 text-champagne-400 text-xs pointer-events-none">❖</div>
            <div className="absolute top-5 right-5 text-champagne-400 text-xs pointer-events-none">❖</div>
            <div className="absolute bottom-5 left-5 text-champagne-400 text-xs pointer-events-none">❖</div>
            <div className="absolute bottom-5 right-5 text-champagne-400 text-xs pointer-events-none">❖</div>

            {/* Header Brand Stamp */}
            <div className="text-center mb-5 relative z-10">
              <div className="inline-flex items-center gap-2">
                <div className="h-[1px] w-8 bg-champagne-400/80" />
                <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
                <span className="font-sans font-bold text-[11px] tracking-[0.25em] uppercase text-champagne-600 dark:text-champagne-400">
                  G I F T L O V E
                </span>
                <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
                <div className="h-[1px] w-8 bg-champagne-400/80" />
              </div>

              {/* Recipient & Gift Title */}
              <div className="mt-3 space-y-1">
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Dearest {recipientName || 'Beloved'}
                </h3>
                <p className={`font-serif italic text-sm ${themeStyle.accentText}`}>
                  "{giftTitle}"
                </p>
              </div>
            </div>

            {/* QR Code Container with Luxury Frame */}
            <div className="my-5 flex flex-col items-center justify-center relative z-10">
              <div className={`p-4 sm:p-5 rounded-3xl ${themeStyle.qrFrame} transition-all duration-300 relative group`}>
                {/* Inner Gold Inset Line */}
                <div className="absolute inset-2 border border-champagne-300/40 rounded-2xl pointer-events-none" />

                {/* QRCodeCanvas from qrcode.react */}
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={giftUrl || 'https://giftlove.app'}
                  size={200}
                  level="H"
                  bgColor={qrColors.bg}
                  fgColor={qrColors.fg}
                  includeMargin={false}
                  imageSettings={
                    includeCenterHeart
                      ? {
                          src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23f43f68' stroke='%23ffffff' stroke-width='2'><path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/></svg>",
                          height: 36,
                          width: 36,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Branded "Scan to Reveal" Badge */}
              <div className="mt-3.5">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] tracking-wider uppercase shadow-sm ${themeStyle.badge}`}>
                  <Sparkles className="w-3 h-3 text-champagne-300" />
                  Scan To Reveal
                </span>
              </div>
            </div>

            {/* Instruction Tagline */}
            <div className="text-center px-4 mb-5 relative z-10">
              <p className="text-xs font-medium opacity-85 leading-relaxed">
                {tagline}
              </p>
            </div>

            {/* Wax Seal & Handwritten Signature */}
            <div className="flex flex-col items-center text-center pt-2 relative z-10">
              {/* Wax Seal Visual */}
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr ${themeStyle.sealBg} shadow-romantic-md flex items-center justify-center text-white border-2 border-champagne-300/70 mb-2 transform hover:scale-105 transition-transform`}
              >
                <span className="text-lg">
                  {sealIcon === 'heart' && '💖'}
                  {sealIcon === 'rose' && '🌹'}
                  {sealIcon === 'ring' && '💍'}
                  {sealIcon === 'crown' && '👑'}
                </span>
              </div>

              <p className={`font-script text-2xl sm:text-3xl ${themeStyle.scriptText}`}>
                Forever yours, {senderName || 'Your Love'}
              </p>

              <p className="text-[10px] font-mono opacity-50 mt-1 truncate max-w-[280px]">
                {giftUrl}
              </p>
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-velvet-500 dark:text-velvet-400 px-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
              High-res 900x1200 export ready
            </span>
            <button
              onClick={handleCopyLink}
              className="text-romantic-600 dark:text-romantic-400 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Test Gift URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recipient Unlock Simulation Modal */}
      {showRecipientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-velvet-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white dark:bg-velvet-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-romantic-200 dark:border-velvet-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRecipientModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-romantic-100 dark:bg-velvet-800 text-velvet-500 hover:text-velvet-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-romantic-500">
                Live Simulation Preview
              </span>
              <h3 className="font-display text-2xl font-bold text-velvet-950 dark:text-white">
                Recipient Scan &amp; Unlocking Experience
              </h3>
              <p className="text-xs text-velvet-500">
                This is the exact view {recipientName || 'your recipient'} will see upon scanning the luxury QR code.
              </p>
            </div>

            <PasswordProtection
              correctPassword={giftPassword}
              hint={giftHint}
              giftTitle={giftTitle}
              recipientName={recipientName}
              senderName={senderName}
              theme={theme === 'blush' ? 'romantic' : theme}
              showDemoControls={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default GiftQrCodeCard;
