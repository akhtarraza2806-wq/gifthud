import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Gift,
  Feather,
  Copy,
  Check,
  Palette,
  Type,
  Layers,
  Code,
  Send,
  Eye,
  Crown,
  Bookmark,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  QrCode,
  Images,
  Timer,
  LayoutDashboard,
  Headset,
  HelpCircle,
  Award,
  CreditCard,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { GiftQrCodeCard } from './components/GiftQrCodeCard';
import { FloatingHeart3D } from './components/FloatingHeart3D';
import { RomanticPhotoGallery } from './components/RomanticPhotoGallery';
import { InteractiveCountdown } from './components/InteractiveCountdown';
import { LoveQuiz } from './components/LoveQuiz';
import { RomanticScratchCard } from './components/RomanticScratchCard';
import { GiftPayment } from './components/GiftPayment';
import { PdfKeepsakeStudio } from './components/PdfKeepsakeStudio';
import { exportKeepsakeAsPdf } from './utils/pdfKeepsakeGenerator';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactSupport } from './components/ContactSupport';
import { PrivacyAnalyticsTracker } from './components/PrivacyAnalyticsTracker';
import { PasswordProtection } from './components/PasswordProtection';
import {
  CinematicTransitionProvider,
  CinematicPageWrapper,
  CinematicTransitionController,
  useCinematicTransition
} from './components/CinematicTransitionSystem';
import { useGiftStore, TabType as StoreTabType } from './store/useGiftStore';

interface Swatch {
  shade: string;
  hex: string;
  name: string;
  usage: string;
  isDark?: boolean;
}

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

type TabType = 'palette' | 'typography' | 'components' | 'card_builder' | 'pdf_keepsake' | 'scratch_card' | 'qr_card' | 'gallery' | 'countdown' | 'quiz' | 'payment' | 'admin' | 'support' | 'tokens';

const TAB_ORDER: { id: TabType; label: string; icon: any; title: string }[] = [
  { id: 'palette', label: 'Romantic Palette', icon: Palette, title: 'Signature Romantic & Champagne Color System' },
  { id: 'typography', label: 'Typography', icon: Type, title: 'Giftlove Editorial & Script Typography' },
  { id: 'components', label: 'UI Components', icon: Layers, title: 'Interactive Luxury Component Kit & Password Vault' },
  { id: 'card_builder', label: 'Love Letter Studio', icon: Feather, title: 'Handwritten Letter Studio & Wax Seal Atelier' },
  { id: 'pdf_keepsake', label: 'Printable PDF', icon: FileText, title: 'Printable Keepsake PDF Exporter (Letters, Memory Cards & Certificates)' },
  { id: 'scratch_card', label: 'Scratch Card', icon: Sparkles, title: 'Romantic Scratch Card & Unboxing Experience' },
  { id: 'qr_card', label: 'QR Reveal Card', icon: QrCode, title: 'Luxury QR Keepsake Card & Recipient Experience' },
  { id: 'gallery', label: '3D Gallery', icon: Images, title: '3D Romantic Keepsake & Photo Gallery' },
  { id: 'countdown', label: 'Countdown', icon: Timer, title: 'Interactive Milestone & Anniversary Countdown' },
  { id: 'quiz', label: 'Love Quiz', icon: HelpCircle, title: 'Interactive Couple Memory & Love Harmony Quiz' },
  { id: 'payment', label: 'Luxury Checkout', icon: CreditCard, title: 'Razorpay Checkout & Direct UPI QR Verification' },
  { id: 'admin', label: 'Admin Studio', icon: LayoutDashboard, title: 'Concierge & Atelier Admin Management' },
  { id: 'support', label: 'Support & Care', icon: Headset, title: 'VIP Support & Concierge Care' },
  { id: 'tokens', label: 'Tailwind Config', icon: Code, title: 'Tailwind CSS Design Tokens' },
];

function GiftloveAppContent() {
  // Centralized Zustand Store integration
  const activeTab = useGiftStore((s) => s.activeTab) as TabType;
  const setActiveTab = useGiftStore((s) => s.setActiveTab);
  const isDarkMode = useGiftStore((s) => s.isDarkMode);
  const toggleDarkMode = useGiftStore((s) => s.toggleDarkMode);
  const toastMessage = useGiftStore((s) => s.toastMessage);

  const recipientName = useGiftStore((s) => s.giftData.recipientName);
  const setRecipientName = useGiftStore((s) => s.setRecipientName);
  const senderName = useGiftStore((s) => s.giftData.senderName);
  const setSenderName = useGiftStore((s) => s.setSenderName);
  const noteMessage = useGiftStore((s) => s.giftData.noteMessage);
  const setNoteMessage = useGiftStore((s) => s.setNoteMessage);
  const customText = useGiftStore((s) => s.giftData.customText);
  const setCustomText = useGiftStore((s) => s.setCustomText);
  const selectedSeal = useGiftStore((s) => s.giftData.selectedSeal);
  const setSelectedSeal = useGiftStore((s) => s.setSelectedSeal);
  const selectedPaper = useGiftStore((s) => s.giftData.selectedPaper);
  const setSelectedPaper = useGiftStore((s) => s.setSelectedPaper);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { setDirection, recordNavigation, direction } = useCinematicTransition();

  const handleTabChange = (newTab: TabType) => {
    const prevIdx = TAB_ORDER.findIndex(t => t.id === activeTab);
    const nextIdx = TAB_ORDER.findIndex(t => t.id === newTab);
    recordNavigation(activeTab, newTab, prevIdx >= 0 ? prevIdx : 0, nextIdx >= 0 ? nextIdx : 0);
    setActiveTab(newTab);
  };

  const goToPrevTab = () => {
    const currentIdx = TAB_ORDER.findIndex(t => t.id === activeTab);
    const prevIdx = (currentIdx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    handleTabChange(TAB_ORDER[prevIdx].id);
  };

  const goToNextTab = () => {
    const currentIdx = TAB_ORDER.findIndex(t => t.id === activeTab);
    const nextIdx = (currentIdx + 1) % TAB_ORDER.length;
    handleTabChange(TAB_ORDER[nextIdx].id);
  };

  const currentTabMeta = TAB_ORDER.find(t => t.id === activeTab);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const romanticSwatches: Swatch[] = [
    { shade: '50', hex: '#fff5f6', name: 'Whisper Silk', usage: 'Hover states, soft pill tags, card backgrounds' },
    { shade: '100', hex: '#ffe4e8', name: 'Morning Rose', usage: 'Subtle notification banners, tint badges' },
    { shade: '200', hex: '#fecdd6', name: 'Petal Blush', usage: 'Light borders, input focus rings, soft dividers' },
    { shade: '300', hex: '#fda4b4', name: 'Coral Blush', usage: 'Decorative accents, secondary heart badges' },
    { shade: '400', hex: '#fb718b', name: 'Peony Pink', usage: 'Vibrant highlight tags, hover state accents' },
    { shade: '500', hex: '#f43f68', name: 'Passion Rose', usage: 'Primary Brand CTA, active states, key icons' },
    { shade: '600', hex: '#e11d53', name: 'Crimson Romance', usage: 'Button hover states, emphasized text', isDark: true },
    { shade: '700', hex: '#be1243', name: 'Velvet Rose', usage: 'Headings on light surfaces, primary dark text', isDark: true },
    { shade: '800', hex: '#9f123c', name: 'Royal Wine', usage: 'Editorial subheaders, luxury borders', isDark: true },
    { shade: '900', hex: '#881337', name: 'Vintage Bordeaux', usage: 'Deep romantic text, dark cards', isDark: true },
    { shade: '950', hex: '#4c051a', name: 'Romantic Noir', usage: 'High contrast display headings, velvet canvas', isDark: true },
  ];

  const champagneSwatches: Swatch[] = [
    { shade: '50', hex: '#fdfbf7', name: 'Frosted Champagne', usage: 'Warm luminous backgrounds' },
    { shade: '100', hex: '#f7f2e7', name: 'Gold Silk', usage: 'Subtle luxury panels, gift tags' },
    { shade: '200', hex: '#ede2cc', name: 'Soft Bullion', usage: 'Warm borders, card outlines' },
    { shade: '300', hex: '#dfcca8', name: 'Shimmering Sand', usage: 'Foil card highlights, rating stars' },
    { shade: '400', hex: '#cfb27e', name: 'Muted Gold', usage: 'Subtle metallic borders, badges' },
    { shade: '500', hex: '#bfa060', name: 'Polished Gold', usage: 'Luxury badges, VIP highlights, seals' },
    { shade: '600', hex: '#a38249', name: 'Antique Brass', usage: 'Gold button text, dark mode accents', isDark: true },
    { shade: '700', hex: '#836539', name: 'Deep Bronze', usage: 'Secondary gold headers', isDark: true },
    { shade: '800', hex: '#674e30', name: 'Aged Amber', usage: 'Warm contrast elements', isDark: true },
    { shade: '900', hex: '#483520', name: 'Espresso Gold', usage: 'Deep warm shadow tones', isDark: true },
  ];

  const velvetSwatches: Swatch[] = [
    { shade: '50', hex: '#faf7f8', name: 'Alabaster Plum', usage: 'Ultra-light neutral background' },
    { shade: '100', hex: '#f3ecef', name: 'Silk Quartz', usage: 'Subtle neutral surface' },
    { shade: '300', hex: '#d2bcc6', name: 'Dusty Mauve', usage: 'Placeholder text, light outlines' },
    { shade: '500', hex: '#9e798c', name: 'Smoky Amethyst', usage: 'Secondary label text, icons' },
    { shade: '700', hex: '#674a5a', name: 'Plum Shadow', usage: 'Muted body copy for dark elements', isDark: true },
    { shade: '800', hex: '#3e2834', name: 'Deep Velvet', usage: 'Luxury dark container backgrounds', isDark: true },
    { shade: '900', hex: '#22121c', name: 'Midnight Wine', usage: 'Primary dark canvas, contrast text', isDark: true },
    { shade: '950', hex: '#140910', name: 'Obsidian Noir', usage: 'Extreme dark contrast, luxury footer', isDark: true },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-velvet-950 text-velvet-100' : 'bg-pearl text-velvet-900'}`}>
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-romantic-900 via-romantic-700 to-velvet-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-champagne-300 animate-pulse" />
        <span>GIFTLOVE BRAND DESIGN SYSTEM • ROMANTIC COLOR PALETTE &amp; TYPOGRAPHY ACTIVE</span>
        <Sparkles className="w-3.5 h-3.5 text-champagne-300 animate-pulse" />
      </div>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-velvet-900/80 border-velvet-800' : 'bg-white/80 border-romantic-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-romantic-600 via-romantic-500 to-champagne-400 p-0.5 shadow-romantic-md flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-velvet-900 rounded-[14px] flex items-center justify-center">
                <Heart className="w-6 h-6 text-romantic-500 fill-romantic-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl tracking-tight text-romantic-900 dark:text-romantic-100">
                  Gift<span className="text-romantic-500 italic font-serif">love</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-champagne-100 dark:bg-champagne-900/50 text-champagne-700 dark:text-champagne-300 border border-champagne-200 dark:border-champagne-700">
                  Brand Kit
                </span>
              </div>
              <p className="text-xs text-velvet-500 dark:text-velvet-400 font-medium">The Modern Romantic Gifting Aesthetic</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-romantic-50/80 dark:bg-velvet-800/80 border border-romantic-200/60 dark:border-velvet-700">
            {[
              { id: 'palette', label: 'Romantic Palette', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'components', label: 'UI Components', icon: Layers },
              { id: 'card_builder', label: 'Love Letter Studio', icon: Feather },
              { id: 'qr_card', label: 'QR Reveal Card', icon: QrCode },
              { id: 'gallery', label: '3D Gallery', icon: Images },
              { id: 'countdown', label: 'Countdown', icon: Timer },
              { id: 'admin', label: 'Admin Studio', icon: LayoutDashboard },
              { id: 'support', label: 'Support & Care', icon: Headset },
              { id: 'tokens', label: 'Tailwind Config', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white dark:bg-velvet-900 text-romantic-600 dark:text-romantic-400 shadow-sm'
                      : 'text-velvet-600 dark:text-velvet-400 hover:text-romantic-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action & Dark Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark/Light Mode"
              className="p-2.5 rounded-full border border-romantic-200 dark:border-velvet-700 hover:bg-romantic-100 dark:hover:bg-velvet-800 text-velvet-700 dark:text-velvet-200 transition-colors"
              title="Toggle Theme Canvas"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-champagne-400" /> : <Moon className="w-4 h-4 text-romantic-700" />}
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-romantic-500 to-romantic-600 hover:from-romantic-600 hover:to-romantic-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-romantic-md hover:shadow-romantic-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2 border-t border-romantic-100 dark:border-velvet-800 scrollbar-none">
          {[
            { id: 'palette', label: 'Palette' },
            { id: 'typography', label: 'Typography' },
            { id: 'components', label: 'UI Kit' },
            { id: 'card_builder', label: 'Letter Studio' },
            { id: 'scratch_card', label: 'Scratch Card' },
            { id: 'qr_card', label: 'QR Card' },
            { id: 'gallery', label: '3D Gallery' },
            { id: 'countdown', label: 'Countdown' },
            { id: 'quiz', label: 'Love Quiz' },
            { id: 'payment', label: 'Checkout & Pay' },
            { id: 'admin', label: 'Admin Studio' },
            { id: 'support', label: 'Support & Care' },
            { id: 'tokens', label: 'Tokens' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-romantic-500 text-white'
                  : 'bg-romantic-100 dark:bg-velvet-800 text-velvet-700 dark:text-velvet-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Brand Section */}
      <section className="relative overflow-hidden py-10 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-romantic-100 dark:border-velvet-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-romantic-200/40 dark:bg-romantic-900/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-champagne-200/40 dark:bg-champagne-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-romantic-100/80 dark:bg-velvet-800/80 border border-romantic-200 dark:border-velvet-700 text-romantic-700 dark:text-romantic-300 text-xs font-semibold mb-6 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-champagne-500" />
                <span>Curated for Luxury Gifting &amp; Expressive Romance</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-romantic-950 dark:text-white leading-[1.15]">
                Timeless Elegance, <br />
                <span className="text-romantic-gradient font-serif italic font-normal">Wrapped in Romance.</span>
              </h1>

              <p className="text-base sm:text-lg text-velvet-600 dark:text-velvet-300 max-w-2xl lg:max-w-xl mx-auto lg:mx-0 mb-8 font-normal leading-relaxed">
                The official Giftlove Tailwind CSS system blends rich velvet roses, luminous champagne accents, and poetic typography into a modern, tactile design language.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => handleTabChange('pdf_keepsake')}
                  className="btn-romantic flex items-center gap-2 text-sm bg-gradient-to-r from-romantic-500 via-rose-500 to-champagne-500 text-white shadow-romantic-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Printable PDF Studio</span>
                </button>
                <button
                  onClick={() => handleTabChange('payment')}
                  className="btn-romantic-outline flex items-center gap-2 text-sm bg-white/70 dark:bg-velvet-900/70"
                >
                  <CreditCard className="w-4 h-4 text-romantic-500" />
                  <span>Luxury Checkout</span>
                </button>
                <button
                  onClick={() => handleTabChange('scratch_card')}
                  className="btn-romantic-outline flex items-center gap-2 text-sm bg-white/70 dark:bg-velvet-900/70"
                >
                  <Sparkles className="w-4 h-4 text-romantic-500" />
                  <span>Scratch Card</span>
                </button>
                <button
                  onClick={() => handleTabChange('quiz')}
                  className="btn-romantic-outline flex items-center gap-2 text-sm bg-white/70 dark:bg-velvet-900/70"
                >
                  <Heart className="w-4 h-4 text-romantic-500" />
                  <span>Play Love Quiz</span>
                </button>
                <button
                  onClick={() => handleTabChange('palette')}
                  className="btn-romantic-outline flex items-center gap-2 text-sm bg-white/70 dark:bg-velvet-900/70"
                >
                  <Palette className="w-4 h-4" />
                  <span>Explore Palette</span>
                </button>
                <button
                  onClick={() => handleTabChange('tokens')}
                  className="btn-romantic-outline flex items-center gap-2 text-sm bg-white/70 dark:bg-velvet-900/70"
                >
                  <Code className="w-4 h-4" />
                  <span>Tailwind Config</span>
                </button>
              </div>
            </motion.div>

            {/* Right 3D Animated Floating Heart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="lg:col-span-5 flex justify-center items-center"
            >
              <FloatingHeart3D isDark={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cinematic Transition Studio Control Panel */}
        <CinematicTransitionController
          currentSectionTitle={currentTabMeta?.title || 'Gift Section'}
          currentSectionId={activeTab}
          onPrev={goToPrevTab}
          onNext={goToNextTab}
          onSelectRoute={(routeId) => handleTabChange(routeId as TabType)}
          hasNavControls={true}
        />

        {/* Toast alert for copied content */}
        <AnimatePresence>
          {copiedCode && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed bottom-6 right-6 z-50 bg-velvet-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-romantic-400/30"
            >
              <Check className="w-4 h-4 text-romantic-400" />
              <span>Copied {copiedCode} to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Tab Container */}
        <AnimatePresence mode="wait" custom={direction}>
          {/* TAB 1: PALETTE */}
          {activeTab === 'palette' && (
            <CinematicPageWrapper key="tab-palette" pageKey="palette" className="space-y-12">
              <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                      Signature Color Palettes
                    </h2>
                    <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                      Carefully calibrated RGB/HEX steps designed for emotional warmth, luxury packaging, and accessible contrast.
                    </p>
                  </div>
                  <div className="text-xs text-velvet-500 dark:text-velvet-400 bg-romantic-50 dark:bg-velvet-800 px-3 py-2 rounded-lg border border-romantic-200 dark:border-velvet-700">
                    💡 Click any color block to copy its hex value
                  </div>
                </div>

                {/* 1. Romantic / Velvet Rose Spectrum */}
                <div className="p-6 rounded-3xl bg-white dark:bg-velvet-900/60 border border-romantic-200 dark:border-velvet-800 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-romantic-500 ring-4 ring-romantic-200 dark:ring-romantic-900" />
                      <h3 className="font-display font-bold text-lg text-romantic-900 dark:text-romantic-100">
                        romantic-* <span className="font-sans font-normal text-xs text-velvet-500 ml-2">Primary Brand Gradient &amp; Heart Core</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-romantic-600 dark:text-romantic-400">bg-romantic-{'{50..950}'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11 gap-3">
                    {romanticSwatches.map((item) => (
                      <div
                        key={item.shade}
                        onClick={() => copyToClipboard(item.hex, `romantic-${item.shade} (${item.hex})`)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-romantic-md"
                      >
                        <div
                          className="h-24 p-2.5 flex flex-col justify-between"
                          style={{ backgroundColor: item.hex }}
                        >
                          <span className={`text-[11px] font-bold font-mono ${item.isDark ? 'text-white' : 'text-romantic-950'}`}>
                            {item.shade}
                          </span>
                          <Copy className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity self-end ${item.isDark ? 'text-white' : 'text-romantic-950'}`} />
                        </div>
                        <div className="p-2.5 bg-white dark:bg-velvet-800">
                          <p className="text-xs font-semibold text-velvet-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] font-mono text-velvet-500 dark:text-velvet-400 mt-0.5">{item.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Champagne Gold Spectrum */}
                <div className="p-6 rounded-3xl bg-white dark:bg-velvet-900/60 border border-romantic-200 dark:border-velvet-800 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-champagne-500 ring-4 ring-champagne-200 dark:ring-champagne-900" />
                      <h3 className="font-display font-bold text-lg text-velvet-900 dark:text-white">
                        champagne-* <span className="font-sans font-normal text-xs text-velvet-500 ml-2">Gold Foil, Wax Seals &amp; Luxury Accents</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-champagne-700 dark:text-champagne-400">bg-champagne-{'{50..900}'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3">
                    {champagneSwatches.map((item) => (
                      <div
                        key={item.shade}
                        onClick={() => copyToClipboard(item.hex, `champagne-${item.shade} (${item.hex})`)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div
                          className="h-24 p-2.5 flex flex-col justify-between"
                          style={{ backgroundColor: item.hex }}
                        >
                          <span className={`text-[11px] font-bold font-mono ${item.isDark ? 'text-white' : 'text-champagne-950'}`}>
                            {item.shade}
                          </span>
                          <Copy className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity self-end ${item.isDark ? 'text-white' : 'text-champagne-950'}`} />
                        </div>
                        <div className="p-2.5 bg-white dark:bg-velvet-800">
                          <p className="text-xs font-semibold text-velvet-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] font-mono text-velvet-500 dark:text-velvet-400 mt-0.5">{item.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Velvet & Noir Spectrum */}
                <div className="p-6 rounded-3xl bg-white dark:bg-velvet-900/60 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-velvet-800 ring-4 ring-velvet-300 dark:ring-velvet-700" />
                      <h3 className="font-display font-bold text-lg text-velvet-900 dark:text-white">
                        velvet-* <span className="font-sans font-normal text-xs text-velvet-500 ml-2">Midnight Plum, High Contrast &amp; Depth</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-velvet-700 dark:text-velvet-300">bg-velvet-{'{50..950}'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {velvetSwatches.map((item) => (
                      <div
                        key={item.shade}
                        onClick={() => copyToClipboard(item.hex, `velvet-${item.shade} (${item.hex})`)}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div
                          className="h-24 p-2.5 flex flex-col justify-between"
                          style={{ backgroundColor: item.hex }}
                        >
                          <span className={`text-[11px] font-bold font-mono ${item.isDark ? 'text-white' : 'text-velvet-950'}`}>
                            {item.shade}
                          </span>
                          <Copy className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity self-end ${item.isDark ? 'text-white' : 'text-velvet-950'}`} />
                        </div>
                        <div className="p-2.5 bg-white dark:bg-velvet-800">
                          <p className="text-xs font-semibold text-velvet-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] font-mono text-velvet-500 dark:text-velvet-400 mt-0.5">{item.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Brand Gradients preview */}
              <motion.div variants={itemVariants}>
                <h3 className="font-display text-xl font-bold mb-4">Curated Giftlove Gradients</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-32 rounded-2xl p-4 bg-gradient-to-r from-romantic-500 via-romantic-600 to-champagne-500 text-white flex flex-col justify-between shadow-romantic-md">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80">Signature Gradient</span>
                      <h4 className="font-display text-lg font-bold">Rose &amp; Gold Spark</h4>
                    </div>
                    <code className="text-[11px] font-mono opacity-90">bg-gradient-to-r from-romantic-500 to-champagne-500</code>
                  </div>

                  <div className="h-32 rounded-2xl p-4 bg-gradient-to-r from-velvet-900 via-romantic-900 to-velvet-800 text-white flex flex-col justify-between shadow-velvet-card">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80">Midnight Luxury</span>
                      <h4 className="font-display text-lg font-bold">Bordeaux Velvet</h4>
                    </div>
                    <code className="text-[11px] font-mono opacity-90">bg-gradient-to-r from-velvet-900 to-romantic-900</code>
                  </div>

                  <div className="h-32 rounded-2xl p-4 bg-gradient-to-r from-romantic-50 via-romantic-100 to-champagne-100 text-romantic-900 flex flex-col justify-between border border-romantic-200">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80">Morning Whisper</span>
                      <h4 className="font-display text-lg font-bold">Silk &amp; Champagne</h4>
                    </div>
                    <code className="text-[11px] font-mono opacity-90">bg-gradient-to-r from-romantic-50 to-champagne-100</code>
                  </div>
                </div>
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 2: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <CinematicPageWrapper key="tab-typography" pageKey="typography" className="space-y-10">
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                  Giftlove Typography System
                </h2>
                <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                  Poetic serifs for emotional gravitas, clean geometric sans for seamless checkout UX, and handwritten script accents.
                </p>
              </motion.div>

              {/* Interactive Preview Box */}
              <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-romantic-50 dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-romantic-700 dark:text-romantic-300 mb-2">
                  Live Font Specimen Tester
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-sm font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  placeholder="Type anything to test the fonts..."
                />
              </motion.div>

              {/* Font Family Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Playfair Display / Cormorant Garamond */}
                <div className="p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-romantic-100 dark:border-velvet-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-romantic-500">Display &amp; Editorial Serif</span>
                      <h3 className="font-display text-2xl font-bold text-romantic-900 dark:text-white">Playfair Display &amp; Cormorant</h3>
                    </div>
                    <code className="text-xs font-mono bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 px-2.5 py-1 rounded-md">
                      font-display / font-serif
                    </code>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] text-velvet-400 font-mono">Display Bold (600/700)</span>
                      <p className="font-display text-3xl font-bold text-romantic-900 dark:text-romantic-100 leading-snug">
                        {customText}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-velvet-400 font-mono">Serif Italic Romantic (400i)</span>
                      <p className="font-serif italic text-2xl text-romantic-700 dark:text-romantic-300">
                        "{customText}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 text-xs text-velvet-500">
                    <strong>Best Used For:</strong> Brand hero headlines, anniversary dates, gift set collection titles, romantic pull-quotes.
                  </div>
                </div>

                {/* 2. Plus Jakarta Sans */}
                <div className="p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-romantic-100 dark:border-velvet-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-champagne-600">Modern Geometric Sans</span>
                      <h3 className="font-sans text-2xl font-bold text-velvet-900 dark:text-white">Plus Jakarta Sans</h3>
                    </div>
                    <code className="text-xs font-mono bg-champagne-100 dark:bg-velvet-800 text-champagne-700 dark:text-champagne-300 px-2.5 py-1 rounded-md">
                      font-sans
                    </code>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] text-velvet-400 font-mono">SemiBold UI (600)</span>
                      <p className="font-sans text-xl font-semibold text-velvet-900 dark:text-velvet-100">
                        {customText}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-velvet-400 font-mono">Regular Body (400)</span>
                      <p className="font-sans text-sm text-velvet-600 dark:text-velvet-300 leading-relaxed">
                        {customText}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 text-xs text-velvet-500">
                    <strong>Best Used For:</strong> Product descriptions, gift customization inputs, shopping cart, buttons, navigation.
                  </div>
                </div>

                {/* 3. Alex Brush Script */}
                <div className="p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-romantic-100 dark:border-velvet-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-romantic-500">Romantic Handwritten Accent</span>
                      <h3 className="font-display text-2xl font-bold text-romantic-900 dark:text-white">Alex Brush &amp; Script Accents</h3>
                    </div>
                    <code className="text-xs font-mono bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 px-2.5 py-1 rounded-md">
                      font-script
                    </code>
                  </div>

                  <div className="py-2">
                    <p className="font-script text-4xl sm:text-5xl text-romantic-600 dark:text-romantic-400 leading-relaxed">
                      With all my heart &amp; forever yours, {recipientName}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 text-xs text-velvet-500">
                    <strong>Best Used For:</strong> Custom gift message sign-offs, wax seals, bespoke certificate cards, limited-edition badge flourishes.
                  </div>
                </div>
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 3: UI COMPONENTS */}
          {activeTab === 'components' && (
            <CinematicPageWrapper key="tab-components" pageKey="components" className="space-y-12">
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                  Giftlove UI Component Kit
                </h2>
                <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                  Production-ready components styled with the romantic palette, soft glowing elevations, and luxury interactions.
                </p>
              </motion.div>

              {/* Buttons & Actions */}
              <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6">Buttons &amp; Interactive Badges</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <button className="btn-romantic flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Send With Love ($149)</span>
                  </button>

                  <button className="btn-champagne flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>VIP Luxury Wrap</span>
                  </button>

                  <button className="btn-romantic-outline flex items-center gap-2">
                    <Feather className="w-4 h-4" />
                    <span>Add Handwritten Note</span>
                  </button>

                  <button className="px-5 py-3 rounded-full bg-velvet-900 hover:bg-velvet-800 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md">
                    <PackageCheck className="w-4 h-4 text-romantic-400" />
                    <span>Curated Gift Box</span>
                  </button>
                </div>

                {/* Badges & Tags */}
                <div className="mt-8 pt-6 border-t border-romantic-100 dark:border-velvet-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-velvet-500 mb-3">Pill Badges &amp; Status Indicators</h4>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-romantic-100 text-romantic-700 border border-romantic-200">
                      <Heart className="w-3 h-3 fill-romantic-500 text-romantic-500" />
                      Best for Anniversaries
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-champagne-100 text-champagne-800 border border-champagne-200">
                      <Sparkles className="w-3 h-3 text-champagne-600" />
                      24k Gold Foil Included
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-velvet-100 dark:bg-velvet-800 text-velvet-800 dark:text-velvet-200 border border-velvet-200 dark:border-velvet-700">
                      <ShieldCheck className="w-3 h-3 text-romantic-500" />
                      Signature Protected
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Gift Product Cards */}
              <motion.div variants={itemVariants}>
                <h3 className="font-display text-xl font-bold mb-6">Romantic Gift Product Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "The Eternal Rose Hamper",
                      tag: "Most Loved",
                      price: "$185",
                      rating: "4.95",
                      desc: "Hand-preserved Ecuadorian roses, vintage prosecco, and artisanal dark chocolate truffles.",
                      gradient: "from-romantic-500 to-romantic-700",
                      badgeBg: "bg-romantic-500 text-white"
                    },
                    {
                      title: "Golden Hour Keepsake Box",
                      tag: "Luxury Edition",
                      price: "$240",
                      rating: "5.0",
                      desc: "Custom engraved locket, champagne silk candle, and wax-sealed parchment love letter.",
                      gradient: "from-champagne-500 to-champagne-700",
                      badgeBg: "bg-champagne-500 text-white"
                    },
                    {
                      title: "Midnight Rendezvous Set",
                      tag: "Anniversary Exclusive",
                      price: "$195",
                      rating: "4.98",
                      desc: "Velvet ribbon bound memories journal, crystal fragrance flacon, and midnight berry truffles.",
                      gradient: "from-velvet-800 to-romantic-900",
                      badgeBg: "bg-velvet-900 text-white"
                    }
                  ].map((product, idx) => (
                    <div
                      key={idx}
                      className="group rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 overflow-hidden shadow-sm hover:shadow-romantic-lg transition-all duration-300 flex flex-col"
                    >
                      {/* Visual Card Header */}
                      <div className={`h-48 bg-gradient-to-tr ${product.gradient} p-6 flex flex-col justify-between relative overflow-hidden text-white`}>
                        <div className="flex justify-between items-start">
                          <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${product.badgeBg} shadow-sm`}>
                            {product.tag}
                          </span>
                          <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors">
                            <Heart className="w-4 h-4 text-white hover:fill-white" />
                          </button>
                        </div>
                        <div>
                          <span className="text-xs text-white/80 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-champagne-300" />
                            Handcrafted Gift Experience
                          </span>
                          <h4 className="font-display font-bold text-xl text-white mt-1">{product.title}</h4>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-velvet-600 dark:text-velvet-300 leading-relaxed">
                          {product.desc}
                        </p>

                        <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-velvet-400">Total Price</span>
                            <p className="font-display font-bold text-xl text-romantic-900 dark:text-white">{product.price}</p>
                          </div>
                          <button className="p-3 rounded-full bg-romantic-50 dark:bg-velvet-800 text-romantic-600 dark:text-romantic-400 hover:bg-romantic-500 hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Password Protection Overlay Showcase */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-romantic-200 dark:border-velvet-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-romantic-500" />
                    <span>Privacy &amp; Security Layer</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                    Gift Vault PasswordProtection Overlay
                  </h3>
                  <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
                    A luxury romantic overlay that guards sensitive gift reveals, handwritten letters, and surprise hampers with secure input styling, error shake feedback, password hint disclosures, and animated confetti unboxing.
                  </p>
                </div>

                <div className="p-4 sm:p-8 rounded-3xl bg-romantic-50/50 dark:bg-velvet-950/60 border border-romantic-200/80 dark:border-velvet-800">
                  <PasswordProtection
                    correctPassword="forever"
                    hint="Our special anniversary word (Default: 'forever')"
                    giftTitle="The Eternal Rose Hamper & Parchment Keepsake"
                    recipientName="Eleanor"
                    senderName="Alexander"
                    theme="romantic"
                    showDemoControls={true}
                  />
                </div>
              </motion.div>

              {/* Love Quiz Interactive Component Showcase */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-romantic-200 dark:border-velvet-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
                      <HelpCircle className="w-3.5 h-3.5 text-romantic-500" />
                      <span>Couple Gamification &amp; Milestones</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                      Love Quiz &amp; Certificate Component
                    </h3>
                    <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
                      Multiple-choice relationship trivia engine with animated progress bar, real-time score tallying, romantic reflections, confetti celebration, and certified love verdict badges.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('quiz')}
                    className="btn-romantic flex items-center gap-2 text-xs self-start sm:self-auto"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Open Full Love Quiz Studio</span>
                  </button>
                </div>

                <div className="p-4 sm:p-8 rounded-3xl bg-white/70 dark:bg-velvet-900/70 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                  <LoveQuiz partnerOneName={recipientName} partnerTwoName={senderName} />
                </div>
              </motion.div>

              {/* Romantic Scratch Card Interactive Component Showcase */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-romantic-200 dark:border-velvet-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
                      <span>Sensory Unboxing &amp; Scratch Canvas</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                      Romantic Scratch Card &amp; Secret Reveal
                    </h3>
                    <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
                      Metallic foil scratch-off canvas engine with real-time transparency percentage calculation, mouse/swipe unmasking, confetti burst, and customizable trip vouchers, love notes, or memory photos.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('scratch_card')}
                    className="btn-romantic flex items-center gap-2 text-xs self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Open Full Scratch Card Studio</span>
                  </button>
                </div>

                <div className="p-4 sm:p-8 rounded-3xl bg-white/70 dark:bg-velvet-900/70 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                  <RomanticScratchCard initialRecipient={recipientName} initialSender={senderName} />
                </div>
              </motion.div>

              {/* Gift Payment & Checkout Component Showcase */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-romantic-200 dark:border-velvet-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
                      <CreditCard className="w-3.5 h-3.5 text-champagne-500" />
                      <span>Razorpay &amp; Manual UPI Payment Flow</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                      Giftlove Payment &amp; Checkout System
                    </h3>
                    <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
                      Production checkout interface integrating official Razorpay overlay and manual UPI QR verification with 12-digit UTR tracking, romantic gift vouchers, and cinematic success confetti animations.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('payment')}
                    className="btn-romantic flex items-center gap-2 text-xs self-start sm:self-auto"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Open Full Checkout Studio</span>
                  </button>
                </div>

                <div className="p-4 sm:p-8 rounded-3xl bg-white/70 dark:bg-velvet-900/70 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                  <GiftPayment initialRecipient={recipientName} initialSender={senderName} />
                </div>
              </motion.div>

              {/* Printable PDF Keepsake Studio Showcase */}
              <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-romantic-200 dark:border-velvet-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
                      <FileText className="w-3.5 h-3.5 text-champagne-500" />
                      <span>300 DPI Vector PDF Exporter</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-romantic-950 dark:text-white">
                      Printable PDF Keepsake Studio
                    </h3>
                    <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-2xl">
                      Vector PDF generator and printing service exporting custom love letters, milestone memory cards, certificates of eternal devotion, and romantic vouchers with gold foil borders, wax seals, and scannable QR vaults.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('pdf_keepsake')}
                    className="btn-romantic flex items-center gap-2 text-xs self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open Full PDF Keepsake Studio</span>
                  </button>
                </div>

                <div className="p-4 sm:p-8 rounded-3xl bg-white/70 dark:bg-velvet-900/70 border border-romantic-200 dark:border-velvet-800 shadow-sm">
                  <PdfKeepsakeStudio
                    initialRecipient={recipientName}
                    initialSender={senderName}
                    initialMessage={noteMessage}
                    initialTheme={selectedPaper}
                  />
                </div>
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 4: LOVE LETTER STUDIO (INTERACTIVE BUILDER) */}
          {activeTab === 'card_builder' && (
            <CinematicPageWrapper key="tab-card-builder" pageKey="card_builder" className="space-y-8">
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                  Giftlove Handwritten Letter Studio
                </h2>
                <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                  Customize a bespoke romantic gift card with live wax seal selection and typography styling.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-5">
                    <h3 className="font-display font-bold text-lg text-romantic-900 dark:text-white flex items-center gap-2">
                      <Feather className="w-4 h-4 text-romantic-500" />
                      Customize Your Message
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-sm focus:ring-2 focus:ring-romantic-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">Love Note Content</label>
                      <textarea
                        rows={4}
                        value={noteMessage}
                        onChange={(e) => setNoteMessage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-sm focus:ring-2 focus:ring-romantic-400 outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1.5">From / Signature</label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-sm focus:ring-2 focus:ring-romantic-400 outline-none"
                      />
                    </div>

                    {/* Paper Texture Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">Parchment Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'blush', label: 'Petal Blush', bg: 'bg-romantic-50 border-romantic-300' },
                          { id: 'champagne', label: 'Champagne Silk', bg: 'bg-champagne-50 border-champagne-300' },
                          { id: 'cream', label: 'Vintage Cream', bg: 'bg-amber-50 border-amber-200' },
                          { id: 'velvet', label: 'Midnight Velvet', bg: 'bg-velvet-900 border-velvet-700 text-white' },
                        ].map((paper) => (
                          <button
                            key={paper.id}
                            onClick={() => setSelectedPaper(paper.id as any)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${paper.bg} ${
                              selectedPaper === paper.id ? 'ring-2 ring-romantic-500 scale-[1.02]' : 'opacity-80'
                            }`}
                          >
                            {paper.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wax Seal Stamp Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">Embossed Wax Seal</label>
                      <div className="flex gap-3">
                        {[
                          { id: 'rose', label: '🌹 Velvet Rose' },
                          { id: 'heart', label: '💝 Heart Monogram' },
                          { id: 'ring', label: '💍 Forever Gem' },
                          { id: 'dove', label: '🕊️ Peace Dove' },
                        ].map((seal) => (
                          <button
                            key={seal.id}
                            onClick={() => setSelectedSeal(seal.id as any)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                              selectedSeal === seal.id
                                ? 'bg-romantic-500 text-white border-romantic-500 shadow-romantic-sm'
                                : 'bg-white dark:bg-velvet-800 border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300'
                            }`}
                          >
                            {seal.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Card Preview Column */}
                <div className="lg:col-span-7 flex items-center justify-center">
                  <div
                    className={`w-full max-w-lg p-8 sm:p-10 rounded-3xl shadow-2xl transition-all duration-300 relative border ${
                      selectedPaper === 'blush'
                        ? 'bg-gradient-to-br from-[#fff5f6] via-[#ffe4e8] to-[#fecdd6] border-romantic-300 text-romantic-950'
                        : selectedPaper === 'champagne'
                        ? 'bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e7] to-[#ede2cc] border-champagne-300 text-velvet-950'
                        : selectedPaper === 'cream'
                        ? 'bg-gradient-to-br from-[#fffdfa] to-[#f5eedc] border-amber-200 text-amber-950'
                        : 'bg-gradient-to-br from-velvet-950 via-velvet-900 to-romantic-950 border-velvet-700 text-romantic-100'
                    }`}
                  >
                    {/* Gold Foil Accent Border */}
                    <div className="absolute inset-3 border border-champagne-400/40 rounded-2xl pointer-events-none" />

                    {/* Header Ornament */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-[1px] w-12 bg-champagne-400" />
                        <Sparkles className="w-4 h-4 text-champagne-500" />
                        <div className="h-[1px] w-12 bg-champagne-400" />
                      </div>
                      <p className="font-serif italic text-xs tracking-widest uppercase mt-1 opacity-75">Giftlove Handwritten Keepsake</p>
                    </div>

                    {/* Card Message */}
                    <div className="space-y-6 text-center my-6">
                      <p className="font-display text-2xl font-bold tracking-tight">
                        Dearest {recipientName || 'Beloved'},
                      </p>
                      <p className="font-serif text-lg leading-relaxed italic px-4">
                        "{noteMessage || 'Your thoughtful words appear here...'}"
                      </p>
                      <div className="pt-4">
                        <p className="font-script text-3xl text-romantic-600 dark:text-romantic-400">
                          Forever yours, {senderName || 'Your Love'}
                        </p>
                      </div>
                    </div>

                    {/* Wax Seal Stamp Visual */}
                    <div className="mt-8 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-romantic-800 via-romantic-600 to-romantic-500 shadow-romantic-lg flex items-center justify-center text-white border-2 border-champagne-300/60 transform hover:rotate-12 transition-transform cursor-pointer">
                        <div className="text-xl">
                          {selectedSeal === 'rose' && '🌹'}
                          {selectedSeal === 'heart' && '💖'}
                          {selectedSeal === 'ring' && '💍'}
                          {selectedSeal === 'dove' && '🕊️'}
                        </div>
                      </div>
                    </div>

                    {/* One-Click PDF Export Actions */}
                    <div className="mt-8 pt-6 border-t border-champagne-300/40 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={async () => {
                          await exportKeepsakeAsPdf({
                            template: 'love_letter',
                            recipientName,
                            senderName,
                            message: noteMessage,
                            theme: selectedPaper,
                            sealType: selectedSeal === 'rose' ? 'rose' : selectedSeal === 'ring' ? 'ring' : selectedSeal === 'dove' ? 'dove' : 'heart',
                            includeGoldFoil: true,
                            includeWatermark: true,
                            includeQrCode: true,
                            giftUrl: 'https://giftlove.app/reveal',
                            pageSize: 'a4'
                          });
                        }}
                        className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-gradient-to-r from-romantic-500 via-rose-500 to-champagne-500 hover:from-romantic-600 hover:to-champagne-600 text-white font-bold text-xs shadow-romantic-md hover:shadow-romantic-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Printable PDF Keepsake (300 DPI)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabChange('pdf_keepsake');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-white/90 dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300 font-semibold text-xs hover:border-romantic-400 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-romantic-500" />
                        <span>Full Keepsake Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 4.5: PRINTABLE PDF KEEPSAKE STUDIO */}
          {activeTab === 'pdf_keepsake' && (
            <CinematicPageWrapper key="tab-pdf-keepsake" pageKey="pdf_keepsake" className="space-y-8">
              <motion.div variants={itemVariants}>
                <PdfKeepsakeStudio
                  initialRecipient={recipientName}
                  initialSender={senderName}
                  initialMessage={noteMessage}
                  initialTheme={selectedPaper}
                />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 5: SCRATCH CARD UNBOXING STUDIO */}
          {activeTab === 'scratch_card' && (
            <CinematicPageWrapper key="tab-scratch-card" pageKey="scratch_card" className="space-y-8">
              <motion.div variants={itemVariants}>
                <RomanticScratchCard
                  initialRecipient={recipientName}
                  initialSender={senderName}
                />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 6: QR REVEAL CARD STUDIO */}
          {activeTab === 'qr_card' && (
            <CinematicPageWrapper key="tab-qr-card" pageKey="qr_card" className="space-y-8">
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                  Gift QR Code &amp; Branded Keepsake Frame
                </h2>
                <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                  Generate high-resolution, luxury branded QR cards that recipients can scan to reveal their digital gift experience.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <GiftQrCodeCard
                  initialRecipient={recipientName}
                  initialSender={senderName}
                />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 6: 3D PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <CinematicPageWrapper key="tab-gallery" pageKey="gallery" className="space-y-8">
              <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                      Romantic Keepsake Gallery
                    </h2>
                    <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                      Responsive masonry layout with hover-triggered 3D perspective tilt, specular reflection glares, and lightbox story inspection.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <RomanticPhotoGallery />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 7: INTERACTIVE COUNTDOWN */}
          {activeTab === 'countdown' && (
            <CinematicPageWrapper key="tab-countdown" pageKey="countdown" className="space-y-8">
              <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                      Interactive Milestone Countdown
                    </h2>
                    <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                      Animated flip cards, real-time heartbeat rhythm pulses, rose petal confetti showers, and milestone journey tracking for anniversaries and birthdays.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <InteractiveCountdown />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 8: LOVE QUIZ */}
          {activeTab === 'quiz' && (
            <CinematicPageWrapper key="tab-quiz" pageKey="quiz" className="space-y-8">
              <motion.div variants={itemVariants}>
                <LoveQuiz
                  partnerOneName={recipientName}
                  partnerTwoName={senderName}
                />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB: LUXURY PAYMENT & CHECKOUT */}
          {activeTab === 'payment' && (
            <CinematicPageWrapper key="tab-payment" pageKey="payment" className="space-y-8">
              <motion.div variants={itemVariants}>
                <GiftPayment
                  initialRecipient={recipientName}
                  initialSender={senderName}
                />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 9: ADMIN STUDIO DASHBOARD */}
          {activeTab === 'admin' && (
            <CinematicPageWrapper key="tab-admin" pageKey="admin" className="space-y-8">
              <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                      Atelier Admin Management Studio
                    </h2>
                    <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                      Comprehensive concierge administration for VIP clients, luxury gift inventory, manual bank wire &amp; Zelle verification, and global store settings.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <AdminDashboard />
              </motion.div>
            </CinematicPageWrapper>
          )}

          {/* TAB 9: CONTACT & SUPPORT CONCIERGE */}
          {activeTab === 'support' && (
            <CinematicPageWrapper key="tab-support" pageKey="support" className="space-y-8">
              <ContactSupport />
            </CinematicPageWrapper>
          )}

          {/* TAB 10: TOKENS & TAILWIND CONFIG */}
          {activeTab === 'tokens' && (
            <CinematicPageWrapper key="tab-tokens" pageKey="tokens" className="space-y-8">
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                    Tailwind CSS Configuration Tokens
                  </h2>
                  <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-1">
                    Ready to drop into any Tailwind project (`tailwind.config.js`).
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`export default {
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#fff5f6', 100: '#ffe4e8', 200: '#fecdd6', 300: '#fda4b4',
          400: '#fb718b', 500: '#f43f68', 600: '#e11d53', 700: '#be1243',
          800: '#9f123c', 900: '#881337', 950: '#4c051a',
        },
        champagne: {
          50: '#fdfbf7', 100: '#f7f2e7', 200: '#ede2cc', 300: '#dfcca8',
          400: '#cfb27e', 500: '#bfa060', 600: '#a38249', 700: '#836539',
          800: '#674e30', 900: '#483520',
        },
        velvet: {
          50: '#faf7f8', 100: '#f3ecef', 200: '#e6d8de', 300: '#d2bcc6',
          400: '#b899a7', 500: '#9e798c', 600: '#815e71', 700: '#674a5a',
          800: '#3e2834', 900: '#22121c', 950: '#140910',
        },
        pearl: '#fdfcfb'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        'romantic-md': '0 10px 25px -5px rgba(244, 63, 104, 0.18)',
        'romantic-lg': '0 20px 35px -8px rgba(244, 63, 104, 0.25)',
        'champagne-glow': '0 0 25px -3px rgba(191, 160, 96, 0.35)',
      }
    }
  }
}`, 'Full Tailwind Theme Config')}
                  className="btn-romantic flex items-center gap-2 text-xs self-start"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Theme Config</span>
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-3xl bg-velvet-950 text-white p-6 border border-velvet-800 font-mono text-xs overflow-x-auto shadow-2xl">
                <pre className="text-romantic-200">
{`// tailwind.config.js for Giftlove
export default {
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#fff5f6',   // Whisper Silk
          100: '#ffe4e8',  // Morning Rose
          200: '#fecdd6',  // Petal Blush
          300: '#fda4b4',  // Coral Blush
          400: '#fb718b',  // Peony Pink
          500: '#f43f68',  // Passion Rose (Signature Primary)
          600: '#e11d53',  // Crimson Romance
          700: '#be1243',  // Velvet Rose
          800: '#9f123c',  // Royal Wine
          900: '#881337',  // Vintage Bordeaux
          950: '#4c051a',  // Romantic Noir
        },
        champagne: {
          50: '#fdfbf7',   // Frosted Champagne
          100: '#f7f2e7',  // Gold Silk
          200: '#ede2cc',  // Soft Bullion
          300: '#dfcca8',  // Shimmering Sand
          400: '#cfb27e',  // Muted Gold
          500: '#bfa060',  // Polished Gold Accent
          600: '#a38249',  // Antique Brass
          700: '#836539',  // Deep Bronze
        },
        velvet: {
          50: '#faf7f8',
          800: '#3e2834',  // Deep Plum Velvet
          900: '#22121c',  // Midnight Wine Canvas
          950: '#140910',  // Obsidian Noir
        },
        pearl: '#fdfcfb'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        'romantic-md': '0 10px 25px -5px rgba(244, 63, 104, 0.18)',
        'romantic-lg': '0 20px 35px -8px rgba(244, 63, 104, 0.25)',
        'champagne-glow': '0 0 25px -3px rgba(191, 160, 96, 0.35)',
      }
    }
  }
}`}
                </pre>
              </motion.div>
            </CinematicPageWrapper>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-romantic-100 dark:border-velvet-800 py-12 bg-white/60 dark:bg-velvet-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-velvet-500 dark:text-velvet-400">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-romantic-500 fill-romantic-500" />
            <span className="font-semibold text-velvet-800 dark:text-velvet-200">Giftlove Design System</span>
            <span>— Crafted with love and timeless elegance.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                handleTabChange('pdf_keepsake');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-romantic-600 dark:text-champagne-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Printable PDF Keepsakes</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTabChange('payment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-romantic-600 dark:text-champagne-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Luxury Checkout &amp; Pay</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTabChange('scratch_card');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-romantic-600 dark:text-champagne-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Romantic Scratch Card</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTabChange('quiz');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-romantic-600 dark:text-champagne-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Couple Love Quiz</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTabChange('support');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-romantic-600 dark:text-champagne-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <Headset className="w-3.5 h-3.5" />
              <span>Contact Concierge Support</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTabChange('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy-First Analytics</span>
            </button>
            <span>•</span>
            <p>© 2026 Giftlove Brand Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Privacy-Friendly Analytics Tracker */}
      <PrivacyAnalyticsTracker activeTab={activeTab} isDarkMode={isDarkMode} />

      {/* Centralized Zustand Toast Notification Notification Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-velvet-950/95 dark:bg-velvet-900/95 text-white border border-romantic-400/40 shadow-2xl backdrop-blur-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-romantic-500 to-rose-400 flex items-center justify-center shrink-0 shadow-romantic-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-romantic-50">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <CinematicTransitionProvider>
      <GiftloveAppContent />
    </CinematicTransitionProvider>
  );
}
