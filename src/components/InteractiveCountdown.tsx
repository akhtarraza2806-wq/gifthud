import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Heart,
  Sparkles,
  Gift,
  PartyPopper,
  Crown,
  Bell,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  VolumeX,
  Flame,
  Award,
  ChevronRight,
  Plus,
  Play
} from 'lucide-react';

export interface CountdownEvent {
  id: string;
  title: string;
  recipientName: string;
  targetDate: string; // ISO string
  createdDate: string;
  eventType: 'anniversary' | 'birthday' | 'proposal' | 'date_night' | 'custom';
  theme: 'blush' | 'champagne' | 'midnight' | 'burgundy';
  message: string;
  icon: string;
}

const PRESET_EVENTS: CountdownEvent[] = [
  {
    id: 'preset-1',
    title: 'Our 5th Wedding Anniversary in Venice',
    recipientName: 'Eleanor',
    targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42 + 1000 * 60 * 60 * 14).toISOString(),
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
    eventType: 'anniversary',
    theme: 'burgundy',
    message: 'Five years of laughter, slow dances in the kitchen, and infinite love.',
    icon: '💍',
  },
  {
    id: 'preset-2',
    title: "Eleanor's 25th Milestone Birthday Ball",
    recipientName: 'Eleanor',
    targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18 + 1000 * 60 * 60 * 6 + 1000 * 60 * 30).toISOString(),
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    eventType: 'birthday',
    theme: 'champagne',
    message: 'To the woman who makes every second feel like pure champagne and starlight.',
    icon: '🎂',
  },
  {
    id: 'preset-3',
    title: 'Surprise Twilight Date & Rose Garden Proposal',
    recipientName: 'Julian',
    targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 19).toISOString(),
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    eventType: 'proposal',
    theme: 'midnight',
    message: 'A secret reservation under the stars with live violin and vintage rosé.',
    icon: '🌹',
  },
];

/**
 * Romantic Synthesizer for celebration chimes (Web Audio API)
 */
function playRomanticChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major romantic chord)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 1.3);
    });
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

/**
 * Fire romantic rose and gold confetti shower
 */
function launchRomanticConfetti() {
  playRomanticChime();
  const colors = ['#e11d48', '#fb7185', '#cfb27e', '#ffffff', '#ffd0db', '#881337'];

  // Left burst
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.7 },
    colors,
  });

  // Right burst
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.7 },
    colors,
  });

  // Center star burst
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      shapes: ['star', 'circle'],
    });
  }, 200);
}

interface TimeUnitCardProps {
  value: number;
  label: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    labelColor: string;
    glow: string;
  };
}

const TimeUnitCard: React.FC<TimeUnitCardProps> = ({ value, label, colorScheme }) => {
  const formattedValue = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-20 sm:w-28 md:w-32 h-24 sm:h-32 md:h-36 rounded-3xl ${colorScheme.bg} border ${colorScheme.border} ${colorScheme.glow} shadow-xl flex items-center justify-center overflow-hidden group`}
      >
        {/* Subtle Horizontal Divider for Flip-Clock look */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/10 dark:bg-white/10 z-10 pointer-events-none" />

        {/* Ambient Top Light */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/20 dark:bg-white/5 pointer-events-none" />

        {/* Corner Accents */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-champagne-400/60" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-champagne-400/60" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-champagne-400/60" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-champagne-400/60" />

        {/* Rolling Number with AnimatePresence */}
        <div className="relative overflow-hidden h-14 sm:h-18 md:h-20 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={formattedValue}
              initial={{ y: -40, opacity: 0, rotateX: 45 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: 40, opacity: 0, rotateX: -45 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight ${colorScheme.text} drop-shadow-sm select-none`}
            >
              {formattedValue}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <span
        className={`mt-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest ${colorScheme.labelColor}`}
      >
        {label}
      </span>
    </div>
  );
};

export const InteractiveCountdown: React.FC = () => {
  const [events, setEvents] = useState<CountdownEvent[]>(() => {
    const saved = localStorage.getItem('giftlove_countdowns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return PRESET_EVENTS;
      }
    }
    return PRESET_EVENTS;
  });

  const [activeEventId, setActiveEventId] = useState<string>(PRESET_EVENTS[0].id);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Form State for Editing/Creating
  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0] || PRESET_EVENTS[0];
  }, [events, activeEventId]);

  const [formTitle, setFormTitle] = useState(activeEvent.title);
  const [formRecipient, setFormRecipient] = useState(activeEvent.recipientName);
  const [formDate, setFormDate] = useState(
    new Date(activeEvent.targetDate).toISOString().slice(0, 16)
  );
  const [formTheme, setFormTheme] = useState<CountdownEvent['theme']>(activeEvent.theme);
  const [formType, setFormType] = useState<CountdownEvent['eventType']>(activeEvent.eventType);
  const [formMessage, setFormMessage] = useState(activeEvent.message);
  const [formIcon, setFormIcon] = useState(activeEvent.icon);

  // Synchronize form when active event switches
  useEffect(() => {
    if (activeEvent) {
      setFormTitle(activeEvent.title);
      setFormRecipient(activeEvent.recipientName);
      try {
        setFormDate(new Date(activeEvent.targetDate).toISOString().slice(0, 16));
      } catch (e) {
        setFormDate(new Date().toISOString().slice(0, 16));
      }
      setFormTheme(activeEvent.theme);
      setFormType(activeEvent.eventType);
      setFormMessage(activeEvent.message);
      setFormIcon(activeEvent.icon);
    }
  }, [activeEventId]);

  // Real-time time remaining calculations
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    isFinished: boolean;
    progressPercentage: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    isFinished: false,
    progressPercentage: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(activeEvent.targetDate).getTime();
      const created = new Date(activeEvent.createdDate || now - 1000 * 60 * 60 * 24 * 30).getTime();

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          isFinished: true,
          progressPercentage: 100,
        });
        return;
      }

      const totalDuration = target - created;
      const elapsed = now - created;
      const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((diff % 1000) / 10);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        isFinished: false,
        progressPercentage: progress,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 50);
    return () => clearInterval(interval);
  }, [activeEvent]);

  // Persist to local storage
  const saveEvents = (updated: CountdownEvent[]) => {
    setEvents(updated);
    localStorage.setItem('giftlove_countdowns', JSON.stringify(updated));
  };

  // Quick date modifier helpers
  const handleSetQuickDate = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setFormDate(d.toISOString().slice(0, 16));
  };

  // Save current form as active event or new event
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = events.map((ev) => {
      if (ev.id === activeEvent.id) {
        return {
          ...ev,
          title: formTitle,
          recipientName: formRecipient,
          targetDate: new Date(formDate).toISOString(),
          theme: formTheme,
          eventType: formType,
          message: formMessage,
          icon: formIcon,
        };
      }
      return ev;
    });

    saveEvents(updated);
    setIsEditing(false);
    launchRomanticConfetti();
  };

  // Create new countdown event
  const handleCreateNew = () => {
    const newId = `event-${Date.now()}`;
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 30);

    const newEv: CountdownEvent = {
      id: newId,
      title: 'Our Next Romantic Milestone',
      recipientName: 'My Dearest',
      targetDate: newDate.toISOString(),
      createdDate: new Date().toISOString(),
      eventType: 'custom',
      theme: 'blush',
      message: 'Counting down every magical breath until we hold each other again.',
      icon: '✨',
    };

    const updated = [newEv, ...events];
    saveEvents(updated);
    setActiveEventId(newId);
    setIsEditing(true);
  };

  // Copy countdown share summary
  const handleCopySummary = () => {
    const summary = `⏳ Countdown to ${activeEvent.title} for ${activeEvent.recipientName}:\n` +
      `${timeLeft.days} Days, ${timeLeft.hours} Hours, ${timeLeft.minutes} Minutes, ${timeLeft.seconds} Seconds remaining!\n` +
      `💌 "${activeEvent.message}"`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Dynamic Theme Styling
  const themeDetails = useMemo(() => {
    switch (activeEvent.theme) {
      case 'champagne':
        return {
          containerBg: 'bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e7] to-[#ede2cc] dark:from-[#211606] dark:via-[#1a1105] dark:to-[#0f0a02]',
          border: 'border-champagne-300 dark:border-champagne-800',
          accentText: 'text-champagne-700 dark:text-champagne-300',
          cardScheme: {
            bg: 'bg-white dark:bg-velvet-900/90',
            border: 'border-champagne-300 dark:border-champagne-700/60',
            text: 'text-champagne-950 dark:text-champagne-100',
            labelColor: 'text-champagne-800 dark:text-champagne-300',
            glow: 'shadow-champagne-100/50 dark:shadow-none',
          },
          badgeBg: 'bg-champagne-500 text-velvet-950',
          ringColor: '#cfb27e',
        };
      case 'midnight':
        return {
          containerBg: 'bg-gradient-to-br from-[#1c0612] via-[#2a091b] to-[#0f030a]',
          border: 'border-velvet-700',
          accentText: 'text-romantic-300',
          cardScheme: {
            bg: 'bg-velvet-900/90',
            border: 'border-romantic-500/40',
            text: 'text-romantic-100',
            labelColor: 'text-romantic-300',
            glow: 'shadow-romantic-900/60',
          },
          badgeBg: 'bg-romantic-600 text-white',
          ringColor: '#fb7185',
        };
      case 'burgundy':
        return {
          containerBg: 'bg-gradient-to-br from-[#4c051a] via-[#700d2b] to-[#2e020f]',
          border: 'border-romantic-800',
          accentText: 'text-romantic-200',
          cardScheme: {
            bg: 'bg-white dark:bg-velvet-900',
            border: 'border-romantic-400 dark:border-romantic-700',
            text: 'text-romantic-950 dark:text-romantic-100',
            labelColor: 'text-white dark:text-romantic-200',
            glow: 'shadow-romantic-950/40',
          },
          badgeBg: 'bg-champagne-400 text-romantic-950',
          ringColor: '#e11d48',
        };
      case 'blush':
      default:
        return {
          containerBg: 'bg-gradient-to-br from-[#fff5f6] via-[#ffe4e8] to-[#fecdd6] dark:from-[#2b0816] dark:via-[#1c050e] dark:to-[#0f0208]',
          border: 'border-romantic-300 dark:border-velvet-800',
          accentText: 'text-romantic-700 dark:text-romantic-300',
          cardScheme: {
            bg: 'bg-white dark:bg-velvet-900',
            border: 'border-romantic-200 dark:border-velvet-700',
            text: 'text-romantic-950 dark:text-white',
            labelColor: 'text-romantic-700 dark:text-romantic-300',
            glow: 'shadow-romantic-200/50 dark:shadow-none',
          },
          badgeBg: 'bg-romantic-500 text-white',
          ringColor: '#f43f68',
        };
    }
  }, [activeEvent.theme]);

  return (
    <div className="space-y-8">
      {/* Top Event Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 dark:bg-velvet-900/70 p-3 sm:p-4 rounded-3xl border border-romantic-200 dark:border-velvet-800 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {events.map((ev) => {
            const isCurrent = ev.id === activeEventId;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  setActiveEventId(ev.id);
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-romantic-500 to-romantic-600 text-white shadow-romantic-sm scale-[1.02]'
                    : 'bg-white dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300 hover:border-romantic-300'
                }`}
              >
                <span>{ev.icon}</span>
                <span>{ev.title}</span>
              </button>
            );
          })}

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 border border-dashed border-romantic-300 dark:border-velvet-700 hover:bg-romantic-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Countdown</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-velvet-700 dark:text-velvet-300 hover:text-romantic-600 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-romantic-500" />
            <span>{isEditing ? 'View Live Countdown' : 'Edit Date & Theme'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-velvet-600 dark:text-velvet-400 hover:text-romantic-600 transition-colors"
            title={soundEnabled ? 'Mute Celebration Sound' : 'Enable Celebration Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Countdown Showcase or Editor */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          /* ====================================================
             1. CUSTOMIZE & EDIT COUNTDOWN FORM
             ==================================================== */
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-xl max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-romantic-100 dark:border-velvet-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-romantic-950 dark:text-white">
                    Customize Romantic Countdown
                  </h3>
                  <p className="text-xs text-velvet-500 dark:text-velvet-400">
                    Set your milestone date, dedicated message, and visual styling.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                  Milestone Occasion Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Our 5th Anniversary in Venice"
                  className="w-full px-4 py-3 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-sm font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                  required
                />
              </div>

              {/* Recipient & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Recipient / Beloved Name
                  </label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Eleanor"
                    className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                    Emblem / Icon
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  >
                    <option value="💍">💍 Ring</option>
                    <option value="🎂">🎂 Cake</option>
                    <option value="🌹">🌹 Rose</option>
                    <option value="💖">💖 Heart</option>
                    <option value="🥂">🥂 Toast</option>
                    <option value="👑">👑 Crown</option>
                    <option value="✈️">✈️ Getaway</option>
                  </select>
                </div>
              </div>

              {/* Target Date Selector with Quick Helpers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                    Target Milestone Date &amp; Time
                  </label>
                  <span className="text-[11px] text-romantic-500 font-medium">Local Time</span>
                </div>
                <input
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                  required
                />

                {/* Quick Date Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-velvet-500">Quick set:</span>
                  {[
                    { label: '+3 Days', days: 3 },
                    { label: '+1 Week', days: 7 },
                    { label: '+1 Month', days: 30 },
                    { label: '+100 Days', days: 100 },
                    { label: '+1 Year', days: 365 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => handleSetQuickDate(preset.days)}
                      className="px-2.5 py-1 rounded-lg bg-romantic-100 dark:bg-velvet-800 text-[11px] font-semibold text-romantic-700 dark:text-romantic-300 hover:bg-romantic-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedicated Love Message */}
              <div>
                <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Poetic Love Message / Note
                </label>
                <textarea
                  rows={2}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Counting down every moment..."
                  className="w-full px-4 py-2.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-serif italic focus:ring-2 focus:ring-romantic-400 outline-none"
                />
              </div>

              {/* Theme Palette */}
              <div>
                <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-2">
                  Visual Aesthetic Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'blush', name: 'Petal Blush', color: 'bg-romantic-100 border-romantic-300 text-romantic-900' },
                    { id: 'champagne', name: 'Champagne Silk', color: 'bg-champagne-100 border-champagne-300 text-champagne-950' },
                    { id: 'midnight', name: 'Midnight Plum', color: 'bg-velvet-950 border-velvet-700 text-romantic-200' },
                    { id: 'burgundy', name: 'Royal Bordeaux', color: 'bg-romantic-900 border-romantic-700 text-white' },
                  ].map((th) => (
                    <button
                      type="button"
                      key={th.id}
                      onClick={() => setFormTheme(th.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${th.color} ${
                        formTheme === th.id
                          ? 'ring-2 ring-romantic-500 scale-[1.02] shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>{th.name}</span>
                      {formTheme === th.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-velvet-600 dark:text-velvet-400 hover:bg-romantic-50 dark:hover:bg-velvet-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-romantic text-xs px-6 py-2.5 flex items-center gap-2 shadow-romantic-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-champagne-300" />
                  <span>Save &amp; Start Countdown</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ====================================================
             2. LIVE ANIMATED COUNTDOWN SHOWCASE
             ==================================================== */
          <motion.div
            key="live-countdown"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`relative rounded-[36px] p-6 sm:p-10 md:p-12 border ${themeDetails.border} ${themeDetails.containerBg} shadow-2xl overflow-hidden`}
          >
            {/* Ambient Background Aura */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-romantic-400/20 dark:bg-romantic-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-champagne-400/20 dark:bg-champagne-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Inner Filigree Accent Border */}
            <div className="absolute inset-3 sm:inset-4 border border-champagne-400/30 rounded-[28px] pointer-events-none" />

            {/* Top Brand & Occasion Header */}
            <div className="text-center relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-velvet-900/80 backdrop-blur-md border border-romantic-200 dark:border-velvet-700 shadow-sm">
                <span className="text-base">{activeEvent.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-romantic-700 dark:text-romantic-300">
                  Countdown to {activeEvent.recipientName}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-champagne-500" />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-romantic-950 dark:text-white">
                {activeEvent.title}
              </h2>

              <p className={`font-serif italic text-base sm:text-lg max-w-xl mx-auto ${themeDetails.accentText}`}>
                "{activeEvent.message}"
              </p>
            </div>

            {/* Main Flip TimeUnit Cards */}
            <div className="my-8 sm:my-10 relative z-10 flex items-center justify-center gap-3 sm:gap-6 md:gap-8 flex-wrap">
              <TimeUnitCard
                value={timeLeft.days}
                label="Days"
                colorScheme={themeDetails.cardScheme}
              />
              <TimeUnitCard
                value={timeLeft.hours}
                label="Hours"
                colorScheme={themeDetails.cardScheme}
              />
              <TimeUnitCard
                value={timeLeft.minutes}
                label="Minutes"
                colorScheme={themeDetails.cardScheme}
              />
              <TimeUnitCard
                value={timeLeft.seconds}
                label="Seconds"
                colorScheme={themeDetails.cardScheme}
              />
            </div>

            {/* Milliseconds Heart Rhythm Pulse Bar */}
            <div className="max-w-md mx-auto relative z-10 text-center space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-velvet-600 dark:text-velvet-300 px-1">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-romantic-500 fill-current animate-ping" />
                  <span>Heartbeat Pulse</span>
                </span>
                <span className="font-bold font-mono tracking-widest text-romantic-600 dark:text-romantic-400">
                  .{String(timeLeft.milliseconds).padStart(2, '0')}s
                </span>
              </div>

              {/* Progress bar towards milestone */}
              <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${timeLeft.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-romantic-500 via-champagne-400 to-romantic-600"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-velvet-500 dark:text-velvet-400 font-medium">
                <span>Journey Began</span>
                <span>{timeLeft.progressPercentage}% of journey completed</span>
                <span>The Big Day</span>
              </div>
            </div>

            {/* Celebration Finish Banner if completed */}
            {timeLeft.isFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 rounded-3xl bg-white/90 dark:bg-velvet-900/90 border border-champagne-400 shadow-2xl text-center space-y-2 relative z-10"
              >
                <PartyPopper className="w-10 h-10 text-champagne-500 mx-auto animate-bounce" />
                <h3 className="font-display text-2xl font-bold text-romantic-950 dark:text-white">
                  The Magical Moment Has Arrived! 🎉
                </h3>
                <p className="text-xs text-velvet-600 dark:text-velvet-300 max-w-sm mx-auto">
                  Happy milestone day to {activeEvent.recipientName}! May today be filled with joy, romance, and everlasting memories.
                </p>
              </motion.div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-8 pt-6 border-t border-romantic-200/60 dark:border-velvet-800 relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={launchRomanticConfetti}
                  className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-velvet-900/80 backdrop-blur-md border border-romantic-200 dark:border-velvet-700 text-romantic-700 dark:text-romantic-300 font-semibold text-xs flex items-center gap-2 hover:bg-romantic-100 transition-all shadow-sm"
                >
                  <PartyPopper className="w-3.5 h-3.5 text-champagne-500" />
                  <span>Shower Rose Petals</span>
                </button>

                <button
                  onClick={handleCopySummary}
                  className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-velvet-900/80 backdrop-blur-md border border-romantic-200 dark:border-velvet-700 text-velvet-700 dark:text-velvet-300 font-semibold text-xs flex items-center gap-2 hover:bg-romantic-100 transition-all shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Summary!' : 'Copy Countdown Card'}</span>
                </button>
              </div>

              <div className="text-xs text-velvet-600 dark:text-velvet-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-romantic-500" />
                <span>Target: {new Date(activeEvent.targetDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCountdown;
