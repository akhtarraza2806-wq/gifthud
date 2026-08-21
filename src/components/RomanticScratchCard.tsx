import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Gift,
  Heart,
  RotateCcw,
  Eye,
  Sliders,
  Image as ImageIcon,
  Type,
  Lock,
  Unlock,
  Check,
  Flame,
  Award,
  Crown,
  Smile,
  Zap,
  Music,
  Share2,
  Copy,
  Layers,
  Palette
} from 'lucide-react';
import { useGiftStore } from '../store/useGiftStore';

/* ======================================================================
   TYPES & PRESETS
   ====================================================================== */

export type FoilTexture = 'rose_gold' | 'champagne_glitter' | 'velvet_noir' | 'silver_holographic';

export type RevealType = 'message' | 'voucher' | 'image' | 'custom_love_note';

export interface RomanticScratchCardProps {
  initialTitle?: string;
  initialMessage?: string;
  initialSender?: string;
  initialRecipient?: string;
  initialRevealType?: RevealType;
  initialImageUrl?: string;
  initialFoilTexture?: FoilTexture;
  onRevealComplete?: () => void;
  className?: string;
}

interface PresetCard {
  id: string;
  name: string;
  title: string;
  message: string;
  foil: FoilTexture;
  badge: string;
  voucherCode?: string;
  type: RevealType;
  imageUrl?: string;
}

const PRESET_SCRATCH_CARDS: PresetCard[] = [
  {
    id: 'anniversary_getaway',
    name: 'Secret Paris Getaway',
    title: 'A Secret Luxury Surprise Awaits',
    message: 'Pack your bags, darling! We are spending 4 unforgettable days in Paris overlooking the Eiffel Tower with private candlelit dinners.',
    foil: 'rose_gold',
    badge: 'Luxury Vacation Voucher',
    voucherCode: 'PARIS-VALENTINE-2026',
    type: 'voucher',
  },
  {
    id: 'love_vow',
    name: 'Eternal Love Vow',
    title: 'A Whisper from My Deepest Heart',
    message: 'In every lifetime, in every universe, my soul will always search for you and love you with every beat of my heart.',
    foil: 'velvet_noir',
    badge: 'Heartfelt Keepsake Vow',
    type: 'custom_love_note',
  },
  {
    id: 'dinner_token',
    name: 'Candlelit Chef Tasting',
    title: 'Redeemable Romance Voucher',
    message: 'Redeemable for one 5-Course Chef’s Tasting Menu & Vintage Wine Pairing at your favorite restaurant of choice, completely on me!',
    foil: 'champagne_glitter',
    badge: 'Fine Dining Token',
    voucherCode: 'CHEF-TASTING-VIP',
    type: 'voucher',
  },
  {
    id: 'custom_memory_photo',
    name: 'Cherished Moment Photo',
    title: 'Scratch to Reveal Our Memory',
    message: 'The sunset where we realized forever begins today.',
    foil: 'silver_holographic',
    badge: 'Secret Photo Reveal',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
  },
];

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

export const RomanticScratchCard: React.FC<RomanticScratchCardProps> = ({
  initialTitle = 'A Special Secret Keepsake For You',
  initialMessage,
  initialSender,
  initialRecipient,
  initialRevealType = 'voucher',
  initialImageUrl = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
  initialFoilTexture = 'rose_gold',
  onRevealComplete,
  className = '',
}) => {
  const storeGiftData = useGiftStore((s) => s.giftData);

  // Config state
  const [cardTitle, setCardTitle] = useState<string>(initialTitle);
  const [cardMessage, setCardMessage] = useState<string>(initialMessage || storeGiftData.noteMessage);
  const [senderName, setSenderName] = useState<string>(initialSender || storeGiftData.senderName);
  const [recipientName, setRecipientName] = useState<string>(initialRecipient || storeGiftData.recipientName);
  const [revealType, setRevealType] = useState<RevealType>(initialRevealType);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [foilTexture, setFoilTexture] = useState<FoilTexture>(initialFoilTexture);
  const [voucherCode, setVoucherCode] = useState<string>('ROMANCE-VIP-2026');
  const [brushSize, setBrushSize] = useState<number>(35);

  // Scratch progress & interactivity
  const [scratchProgress, setScratchProgress] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isScratching, setIsScratching] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Canvas Foil & Shimmer Texture
  const drawFoilCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Gradient background based on selected Foil
    let grad = ctx.createLinearGradient(0, 0, width, height);

    if (foilTexture === 'rose_gold') {
      grad.addColorStop(0, '#e89da2');
      grad.addColorStop(0.2, '#fbd3d8');
      grad.addColorStop(0.4, '#c96f78');
      grad.addColorStop(0.7, '#f7c5cb');
      grad.addColorStop(0.9, '#b2535d');
      grad.addColorStop(1, '#e89da2');
    } else if (foilTexture === 'champagne_glitter') {
      grad.addColorStop(0, '#d4af37');
      grad.addColorStop(0.25, '#fff2b2');
      grad.addColorStop(0.5, '#aa8c2c');
      grad.addColorStop(0.75, '#ffe58f');
      grad.addColorStop(1, '#8c701b');
    } else if (foilTexture === 'silver_holographic') {
      grad.addColorStop(0, '#cbd5e1');
      grad.addColorStop(0.2, '#f8fafc');
      grad.addColorStop(0.4, '#94a3b8');
      grad.addColorStop(0.6, '#e2e8f0');
      grad.addColorStop(0.8, '#cbd5e1');
      grad.addColorStop(1, '#64748b');
    } else {
      // Velvet Noir
      grad.addColorStop(0, '#2d1527');
      grad.addColorStop(0.3, '#4a1538');
      grad.addColorStop(0.6, '#1a0815');
      grad.addColorStop(0.85, '#5c1d42');
      grad.addColorStop(1, '#2d1527');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add luxury sparkle noise & metallic dust particles
    ctx.fillStyle = foilTexture === 'velvet_noir' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Patterned subtle overlay stars / diagonal lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let i = -width; i < width * 2; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Centered Scratch Callout Text on the foil
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = foilTexture === 'velvet_noir' ? '#fde047' : '#ffffff';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH WITH MOUSE OR TOUCH TO REVEAL ✨', width / 2, height / 2 - 14);

    ctx.font = 'italic 12px "Playfair Display", serif';
    ctx.fillStyle = foilTexture === 'velvet_noir' ? '#fcd34d' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('A hidden secret prepared with love', width / 2, height / 2 + 12);
    ctx.restore();
  }, [foilTexture]);

  // Handle Resize & Init Canvas Dimensions
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 340;

    drawFoilCanvas();
    setScratchProgress(0);
    setIsRevealed(false);
  }, [drawFoilCanvas]);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  // Calculate Scratch Percentage
  const calculateProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    // Sample every 8th pixel to calculate transparency efficiently
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let transparentCount = 0;
    const totalSampled = pixels.length / 32; // sampling stride

    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] < 40) {
        transparentCount++;
      }
    }

    const pct = Math.round((transparentCount / totalSampled) * 100);
    setScratchProgress(pct);

    // Auto-reveal & explode confetti when threshold is reached (50% revealed)
    if (pct >= 48 && !isRevealed) {
      setIsRevealed(true);
      useGiftStore.getState().setScratchRevealed(true);
      if (onRevealComplete) onRevealComplete();

      // Confetti burst
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#f59e0b', '#fbbf24', '#ffffff'],
      });
    }
  };

  // Perform Scratching on Canvas
  const scratchAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    calculateProgress();
  };

  // Mouse & Touch Coordinates
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    scratchAtPoint(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    const { x, y } = getCoordinates(e);
    scratchAtPoint(x, y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    scratchAtPoint(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScratching) return;
    const { x, y } = getCoordinates(e);
    scratchAtPoint(x, y);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  // Quick Reveal All Button
  const handleRevealAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setScratchProgress(100);
    setIsRevealed(true);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af', '#f59e0b', '#fbbf24', '#ffffff'],
    });
  };

  // Reset Scratch Card
  const handleResetCard = () => {
    drawFoilCanvas();
    setScratchProgress(0);
    setIsRevealed(false);
  };

  // Copy Voucher Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Apply Preset
  const applyPreset = (preset: PresetCard) => {
    setCardTitle(preset.title);
    setCardMessage(preset.message);
    setFoilTexture(preset.foil);
    setRevealType(preset.type);
    if (preset.voucherCode) setVoucherCode(preset.voucherCode);
    if (preset.imageUrl) setImageUrl(preset.imageUrl);
    setIsRevealed(false);
    setScratchProgress(0);
    setTimeout(() => drawFoilCanvas(), 50);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
            <span>Interactive Unboxing Experience</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
            Romantic Scratch Card &amp; Secret Reveal
          </h2>
          <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-xl">
            Swipe or drag your mouse to scratch away the metallic luxury foil and uncover the hidden romantic message, trip voucher, or secret photo.
          </p>
        </div>

        {/* Customizer Drawer Toggle */}
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="px-4 py-2 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 hover:border-romantic-400 text-xs font-semibold text-velvet-800 dark:text-velvet-200 flex items-center gap-2 shadow-romantic-sm transition-all self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-romantic-500" />
          <span>{isCustomizing ? 'Hide Customizer' : 'Card Studio Customizer'}</span>
        </button>
      </div>

      {/* ===================================================================
          CUSTOMIZER ACCORDION STUDIO
          =================================================================== */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="p-6 rounded-3xl bg-white/95 dark:bg-velvet-900/95 backdrop-blur-xl border border-romantic-200 dark:border-velvet-800 shadow-romantic-lg space-y-6">
              {/* Presets Row */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-2">
                  1. Quick Romantic Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRESET_SCRATCH_CARDS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="p-3 rounded-2xl border text-left bg-romantic-50/50 dark:bg-velvet-800/50 hover:bg-romantic-100/70 border-romantic-200 dark:border-velvet-700 hover:border-romantic-400 transition-all flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-romantic-200 dark:bg-velvet-700 text-romantic-800 dark:text-champagne-300 self-start mb-2">
                        {preset.badge}
                      </span>
                      <span className="font-display font-bold text-xs text-romantic-950 dark:text-white">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-romantic-100 dark:border-velvet-800">
                {/* Foil Material */}
                <div>
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">
                    Foil Scratch Material:
                  </label>
                  <select
                    value={foilTexture}
                    onChange={(e) => {
                      setFoilTexture(e.target.value as FoilTexture);
                      setTimeout(drawFoilCanvas, 50);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  >
                    <option value="rose_gold">Rose Gold Glitter</option>
                    <option value="champagne_glitter">Champagne Gold Shimmer</option>
                    <option value="velvet_noir">Velvet Midnight Damask</option>
                    <option value="silver_holographic">Silver Holographic Sparkle</option>
                  </select>
                </div>

                {/* Reveal Category */}
                <div>
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">
                    Reveal Content Type:
                  </label>
                  <select
                    value={revealType}
                    onChange={(e) => setRevealType(e.target.value as RevealType)}
                    className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  >
                    <option value="voucher">VIP Luxury Voucher / Token</option>
                    <option value="custom_love_note">Handwritten Love Note</option>
                    <option value="image">Cherished Photo Memory</option>
                    <option value="message">Secret Love Message</option>
                  </select>
                </div>

                {/* Scratch Brush Width */}
                <div>
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">
                    Scratch Coin Size: ({brushSize}px)
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="65"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-romantic-500 mt-2"
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-romantic-100 dark:border-velvet-800">
                <div>
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Card Title / Teaser:
                  </label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                  />
                </div>

                {revealType === 'voucher' && (
                  <div>
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Voucher Gift Code:
                    </label>
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>
                )}

                {revealType === 'image' && (
                  <div>
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Secret Photo URL:
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Hidden Message / Secret Revelation:
                </label>
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          THE INTERACTIVE SCRATCH CARD CONTAINER
          =================================================================== */}
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Progress & Quick Actions Bar */}
        <div className="flex items-center justify-between px-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-velvet-700 dark:text-velvet-300">Unboxing Progress:</span>
            <div className="w-32 h-2 bg-romantic-100 dark:bg-velvet-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-romantic-500 to-champagne-400"
                style={{ width: `${scratchProgress}%` }}
              />
            </div>
            <span className="font-mono text-romantic-600 dark:text-champagne-400">{scratchProgress}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRevealAll}
              className="px-3 py-1 rounded-xl bg-romantic-50 dark:bg-velvet-800 hover:bg-romantic-100 text-romantic-700 dark:text-romantic-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Instant Reveal</span>
            </button>
            <button
              onClick={handleResetCard}
              className="px-3 py-1 rounded-xl bg-romantic-50 dark:bg-velvet-800 hover:bg-romantic-100 text-velvet-700 dark:text-velvet-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-foil</span>
            </button>
          </div>
        </div>

        {/* The Scratch Canvas & Underlying Hidden Secret */}
        <div
          ref={containerRef}
          className="relative w-full h-[360px] sm:h-[380px] rounded-3xl overflow-hidden shadow-romantic-xl border-4 border-champagne-300/80 dark:border-velvet-700 bg-gradient-to-br from-romantic-50 via-white to-champagne-50 dark:from-velvet-950 dark:via-velvet-900 dark:to-velvet-950 select-none cursor-crosshair"
        >
          {/* UNDERLYING HIDDEN CONTENT (Revealed when scratched) */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-0 pointer-events-auto">
            {/* Card Top Branding */}
            <div className="flex items-center justify-between border-b border-romantic-200/80 dark:border-velvet-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-romantic-500 text-white">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="font-display font-bold text-sm tracking-wide text-romantic-950 dark:text-white">
                  Giftlove Luxury Atelier
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-champagne-700 dark:text-champagne-300 bg-champagne-100 dark:bg-velvet-800 px-3 py-1 rounded-full border border-champagne-200 dark:border-velvet-700">
                To: {recipientName} • From: {senderName}
              </span>
            </div>

            {/* Revealed Body content based on type */}
            <div className="my-auto py-2 text-center space-y-3">
              {revealType === 'image' && (
                <div className="space-y-3">
                  <div className="w-36 h-28 sm:w-44 sm:h-32 mx-auto rounded-2xl overflow-hidden border-2 border-romantic-300 shadow-md">
                    <img src={imageUrl} alt="Secret romantic reveal" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                    {cardTitle}
                  </h3>
                  <p className="font-serif italic text-sm text-velvet-700 dark:text-velvet-300 max-w-md mx-auto">
                    &ldquo;{cardMessage}&rdquo;
                  </p>
                </div>
              )}

              {revealType === 'voucher' && (
                <div className="space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-gradient-to-tr from-romantic-500 to-champagne-400 text-white shadow-romantic-md">
                    <Gift className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                    {cardTitle}
                  </h3>
                  <p className="font-serif italic text-sm sm:text-base text-velvet-800 dark:text-velvet-200 max-w-lg mx-auto leading-relaxed">
                    &ldquo;{cardMessage}&rdquo;
                  </p>

                  {/* Voucher Box */}
                  <div className="inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-white dark:bg-velvet-800 border-2 border-dashed border-romantic-300 dark:border-velvet-700 shadow-sm mt-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-romantic-600 dark:text-champagne-400">
                      {voucherCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 text-velvet-400 hover:text-romantic-600 transition-colors"
                      title="Copy Voucher Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {(revealType === 'message' || revealType === 'custom_love_note') && (
                <div className="space-y-3 max-w-lg mx-auto">
                  <div className="inline-flex p-2.5 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                    {cardTitle}
                  </h3>
                  <p className="font-script text-2xl sm:text-3xl text-romantic-600 dark:text-romantic-300 leading-snug py-1">
                    &ldquo;{cardMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between border-t border-romantic-200/80 dark:border-velvet-800 pt-3 text-[11px] text-velvet-500">
              <span className="italic">Redeemable forever with love</span>
              <span className="font-semibold text-romantic-600 dark:text-champagne-400">Official Keepsake Stamp ❦</span>
            </div>
          </div>

          {/* TOP SCRATCHABLE FOIL CANVAS */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 z-10 w-full h-full touch-none transition-opacity duration-500"
            style={{
              opacity: scratchProgress >= 65 ? 0 : 1,
              pointerEvents: scratchProgress >= 65 ? 'none' : 'auto',
            }}
          />
        </div>

        {/* Celebration Announcement Pill when unboxed */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-romantic-500 via-rose-500 to-champagne-500 text-white shadow-romantic-md flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm block">
                    ✨ Secret Romantic Surprise Unboxed!
                  </span>
                  <span className="text-xs text-white/90">
                    The keepsake is fully unveiled and ready to be redeemed with {senderName}.
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetCard}
                className="px-3.5 py-1.5 rounded-xl bg-white text-romantic-700 text-xs font-bold hover:bg-romantic-50 transition-all shadow-sm shrink-0"
              >
                Scratch Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
