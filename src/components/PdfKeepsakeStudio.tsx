import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Heart,
  Eye,
  Check,
  Copy,
  Share2,
  RefreshCw,
  Gift,
  Award,
  Layers,
  Palette,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Ticket,
  Maximize2
} from 'lucide-react';
import {
  KeepsakeTemplateType,
  ParchmentTheme,
  WaxSealType,
  MemoryHighlightItem,
  LoveVoucherItem,
  exportKeepsakeAsPdf,
  exportElementAsPdf
} from '../utils/pdfKeepsakeGenerator';
import { useGiftStore } from '../store/useGiftStore';

export interface PdfKeepsakeStudioProps {
  initialRecipient?: string;
  initialSender?: string;
  initialMessage?: string;
  initialTheme?: ParchmentTheme;
  initialTemplate?: KeepsakeTemplateType;
  className?: string;
}

const SAMPLE_MEMORIES: MemoryHighlightItem[] = [
  {
    date: 'The Beginning',
    title: 'When Our Eyes First Met',
    description: 'Under the amber cafe lights on that rainy Thursday, everything in the universe shifted into place.'
  },
  {
    date: 'Parisian Starlight',
    title: 'Midnight Along the Seine',
    description: 'Walking hand in hand as the city slept, realizing our hearts beat to the exact same melody.'
  },
  {
    date: 'Every Single Day',
    title: 'Our Beautiful Ever After',
    description: 'Waking up next to you and cherishing every quiet morning, knowing we have forever together.'
  }
];

const SAMPLE_VOUCHERS: LoveVoucherItem[] = [
  {
    id: 'v1',
    title: 'Breakfast in Bed & Warm Pastries',
    subtitle: 'Golden croissants, freshly brewed cappuccino, and warm morning snuggles.',
    terms: 'Redeemable anytime on any lazy weekend morning.'
  },
  {
    id: 'v2',
    title: 'Moonlit Stroll & Hot Cocoa',
    subtitle: 'A peaceful evening walk under the starlight with uninterrupted romance.',
    terms: 'Valid on any clear evening with guaranteed cuddles.'
  },
  {
    id: 'v3',
    title: 'Unconditional 30-Min Massage',
    subtitle: 'A soothing essential oil back & shoulder relaxation ritual.',
    terms: 'Instant redemption when you feel tired or stressed.'
  },
  {
    id: 'v4',
    title: 'Candlelight Chef Dinner Date',
    subtitle: 'Your favorite 3-course dinner prepared by me with romantic music.',
    terms: 'Includes full cleanup and post-dinner dessert.'
  },
  {
    id: 'v5',
    title: 'Movie Marathon Monarch Pass',
    subtitle: 'You choose the movie, snacks, and receive supreme cuddle rights.',
    terms: 'No complaints or phone distractions allowed.'
  },
  {
    id: 'v6',
    title: 'One Free "You Were Right" Pass',
    subtitle: 'Instant joyful surrender in any friendly debate with a warm hug.',
    terms: 'Single-use guarantee with zero counter-arguments.'
  }
];

export const PdfKeepsakeStudio: React.FC<PdfKeepsakeStudioProps> = ({
  initialRecipient,
  initialSender,
  initialMessage,
  initialTheme,
  initialTemplate = 'love_letter',
  className = ''
}) => {
  const storeGiftData = useGiftStore((s) => s.giftData);

  // State: Form Inputs
  const [template, setTemplate] = useState<KeepsakeTemplateType>(initialTemplate);
  const [theme, setTheme] = useState<ParchmentTheme>(initialTheme || (storeGiftData.selectedPaper as ParchmentTheme) || 'blush');
  const [sealType, setSealType] = useState<WaxSealType>(storeGiftData.selectedSeal === 'rose' ? 'rose' : storeGiftData.selectedSeal === 'ring' ? 'ring' : storeGiftData.selectedSeal === 'dove' ? 'dove' : 'heart');
  const [recipientName, setRecipientName] = useState<string>(initialRecipient || storeGiftData.recipientName);
  const [senderName, setSenderName] = useState<string>(initialSender || storeGiftData.senderName);
  const [message, setMessage] = useState<string>(initialMessage || storeGiftData.noteMessage);
  const [date, setDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [certificateTitle, setCertificateTitle] = useState<string>(
    'Certificate of Eternal Devotion & Boundless Love'
  );
  const [certificateNumber, setCertificateNumber] = useState<string>(
    `GL-${Math.floor(100000 + Math.random() * 900000)}-VAL`
  );

  // State: Memories and Vouchers
  const [memories, setMemories] = useState<MemoryHighlightItem[]>(SAMPLE_MEMORIES);
  const [vouchers, setVouchers] = useState<LoveVoucherItem[]>(SAMPLE_VOUCHERS);

  // State: Decoration Toggles
  const [includeGoldFoil, setIncludeGoldFoil] = useState<boolean>(true);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [includeQrCode, setIncludeQrCode] = useState<boolean>(true);
  const [qrVaultUrl, setQrVaultUrl] = useState<string>('https://giftlove.app/reveal/forever-rose');

  // State: Generation Status & Previews
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Refs for rendering & snapshot
  const livePreviewRef = useRef<HTMLDivElement | null>(null);
  const hiddenQrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick preset letter prompts
  const PRESET_MESSAGES = [
    {
      label: 'Deeply Romantic & Poetic',
      text: 'In your smile, I discovered a thousand sunrises. In your heart, I found the sanctuary I had searched for across all lifetimes. With every sunrise that breaks and every star that guides our path, my love for you grows deeper, softer, and more infinitely boundless.'
    },
    {
      label: 'Forever Soulmates Covenant',
      text: 'You are the calm in my storm, the melody in my silence, and the greatest gift of my lifetime. I promise to stand beside you through every season, celebrating your laughter and holding your hand through all eternity.'
    },
    {
      label: 'Playful & Sweetly Devoted',
      text: 'Thank you for being my favorite adventure, my best friend, and the reason I smile at my phone like a lovesick poet. You have my whole heart, today, tomorrow, and until the end of time.'
    }
  ];

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f68', '#bfa060', '#fb7185', '#ede2cc', '#ffffff']
    });
  };

  // Extract QR Data URL from hidden canvas
  const getQrDataUrl = (): string | undefined => {
    if (hiddenQrCanvasRef.current) {
      try {
        return hiddenQrCanvasRef.current.toDataURL('image/png');
      } catch (e) {
        console.warn('Could not extract QR canvas data URL', e);
      }
    }
    return undefined;
  };

  // Direct Vector PDF Export
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const qrDataUrl = getQrDataUrl();

      const result = await exportKeepsakeAsPdf({
        template,
        theme,
        sealType,
        recipientName,
        senderName,
        title: certificateTitle,
        message,
        date,
        certificateNumber,
        memories,
        vouchers,
        includeGoldFoil,
        includeWatermark,
        includeQrCode,
        qrDataUrl,
        giftUrl: qrVaultUrl,
        pageSize: 'a4'
      });

      triggerConfetti();
      setExportSuccessMessage(`Downloaded high-resolution printable PDF: ${result.filename}`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // High-Fidelity Snapshot PDF Export
  const handleExportDomSnapshot = async () => {
    if (!livePreviewRef.current) return;
    try {
      setIsExporting(true);
      const filename = `giftlove-live-card-${recipientName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      await exportElementAsPdf(livePreviewRef.current, filename, 'a4');
      triggerConfetti();
      setExportSuccessMessage(`Generated high-definition canvas snapshot PDF: ${filename}`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error exporting snapshot:', error);
      alert('Snapshot generation failed. Falling back to vector export.');
      handleExportPdf();
    } finally {
      setIsExporting(false);
    }
  };

  // Instant Print dialog
  const handleInstantPrint = () => {
    window.print();
  };

  // Add new memory item
  const handleAddMemory = () => {
    if (memories.length >= 5) return;
    setMemories([
      ...memories,
      {
        date: `Chapter ${memories.length + 1}`,
        title: 'A New Cherished Milestone',
        description: 'Every quiet moment with you becomes an unforgettable treasure.'
      }
    ]);
  };

  const handleRemoveMemory = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index));
  };

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-8 ${className}`}>
      {/* Hidden QR Canvas for Vector embedding */}
      <div className="hidden">
        <QRCodeCanvas
          ref={hiddenQrCanvasRef}
          value={qrVaultUrl}
          size={300}
          level="H"
          includeMargin={true}
          fgColor={theme === 'midnight' ? '#190a14' : theme === 'champagne' ? '#453518' : '#be1243'}
          bgColor="#ffffff"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
            <span>300 DPI Print-Ready Atelier Exporter</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
            Giftlove Printable PDF Keepsake Studio
          </h2>
          <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
            Export your personalized love letters, memory cards, certificates of devotion, and romantic vouchers as heirloom-quality, printable vector PDF documents with embossed gold foil trims, wax seal hallmarks, and digital QR vaults.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="btn-romantic flex items-center gap-2 text-xs sm:text-sm shadow-romantic-md disabled:opacity-70"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Keepsake PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleInstantPrint}
            className="btn-romantic-outline flex items-center gap-1.5 text-xs sm:text-sm bg-white dark:bg-velvet-900"
            title="Print directly to physical printer"
          >
            <Printer className="w-4 h-4 text-romantic-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {exportSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs sm:text-sm shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-emerald-500 text-white">
                <Check className="w-4 h-4" />
              </div>
              <span className="font-semibold">{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Chooser Grid (4 Types) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
          1. Choose Keepsake Template Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'love_letter',
              title: 'Parchment Love Letter',
              desc: 'Handcrafted letter with wax seal, script typography & gold foil frame.',
              icon: FileText,
              badge: 'Classic Romance'
            },
            {
              id: 'memory_card',
              title: 'Cherished Memory Story',
              desc: 'Milestone timeline cards with favorite quotes and dates.',
              icon: BookOpen,
              badge: 'Story Keepsake'
            },
            {
              id: 'authenticity_certificate',
              title: 'Certificate of Devotion',
              desc: 'Formal consecrated covenant of love with registry archive ID.',
              icon: Award,
              badge: 'Formal Landscape'
            },
            {
              id: 'love_vouchers',
              title: 'Love Vouchers Booklet',
              desc: '6 romantic printable coupons (breakfast in bed, starlight walk, massage).',
              icon: Ticket,
              badge: 'Printable Gifts'
            }
          ].map((t) => {
            const isSelected = template === t.id;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                onClick={() => setTemplate(t.id as KeepsakeTemplateType)}
                className={`p-4 rounded-2xl cursor-pointer border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-romantic-50/90 dark:bg-velvet-900 border-romantic-500 dark:border-romantic-400 shadow-romantic-sm'
                    : 'bg-white/80 dark:bg-velvet-900/60 border-romantic-200 dark:border-velvet-800 hover:border-romantic-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-romantic-500 text-white' : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-600 dark:text-champagne-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-700 dark:text-champagne-300 bg-champagne-100 dark:bg-velvet-800 px-2 py-0.5 rounded-full border border-champagne-200 dark:border-velvet-700">
                      {t.badge}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-velvet-600 dark:text-velvet-400 mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-romantic-600 dark:text-champagne-400' : 'text-velvet-400'}>
                    {isSelected ? '✓ Selected Format' : 'Select'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-romantic-500' : 'text-velvet-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Customizer (5 cols) & Live Print-Ready Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Customizer Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-velvet-900/90 backdrop-blur-xl border border-romantic-200 dark:border-velvet-800 shadow-romantic-sm space-y-5">
            <h3 className="font-display text-base font-bold text-romantic-950 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-romantic-500" />
              <span>Personalization &amp; Styling Atelier</span>
            </h3>

            {/* Parchment Theme Palette */}
            <div>
              <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">
                Parchment Material &amp; Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'blush', label: 'Petal Blush', color: 'bg-romantic-100 text-romantic-900 border-romantic-300' },
                  { id: 'champagne', label: 'Champagne Silk', color: 'bg-champagne-100 text-amber-900 border-champagne-300' },
                  { id: 'cream', label: 'Vintage Cream', color: 'bg-amber-50 text-amber-950 border-amber-200' },
                  { id: 'midnight', label: 'Midnight Velvet', color: 'bg-velvet-950 text-rose-100 border-velvet-700' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTheme(p.id as ParchmentTheme)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${p.color} ${
                      theme === p.id ? 'ring-2 ring-romantic-500 scale-[1.02] shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Embossed Wax Seal Stamp */}
            <div>
              <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">
                Embossed Wax Seal Motif
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'heart', label: 'Heart', emoji: '💝' },
                  { id: 'rose', label: 'Rose', emoji: '🌹' },
                  { id: 'ring', label: 'Ring', emoji: '💍' },
                  { id: 'crown', label: 'Crown', emoji: '👑' },
                  { id: 'dove', label: 'Dove', emoji: '🕊️' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSealType(s.id as WaxSealType)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      sealType === s.id
                        ? 'bg-romantic-500 text-white border-romantic-500 shadow-romantic-sm'
                        : 'bg-romantic-50/50 dark:bg-velvet-800 border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300'
                    }`}
                  >
                    <span className="text-base block">{s.emoji}</span>
                    <span className="text-[10px] font-semibold block mt-0.5">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient & Sender Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Recipient Name (Beloved):
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Sender Signature:
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                />
              </div>
            </div>

            {/* Letter Content & Presets */}
            {template === 'love_letter' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300">
                    Handwritten Love Note Body:
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs leading-relaxed focus:ring-2 focus:ring-romantic-400 outline-none"
                />

                {/* Romantic Prompts quick buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] text-velvet-400 font-bold uppercase tracking-wider block">
                    Romantic Letter Inspirations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_MESSAGES.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMessage(preset.text)}
                        className="px-2.5 py-1 rounded-lg bg-romantic-50 dark:bg-velvet-800 hover:bg-romantic-100 text-romantic-700 dark:text-romantic-300 text-[10px] font-semibold border border-romantic-200 dark:border-velvet-700 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Form Options */}
            {template === 'authenticity_certificate' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Certificate Proclamation Title:
                  </label>
                  <input
                    type="text"
                    value={certificateTitle}
                    onChange={(e) => setCertificateTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Covenant Proclamation Text:
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs leading-relaxed focus:ring-2 focus:ring-romantic-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Archive Registry No:
                    </label>
                    <input
                      type="text"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Date of Consecration:
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Memory Milestone Builder */}
            {template === 'memory_card' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300">
                    Story Milestones ({memories.length}/5):
                  </label>
                  {memories.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddMemory}
                      className="text-[11px] font-bold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Milestone</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {memories.map((mem, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-romantic-50/70 dark:bg-velvet-800/70 border border-romantic-200 dark:border-velvet-700 text-xs space-y-1.5 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={mem.title}
                          placeholder="Milestone Title"
                          onChange={(e) => {
                            const updated = [...memories];
                            updated[i].title = e.target.value;
                            setMemories(updated);
                          }}
                          className="font-bold text-romantic-950 dark:text-white bg-transparent border-b border-transparent hover:border-romantic-300 focus:border-romantic-500 outline-none w-full text-xs"
                        />
                        {memories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemory(i)}
                            className="text-velvet-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={mem.description}
                        placeholder="Description..."
                        onChange={(e) => {
                          const updated = [...memories];
                          updated[i].description = e.target.value;
                          setMemories(updated);
                        }}
                        className="text-[11px] text-velvet-600 dark:text-velvet-300 bg-transparent outline-none w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Luxury Embellishment Toggles */}
            <div className="pt-3 border-t border-romantic-100 dark:border-velvet-800 space-y-2 text-xs">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                Atelier Embellishments:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-romantic-50/50 dark:bg-velvet-800/50 border border-romantic-200 dark:border-velvet-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGoldFoil}
                    onChange={(e) => setIncludeGoldFoil(e.target.checked)}
                    className="w-4 h-4 rounded text-romantic-500 accent-romantic-500"
                  />
                  <span className="font-semibold text-romantic-950 dark:text-white text-[11px]">
                    24K Gold Foil Filigree
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-romantic-50/50 dark:bg-velvet-800/50 border border-romantic-200 dark:border-velvet-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                    className="w-4 h-4 rounded text-romantic-500 accent-romantic-500"
                  />
                  <span className="font-semibold text-romantic-950 dark:text-white text-[11px]">
                    Atelier Watermark
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-romantic-50/50 dark:bg-velvet-800/50 border border-romantic-200 dark:border-velvet-700 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={includeQrCode}
                    onChange={(e) => setIncludeQrCode(e.target.checked)}
                    className="w-4 h-4 rounded text-romantic-500 accent-romantic-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-romantic-950 dark:text-white text-[11px] block">
                      Embed Digital Vault QR Code
                    </span>
                    <span className="text-[10px] text-velvet-500 block">
                      Recipients can scan from paper to open online music/3D experience
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Print-Ready Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-romantic-500" />
              <span>Live High-Definition Print Preview</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportDomSnapshot}
                disabled={isExporting}
                className="text-[11px] font-bold text-romantic-600 dark:text-champagne-400 hover:underline flex items-center gap-1"
                title="Export high-res visual canvas snapshot"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Export Snapshot</span>
              </button>
            </div>
          </div>

          {/* Printable Document Simulated Canvas */}
          <div className="p-4 sm:p-8 rounded-3xl bg-velvet-950/20 dark:bg-black/40 border border-romantic-200 dark:border-velvet-800 flex justify-center items-center overflow-x-auto">
            <div
              ref={livePreviewRef}
              className={`w-full max-w-[500px] transition-all duration-300 rounded-2xl relative shadow-2xl p-6 sm:p-8 border ${
                template === 'authenticity_certificate' ? 'aspect-[1.414/1]' : 'aspect-[1/1.414]'
              } ${
                theme === 'blush'
                  ? 'bg-gradient-to-br from-[#fff5f6] via-[#ffe4e8] to-[#fecdd6] border-romantic-300 text-romantic-950'
                  : theme === 'champagne'
                  ? 'bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e7] to-[#ede2cc] border-champagne-300 text-velvet-950'
                  : theme === 'cream'
                  ? 'bg-gradient-to-br from-[#fffdfa] to-[#f5eedc] border-amber-200 text-amber-950'
                  : 'bg-gradient-to-br from-velvet-950 via-velvet-900 to-romantic-950 border-velvet-700 text-romantic-100'
              }`}
            >
              {/* Ornate Gold Foil Double Border */}
              {includeGoldFoil && (
                <>
                  <div className="absolute inset-2.5 border border-champagne-400/70 rounded-xl pointer-events-none" />
                  <div className="absolute inset-3.5 border border-champagne-400/30 rounded-lg pointer-events-none" />
                  {/* Corner Diamond Flourishes */}
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-champagne-400 rotate-45" />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-champagne-400 rotate-45" />
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-champagne-400 rotate-45" />
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-champagne-400 rotate-45" />
                </>
              )}

              {/* Faint Watermark */}
              {includeWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                  <span className="font-serif italic font-bold text-4xl sm:text-5xl text-champagne-500 whitespace-nowrap">
                    Giftlove Atelier
                  </span>
                </div>
              )}

              {/* TEMPLATE A: LOVE LETTER PREVIEW */}
              {template === 'love_letter' && (
                <div className="h-full flex flex-col justify-between relative z-10 space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <span className="font-sans uppercase tracking-widest text-[9px] text-champagne-600 dark:text-champagne-400 font-bold block">
                      G I F T L O V E   L U X U R Y   A T E L I E R
                    </span>
                    <span className="font-serif italic text-[10px] text-romantic-600 dark:text-romantic-300 block">
                      Official Handwritten Parchment Keepsake
                    </span>
                    <span className="text-[9px] text-velvet-500 block text-right mt-1">
                      {date}
                    </span>
                  </div>

                  {/* Letter Body */}
                  <div className="space-y-3 my-auto">
                    <p className="font-display font-bold text-lg sm:text-xl">
                      Dearest {recipientName || 'Beloved'},
                    </p>
                    <p className="font-serif text-xs sm:text-sm leading-relaxed italic px-1 opacity-90">
                      "{message || 'Your heartfelt love note will appear here in elegant printable typography...'}"
                    </p>
                    <div className="pt-2">
                      <p className="font-serif italic text-xs text-romantic-600 dark:text-champagne-400">
                        Forever &amp; unconditionally yours,
                      </p>
                      <p className="font-display font-bold text-base text-romantic-950 dark:text-white">
                        {senderName || 'Your Love'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Seal & QR */}
                  <div className="flex items-end justify-between pt-2 border-t border-champagne-300/40">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-romantic-700 via-rose-600 to-romantic-500 text-white flex items-center justify-center text-sm shadow-md border border-champagne-300">
                        {sealType === 'heart' && '♥'}
                        {sealType === 'rose' && '🌹'}
                        {sealType === 'ring' && '💍'}
                        {sealType === 'crown' && '👑'}
                        {sealType === 'dove' && '🕊️'}
                      </div>
                      <span className="text-[8px] font-mono tracking-wider text-velvet-500 uppercase">
                        Sealed With Love
                      </span>
                    </div>

                    {includeQrCode && (
                      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-romantic-200 text-center">
                        <QRCodeCanvas value={qrVaultUrl} size={42} />
                        <span className="text-[7px] font-mono text-velvet-600 block mt-0.5">Scan Vault</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TEMPLATE B: MEMORY CARD PREVIEW */}
              {template === 'memory_card' && (
                <div className="h-full flex flex-col justify-between relative z-10 space-y-3">
                  <div className="text-center">
                    <span className="font-sans uppercase tracking-widest text-[8px] text-champagne-600 dark:text-champagne-400 font-bold block">
                      G I F T L O V E   M E M O R Y   K E E P S A K E
                    </span>
                    <h4 className="font-display font-bold text-base sm:text-lg">
                      Our Timeless Love Story
                    </h4>
                    <span className="text-[10px] italic text-romantic-600 dark:text-romantic-300 block">
                      Dedicated to {recipientName} • Presented by {senderName}
                    </span>
                  </div>

                  {/* Memories List */}
                  <div className="space-y-2 my-auto">
                    {memories.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/80 dark:bg-velvet-900/80 border border-romantic-200 dark:border-velvet-700 shadow-xs text-left text-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-romantic-500 text-white text-[8px] font-bold">
                            {m.date || `Chapter ${idx + 1}`}
                          </span>
                          <span className="font-bold text-romantic-950 dark:text-white text-[11px]">
                            {m.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-velvet-600 dark:text-velvet-400 leading-tight">
                          {m.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-champagne-300/40 text-[9px]">
                    <span className="font-serif italic text-velvet-600 dark:text-velvet-400">
                      Crafted with eternal devotion • {date}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-romantic-500 text-white flex items-center justify-center text-xs">
                      ♥
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE C: CERTIFICATE OF DEVOTION */}
              {template === 'authenticity_certificate' && (
                <div className="h-full flex flex-col justify-between relative z-10 text-center space-y-2">
                  <div>
                    <span className="font-sans uppercase tracking-widest text-[8px] text-champagne-600 dark:text-champagne-400 font-bold block">
                      G I F T L O V E   H A U T E   R O M A N C E   A T E L I E R
                    </span>
                    <h4 className="font-display font-bold text-base sm:text-lg text-romantic-950 dark:text-white">
                      {certificateTitle}
                    </h4>
                    <span className="text-[9px] italic text-romantic-600 dark:text-romantic-300 block">
                      A Solemn &amp; Sacred Covenant of Love and Unconditional Devotion
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <p className="text-[9px] uppercase tracking-wider text-velvet-500">
                      It is hereby solemnly proclaimed that
                    </p>
                    <p className="font-display font-bold text-xl sm:text-2xl text-romantic-600 dark:text-romantic-400">
                      {recipientName}
                    </p>
                    <p className="font-serif text-[10px] sm:text-[11px] italic px-4 text-velvet-700 dark:text-velvet-300 leading-relaxed">
                      "{message}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-champagne-300/40 text-[9px]">
                    <div className="text-left">
                      <span className="block font-bold text-romantic-950 dark:text-white">{senderName}</span>
                      <span className="text-[8px] text-velvet-500 uppercase">Pledged By (Giver)</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-romantic-600 to-champagne-500 text-white flex items-center justify-center text-xs shadow-sm">
                      👑
                    </div>

                    <div className="text-right">
                      <span className="block font-bold text-romantic-950 dark:text-white">{date}</span>
                      <span className="text-[8px] text-velvet-500 uppercase">Date of Consecration</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE D: LOVE VOUCHERS PREVIEW */}
              {template === 'love_vouchers' && (
                <div className="h-full flex flex-col justify-between relative z-10 space-y-2">
                  <div className="text-center">
                    <span className="font-sans uppercase tracking-widest text-[8px] text-champagne-600 dark:text-champagne-400 font-bold block">
                      G I F T L O V E   C O U P O N   B O O K L E T
                    </span>
                    <h4 className="font-display font-bold text-sm sm:text-base">
                      Romantic Love Vouchers for {recipientName}
                    </h4>
                  </div>

                  {/* 4 Sample Voucher Grid Preview */}
                  <div className="grid grid-cols-2 gap-2 my-auto">
                    {vouchers.slice(0, 4).map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/90 dark:bg-velvet-900/90 border border-dashed border-romantic-300 text-left text-[10px] space-y-1"
                      >
                        <span className="px-1.5 py-0.2 rounded bg-romantic-500 text-white text-[7px] font-bold block w-max">
                          VOUCHER #{idx + 1}
                        </span>
                        <p className="font-bold text-romantic-950 dark:text-white leading-tight">
                          {v.title}
                        </p>
                        <p className="text-[8px] text-velvet-500 leading-tight">
                          ✂ Cut to redeem anytime
                        </p>
                      </div>
                    ))}
                  </div>

                  <span className="text-[8px] text-center text-velvet-500 block">
                    Bound with eternal love by {senderName} • 6 full high-res coupons in exported PDF
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick PDF Action Buttons below preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-romantic-500 via-rose-500 to-champagne-500 hover:from-romantic-600 hover:to-champagne-600 text-white font-bold text-xs sm:text-sm shadow-romantic-md flex items-center justify-center gap-2 transition-all disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>Export {template === 'authenticity_certificate' ? 'Certificate' : template === 'love_vouchers' ? 'Vouchers' : 'Love Letter'} PDF</span>
            </button>

            <button
              onClick={handleInstantPrint}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 text-velvet-800 dark:text-velvet-200 font-bold text-xs sm:text-sm hover:border-romantic-400 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-romantic-500" />
              <span>Direct Physical Print (300 DPI)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
