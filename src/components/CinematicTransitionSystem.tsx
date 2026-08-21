import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Wand2,
  Sliders,
  Eye,
  Film,
  Zap,
  Flame,
  Feather,
  RotateCw,
  Compass,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Heart,
  Volume2,
  VolumeX,
  Sparkle,
  Box,
  Palette,
  Type,
  FileText,
  CreditCard,
  LayoutDashboard,
  Headset,
  Timer,
  HelpCircle,
  Images,
  QrCode,
  Gauge
} from 'lucide-react';

/* ======================================================================
   TYPES, PRESETS & ROUTE ARCHETYPES
   ====================================================================== */

export type TransitionPreset = 
  | 'auto_route'
  | 'velvet_bloom' 
  | 'silk_veil' 
  | 'perspective_flip' 
  | 'golden_shimmer' 
  | 'origami_unfold'
  | 'romantic_drift';

export type TransitionSpeed = 'snappy' | 'cinematic' | 'ethereal' | 'slow_luxury';

export type RouteCategory = 
  | 'showcase_visual' 
  | 'atelier_keepsake' 
  | 'experiential_journey' 
  | 'concierge_commerce';

export interface RouteMeta {
  id: string;
  label: string;
  category: RouteCategory;
  categoryLabel: string;
  categoryColor: string;
  recommendedPreset: TransitionPreset;
  description: string;
}

export const ROUTE_REGISTRY: Record<string, RouteMeta> = {
  palette: {
    id: 'palette',
    label: 'Romantic Palette',
    category: 'showcase_visual',
    categoryLabel: 'Design System',
    categoryColor: 'from-romantic-500 to-rose-400',
    recommendedPreset: 'velvet_bloom',
    description: 'Signature romantic roses, champagne gold, and midnight velvet color tokens.'
  },
  typography: {
    id: 'typography',
    label: 'Typography',
    category: 'showcase_visual',
    categoryLabel: 'Design System',
    categoryColor: 'from-romantic-500 to-rose-400',
    recommendedPreset: 'velvet_bloom',
    description: 'Editorial display serifs, modern sans-serifs, and expressive script flourishes.'
  },
  components: {
    id: 'components',
    label: 'UI Components',
    category: 'showcase_visual',
    categoryLabel: 'Design System',
    categoryColor: 'from-romantic-500 to-rose-400',
    recommendedPreset: 'silk_veil',
    description: 'Curated luxury button kits, pill badges, and interactive gift cards.'
  },
  tokens: {
    id: 'tokens',
    label: 'Tailwind Config',
    category: 'showcase_visual',
    categoryLabel: 'Design System',
    categoryColor: 'from-romantic-500 to-rose-400',
    recommendedPreset: 'silk_veil',
    description: 'Production-ready Tailwind CSS configuration and theme tokens.'
  },
  card_builder: {
    id: 'card_builder',
    label: 'Love Letter Studio',
    category: 'atelier_keepsake',
    categoryLabel: 'Keepsake Atelier',
    categoryColor: 'from-amber-500 to-champagne-400',
    recommendedPreset: 'origami_unfold',
    description: 'Handwritten love letters, custom parchment textures, and wax seal stamps.'
  },
  pdf_keepsake: {
    id: 'pdf_keepsake',
    label: 'Printable PDF',
    category: 'atelier_keepsake',
    categoryLabel: 'Keepsake Atelier',
    categoryColor: 'from-amber-500 to-champagne-400',
    recommendedPreset: 'perspective_flip',
    description: '300 DPI vector PDF exporter for keepsake letters, gift vouchers, and certificates.'
  },
  scratch_card: {
    id: 'scratch_card',
    label: 'Scratch Card',
    category: 'atelier_keepsake',
    categoryLabel: 'Keepsake Atelier',
    categoryColor: 'from-amber-500 to-champagne-400',
    recommendedPreset: 'golden_shimmer',
    description: 'Tactile foil scratch card with particle sparkles and mystery gift reveals.'
  },
  qr_card: {
    id: 'qr_card',
    label: 'QR Reveal Card',
    category: 'atelier_keepsake',
    categoryLabel: 'Keepsake Atelier',
    categoryColor: 'from-amber-500 to-champagne-400',
    recommendedPreset: 'perspective_flip',
    description: 'Luxury high-res QR gift reveal cards for physical and digital gifting.'
  },
  gallery: {
    id: 'gallery',
    label: '3D Gallery',
    category: 'experiential_journey',
    categoryLabel: 'Experiential',
    categoryColor: 'from-rose-500 to-romantic-600',
    recommendedPreset: 'perspective_flip',
    description: '3D perspective masonry gallery with specular glare reflections.'
  },
  countdown: {
    id: 'countdown',
    label: 'Countdown',
    category: 'experiential_journey',
    categoryLabel: 'Experiential',
    categoryColor: 'from-rose-500 to-romantic-600',
    recommendedPreset: 'romantic_drift',
    description: 'Milestone flip timer, heartbeat pulse audio rhythm, and petal confetti.'
  },
  quiz: {
    id: 'quiz',
    label: 'Love Quiz',
    category: 'experiential_journey',
    categoryLabel: 'Experiential',
    categoryColor: 'from-rose-500 to-romantic-600',
    recommendedPreset: 'golden_shimmer',
    description: 'Couples harmony trivia and memory matching game with celebration rewards.'
  },
  payment: {
    id: 'payment',
    label: 'Luxury Checkout',
    category: 'concierge_commerce',
    categoryLabel: 'Concierge Commerce',
    categoryColor: 'from-emerald-500 to-champagne-500',
    recommendedPreset: 'golden_shimmer',
    description: 'Razorpay checkout, direct UPI QR scanner, and instant verification.'
  },
  admin: {
    id: 'admin',
    label: 'Admin Studio',
    category: 'concierge_commerce',
    categoryLabel: 'Concierge Commerce',
    categoryColor: 'from-velvet-700 to-romantic-800',
    recommendedPreset: 'silk_veil',
    description: 'VIP client concierge administration, order fulfillment, and 2FA vault.'
  },
  support: {
    id: 'support',
    label: 'Support & Care',
    category: 'concierge_commerce',
    categoryLabel: 'Concierge Commerce',
    categoryColor: 'from-velvet-700 to-romantic-800',
    recommendedPreset: 'silk_veil',
    description: '24/7 dedicated romantic gifting concierge and real-time live assistance.'
  },
};

export interface TransitionConfig {
  preset: TransitionPreset;
  speed: TransitionSpeed;
  enable3dDepth: boolean;
  enableSparkleTrail: boolean;
  enableSoundSim: boolean;
  enableRouteAwareAdaptive: boolean;
}

interface TransitionContextType {
  config: TransitionConfig;
  setPreset: (preset: TransitionPreset) => void;
  setSpeed: (speed: TransitionSpeed) => void;
  toggle3dDepth: () => void;
  toggleSparkleTrail: () => void;
  toggleSoundSim: () => void;
  toggleRouteAwareAdaptive: () => void;
  direction: number;
  setDirection: (dir: number) => void;
  stepDistance: number;
  setStepDistance: (dist: number) => void;
  triggerReplay: () => void;
  replayKey: number;
  currentRouteId: string;
  previousRouteId: string;
  recordNavigation: (fromRoute: string, toRoute: string, fromIndex: number, toIndex: number) => void;
  activeEffectivePreset: TransitionPreset;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export const useCinematicTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useCinematicTransition must be used within a CinematicTransitionProvider');
  }
  return context;
};

/* ======================================================================
   WEB AUDIO API PROCEDURAL SOUND SYNTHESIS (Gentle Romantic Chimes)
   ====================================================================== */

const playRomanticTransitionChime = (preset: TransitionPreset) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.06, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    masterGain.connect(ctx.destination);

    // Chime frequency based on preset
    let f1 = 528; // Love frequency (C5)
    let f2 = 660; // E5
    if (preset === 'golden_shimmer') {
      f1 = 587.33; // D5
      f2 = 880; // A5
    } else if (preset === 'origami_unfold' || preset === 'perspective_flip') {
      f1 = 440; // A4
      f2 = 554.37; // C#5
    } else if (preset === 'silk_veil') {
      f1 = 659.25; // E5
      f2 = 783.99; // G5
    }

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f1, now);
    osc1.frequency.exponentialRampToValueAtTime(f1 * 1.05, now + 0.35);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f2, now + 0.05);

    osc1.connect(masterGain);
    osc2.connect(masterGain);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 850);
  } catch {
    // AudioContext blocked or not supported, ignore gracefully
  }
};

/* ======================================================================
   CHOREOGRAPHY VARIANT GENERATORS (ROUTE-AWARE & 3D DYNAMICS)
   ====================================================================== */

export const getDuration = (speed: TransitionSpeed): number => {
  switch (speed) {
    case 'snappy':
      return 0.32;
    case 'ethereal':
      return 0.75;
    case 'slow_luxury':
      return 0.95;
    case 'cinematic':
    default:
      return 0.52;
  }
};

export const getLuxuryEase = (): [number, number, number, number] => [0.22, 1, 0.36, 1]; // Bespoke luxury cubic-bezier

export const resolveEffectivePreset = (
  configuredPreset: TransitionPreset,
  routeId: string
): TransitionPreset => {
  if (configuredPreset !== 'auto_route') {
    return configuredPreset;
  }
  const routeMeta = ROUTE_REGISTRY[routeId];
  return routeMeta?.recommendedPreset || 'velvet_bloom';
};

export const createCinematicVariants = (
  preset: TransitionPreset,
  speed: TransitionSpeed,
  direction: number = 1,
  enable3dDepth: boolean = true,
  stepDistance: number = 1,
  targetRouteId: string = 'palette'
): Variants => {
  const effectivePreset = resolveEffectivePreset(preset, targetRouteId);
  const duration = getDuration(speed);
  const ease = getLuxuryEase();

  // Dynamic distance multiplier (scales translation slightly if jumping multiple tabs)
  const distScale = Math.min(1.4, 1 + (Math.max(1, stepDistance) - 1) * 0.08);

  switch (effectivePreset) {
    /* 1. Velvet Bloom: Organic scaling, subtle 3D lift, and romantic petal blur */
    case 'velvet_bloom':
      return {
        initial: {
          opacity: 0,
          scale: enable3dDepth ? 0.94 : 0.97,
          y: direction > 0 ? 30 * distScale : -30 * distScale,
          rotateX: enable3dDepth ? (direction > 0 ? 5 : -5) : 0,
          filter: 'blur(10px)',
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          transition: {
            duration,
            ease,
            staggerChildren: 0.08,
            delayChildren: 0.04,
          },
        },
        exit: {
          opacity: 0,
          scale: enable3dDepth ? 1.03 : 1.01,
          y: direction > 0 ? -24 * distScale : 24 * distScale,
          rotateX: enable3dDepth ? (direction > 0 ? -4 : 4) : 0,
          filter: 'blur(8px)',
          transition: {
            duration: duration * 0.72,
            ease: 'easeInOut',
          },
        },
      };

    /* 2. Silk Veil: Gentle vertical & horizontal satin curtain glide */
    case 'silk_veil':
      return {
        initial: {
          opacity: 0,
          x: direction > 0 ? 55 * distScale : -55 * distScale,
          y: 10,
          scale: 0.98,
          filter: 'blur(6px)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration,
            ease,
            staggerChildren: 0.07,
            delayChildren: 0.03,
          },
        },
        exit: {
          opacity: 0,
          x: direction > 0 ? -50 * distScale : 50 * distScale,
          y: -10,
          scale: 0.98,
          filter: 'blur(6px)',
          transition: {
            duration: duration * 0.68,
            ease: 'easeInOut',
          },
        },
      };

    /* 3. Perspective Flip: 3D Hardcover registry tilt & tactile book flip */
    case 'perspective_flip':
      return {
        initial: {
          opacity: 0,
          rotateY: enable3dDepth ? (direction > 0 ? 10 * distScale : -10 * distScale) : 0,
          rotateX: enable3dDepth ? 3 : 0,
          scale: 0.91,
          z: enable3dDepth ? -140 : 0,
          filter: 'blur(8px)',
        },
        animate: {
          opacity: 1,
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          z: 0,
          filter: 'blur(0px)',
          transition: {
            duration: duration * 1.1,
            ease,
            staggerChildren: 0.08,
            delayChildren: 0.05,
          },
        },
        exit: {
          opacity: 0,
          rotateY: enable3dDepth ? (direction > 0 ? -10 * distScale : 10 * distScale) : 0,
          scale: 0.92,
          z: enable3dDepth ? -100 : 0,
          filter: 'blur(8px)',
          transition: {
            duration: duration * 0.7,
            ease: 'easeInOut',
          },
        },
      };

    /* 4. Golden Shimmer: Radial illumination, expansion, and champagne sparkle lift */
    case 'golden_shimmer':
      return {
        initial: {
          opacity: 0,
          scale: 0.94,
          y: direction > 0 ? 24 * distScale : -24 * distScale,
          filter: 'brightness(1.25) blur(12px)',
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'brightness(1) blur(0px)',
          transition: {
            duration,
            ease,
            staggerChildren: 0.09,
            delayChildren: 0.05,
          },
        },
        exit: {
          opacity: 0,
          scale: 0.97,
          y: direction > 0 ? -18 * distScale : 18 * distScale,
          filter: 'brightness(1.15) blur(8px)',
          transition: {
            duration: duration * 0.65,
            ease: 'easeInOut',
          },
        },
      };

    /* 5. Origami Unfold: Luxury keepsake box & sealed letter unboxing */
    case 'origami_unfold':
      return {
        initial: {
          opacity: 0,
          rotateX: enable3dDepth ? (direction > 0 ? 16 : -16) : 0,
          scale: 0.9,
          y: direction > 0 ? 40 * distScale : -40 * distScale,
          transformOrigin: direction > 0 ? 'top center' : 'bottom center',
          filter: 'blur(6px)',
        },
        animate: {
          opacity: 1,
          rotateX: 0,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: duration * 1.08,
            ease,
            staggerChildren: 0.08,
            delayChildren: 0.04,
          },
        },
        exit: {
          opacity: 0,
          rotateX: enable3dDepth ? (direction > 0 ? -12 : 12) : 0,
          scale: 0.93,
          y: direction > 0 ? -30 * distScale : 30 * distScale,
          transformOrigin: direction > 0 ? 'bottom center' : 'top center',
          filter: 'blur(6px)',
          transition: {
            duration: duration * 0.7,
            ease: 'easeInOut',
          },
        },
      };

    /* 6. Romantic Drift: Ethereal diagonal parallax drift with floating romantic lift */
    case 'romantic_drift':
    default:
      return {
        initial: {
          opacity: 0,
          x: direction > 0 ? 35 * distScale : -35 * distScale,
          y: direction > 0 ? 25 * distScale : -25 * distScale,
          scale: 0.95,
          rotateZ: enable3dDepth ? (direction > 0 ? 1.5 : -1.5) : 0,
          filter: 'blur(8px)',
        },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotateZ: 0,
          filter: 'blur(0px)',
          transition: {
            duration,
            ease,
            staggerChildren: 0.08,
            delayChildren: 0.04,
          },
        },
        exit: {
          opacity: 0,
          x: direction > 0 ? -30 * distScale : 30 * distScale,
          y: direction > 0 ? -20 * distScale : 20 * distScale,
          scale: 0.96,
          rotateZ: enable3dDepth ? (direction > 0 ? -1.5 : 1.5) : 0,
          filter: 'blur(6px)',
          transition: {
            duration: duration * 0.7,
            ease: 'easeInOut',
          },
        },
      };
  }
};

/* ======================================================================
   PROVIDER COMPONENT
   ====================================================================== */

export const CinematicTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TransitionConfig>({
    preset: 'auto_route',
    speed: 'cinematic',
    enable3dDepth: true,
    enableSparkleTrail: true,
    enableSoundSim: false,
    enableRouteAwareAdaptive: true,
  });

  const [direction, setDirection] = useState<number>(1);
  const [stepDistance, setStepDistance] = useState<number>(1);
  const [replayKey, setReplayKey] = useState<number>(0);
  const [currentRouteId, setCurrentRouteId] = useState<string>('palette');
  const [previousRouteId, setPreviousRouteId] = useState<string>('palette');

  const setPreset = useCallback((preset: TransitionPreset) => {
    setConfig((prev) => ({ ...prev, preset }));
    setReplayKey((k) => k + 1);
  }, []);

  const setSpeed = useCallback((speed: TransitionSpeed) => {
    setConfig((prev) => ({ ...prev, speed }));
    setReplayKey((k) => k + 1);
  }, []);

  const toggle3dDepth = useCallback(() => {
    setConfig((prev) => ({ ...prev, enable3dDepth: !prev.enable3dDepth }));
    setReplayKey((k) => k + 1);
  }, []);

  const toggleSparkleTrail = useCallback(() => {
    setConfig((prev) => ({ ...prev, enableSparkleTrail: !prev.enableSparkleTrail }));
  }, []);

  const toggleSoundSim = useCallback(() => {
    setConfig((prev) => {
      const nextVal = !prev.enableSoundSim;
      if (nextVal) {
        playRomanticTransitionChime('golden_shimmer');
      }
      return { ...prev, enableSoundSim: nextVal };
    });
  }, []);

  const toggleRouteAwareAdaptive = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      enableRouteAwareAdaptive: !prev.enableRouteAwareAdaptive,
      preset: !prev.enableRouteAwareAdaptive ? 'auto_route' : 'velvet_bloom',
    }));
    setReplayKey((k) => k + 1);
  }, []);

  const triggerReplay = useCallback(() => {
    setReplayKey((k) => k + 1);
    if (config.enableSoundSim) {
      const eff = resolveEffectivePreset(config.preset, currentRouteId);
      playRomanticTransitionChime(eff);
    }
  }, [config.enableSoundSim, config.preset, currentRouteId]);

  const recordNavigation = useCallback((
    fromRoute: string,
    toRoute: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const dir = toIndex >= fromIndex ? 1 : -1;
    const diff = Math.abs(toIndex - fromIndex) || 1;
    setDirection(dir);
    setStepDistance(diff);
    setPreviousRouteId(fromRoute);
    setCurrentRouteId(toRoute);

    const eff = resolveEffectivePreset(config.preset, toRoute);
    if (config.enableSoundSim) {
      playRomanticTransitionChime(eff);
    }
  }, [config.enableSoundSim, config.preset]);

  const activeEffectivePreset = useMemo(() => {
    return resolveEffectivePreset(config.preset, currentRouteId);
  }, [config.preset, currentRouteId]);

  return (
    <TransitionContext.Provider
      value={{
        config,
        setPreset,
        setSpeed,
        toggle3dDepth,
        toggleSparkleTrail,
        toggleSoundSim,
        toggleRouteAwareAdaptive,
        direction,
        setDirection,
        stepDistance,
        setStepDistance,
        triggerReplay,
        replayKey,
        currentRouteId,
        previousRouteId,
        recordNavigation,
        activeEffectivePreset,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};

/* ======================================================================
   CINEMATIC PAGE WRAPPER COMPONENT (Framer Motion AnimatePresence Compatible)
   ====================================================================== */

export interface CinematicPageWrapperProps {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
  routeCategory?: RouteCategory;
}

export const CinematicPageWrapper: React.FC<CinematicPageWrapperProps> = ({
  pageKey,
  children,
  className = '',
}) => {
  const { config, direction, stepDistance, replayKey } = useCinematicTransition();
  const variants = createCinematicVariants(
    config.preset,
    config.speed,
    direction,
    config.enable3dDepth,
    stepDistance,
    pageKey
  );

  const routeMeta = ROUTE_REGISTRY[pageKey];
  const effectivePreset = resolveEffectivePreset(config.preset, pageKey);

  return (
    <motion.div
      key={`${pageKey}-${replayKey}`}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative w-full will-change-transform ${className}`}
      style={{
        perspective: config.enable3dDepth ? '1400px' : 'none',
        transformStyle: config.enable3dDepth ? 'preserve-3d' : 'flat',
      }}
    >
      {/* Dynamic Route-Aware Luminous Light Wipe on Transition */}
      {config.enableSparkleTrail && (
        <motion.div
          key={`ambient-wipe-${pageKey}-${replayKey}`}
          initial={{ opacity: 0.7, x: direction > 0 ? '-100%' : '100%' }}
          animate={{ opacity: 0, x: direction > 0 ? '100%' : '-100%' }}
          transition={{ duration: getDuration(config.speed) * 1.4, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-r from-transparent via-champagne-300/25 dark:via-romantic-400/20 to-transparent blur-2xl"
        />
      )}

      {/* Floating Sparkle Trail Particle Accents for Celebratory / Keepsake Sections */}
      {config.enableSparkleTrail && (routeMeta?.category === 'atelier_keepsake' || routeMeta?.category === 'experiential_journey') && (
        <div className="absolute top-0 right-0 left-0 h-1 pointer-events-none overflow-hidden z-20">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 0.8], opacity: [0, 1, 0] }}
            transition={{ duration: getDuration(config.speed) * 1.2, ease: 'easeOut' }}
            className="w-full h-full bg-gradient-to-r from-transparent via-romantic-400 dark:via-champagne-400 to-transparent"
          />
        </div>
      )}

      {/* Content Body */}
      {children}
    </motion.div>
  );
};

/* ======================================================================
   CINEMATIC TRANSITION CONTROLLER BAR (Interactive Studio UI)
   ====================================================================== */

export const CinematicTransitionController: React.FC<{
  currentSectionTitle?: string;
  currentSectionId?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onSelectRoute?: (routeId: string) => void;
  hasNavControls?: boolean;
}> = ({
  currentSectionTitle = 'Gift Section',
  currentSectionId = 'palette',
  onNext,
  onPrev,
  onSelectRoute,
  hasNavControls = true,
}) => {
  const {
    config,
    setPreset,
    setSpeed,
    toggle3dDepth,
    toggleSparkleTrail,
    toggleSoundSim,
    toggleRouteAwareAdaptive,
    triggerReplay,
    direction,
    stepDistance,
    activeEffectivePreset,
  } = useCinematicTransition();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | RouteCategory>('all');

  const currentRouteMeta = ROUTE_REGISTRY[currentSectionId] || {
    id: currentSectionId,
    label: currentSectionTitle,
    category: 'showcase_visual',
    categoryLabel: 'Showcase',
    categoryColor: 'from-romantic-500 to-rose-400',
    recommendedPreset: 'velvet_bloom',
    description: 'Interactive Giftlove romantic view'
  };

  const presetsList: { id: TransitionPreset; label: string; icon: any; desc: string; tag: string }[] = [
    {
      id: 'auto_route',
      label: 'Route-Adaptive (Auto)',
      icon: Sparkles,
      tag: 'AI Intelligent',
      desc: 'Dynamically orchestrates bespoke choreography tailored to each section type.',
    },
    {
      id: 'velvet_bloom',
      label: 'Velvet Bloom',
      icon: Heart,
      tag: 'Romantic Floral',
      desc: 'Organic 3D depth scale, petal blur & gentle tilt matching the 3D heart canvas.',
    },
    {
      id: 'silk_veil',
      label: 'Silk Veil',
      icon: Feather,
      tag: 'Fluid Curtain',
      desc: 'Fluid satin curtain glide with directional slide dynamics & satin softness.',
    },
    {
      id: 'perspective_flip',
      label: '3D Keepsake Tilt',
      icon: Layers,
      tag: '1400px 3D Space',
      desc: 'Tactile hardcover registry flip with perspective rotation and z-space depth.',
    },
    {
      id: 'golden_shimmer',
      label: 'Golden Shimmer',
      icon: Sparkles,
      tag: 'Radial Illumination',
      desc: 'Radial champagne bloom, luminous glowing expansion, and foil brilliance.',
    },
    {
      id: 'origami_unfold',
      label: 'Origami Unbox',
      icon: Box,
      tag: 'Tactile Atelier',
      desc: 'Bespoke jewelry hamper unfolding with vertical rotateX settling.',
    },
    {
      id: 'romantic_drift',
      label: 'Romantic Drift',
      icon: Compass,
      tag: 'Parallax Float',
      desc: 'Ethereal diagonal parallax drift with subtle 2D/3D z-axis tilt.',
    },
  ];

  const speedsList: { id: TransitionSpeed; label: string; time: string }[] = [
    { id: 'snappy', label: 'Responsive', time: '0.32s' },
    { id: 'cinematic', label: 'Cinematic', time: '0.52s' },
    { id: 'ethereal', label: 'Ethereal', time: '0.75s' },
    { id: 'slow_luxury', label: 'Slow Luxury', time: '0.95s' },
  ];

  const categories = [
    { id: 'all', label: 'All Sections' },
    { id: 'atelier_keepsake', label: 'Atelier Keepsakes' },
    { id: 'experiential_journey', label: 'Experiential' },
    { id: 'showcase_visual', label: 'Design System' },
    { id: 'concierge_commerce', label: 'Commerce & Care' },
  ];

  return (
    <div className="rounded-3xl bg-white/95 dark:bg-velvet-900/95 backdrop-blur-xl border border-romantic-200/80 dark:border-velvet-800 shadow-romantic-sm p-4 sm:p-5 mb-8 transition-all">
      {/* Top Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${currentRouteMeta.categoryColor} text-white shadow-romantic-sm flex items-center justify-center shrink-0`}>
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 border border-romantic-200 dark:border-velvet-700 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-romantic-500" />
                {currentRouteMeta.categoryLabel}
              </span>
              <span className="text-xs font-semibold text-romantic-950 dark:text-white">
                Active Mode: <strong className="text-romantic-600 dark:text-champagne-400 capitalize">{config.preset.replace('_', ' ')}</strong>
                {config.preset === 'auto_route' && (
                  <span className="ml-1 text-[11px] font-normal text-velvet-500 dark:text-velvet-400">
                    (Resolves to <span className="font-semibold text-romantic-600 dark:text-champagne-300 capitalize">{activeEffectivePreset.replace('_', ' ')}</span>)
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-velvet-500 dark:text-velvet-400 mt-0.5">
              Section: <strong className="text-velvet-800 dark:text-velvet-200">{currentSectionTitle}</strong> • Direction: <span className="font-mono text-romantic-500 font-bold">{direction > 0 ? '→ Forward (+1)' : '← Backward (-1)'}</span> ({getDuration(config.speed)}s duration)
            </p>
          </div>
        </div>

        {/* Quick Actions & Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Previous / Next buttons */}
          {hasNavControls && (
            <div className="flex items-center gap-1 mr-1 border-r border-romantic-200 dark:border-velvet-700 pr-2.5">
              <button
                onClick={onPrev}
                className="p-2 rounded-xl bg-romantic-50 dark:bg-velvet-800 hover:bg-romantic-100 dark:hover:bg-velvet-700 text-velvet-700 dark:text-velvet-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Previous Gift Section (Route Aware Animation)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-xl bg-romantic-50 dark:bg-velvet-800 hover:bg-romantic-100 dark:hover:bg-velvet-700 text-velvet-700 dark:text-velvet-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Next Gift Section (Route Aware Animation)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sound simulation toggle button */}
          <button
            onClick={toggleSoundSim}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              config.enableSoundSim
                ? 'bg-champagne-100 dark:bg-champagne-950/60 text-champagne-800 dark:text-champagne-300 border-champagne-300 dark:border-champagne-800'
                : 'bg-romantic-50 dark:bg-velvet-800 text-velvet-500 border-romantic-200 dark:border-velvet-700 hover:bg-romantic-100'
            }`}
            title={config.enableSoundSim ? 'Romantic Audio Synthesis Active (528Hz Love Tone)' : 'Enable Romantic Chime on Section Transitions'}
          >
            {config.enableSoundSim ? <Volume2 className="w-3.5 h-3.5 text-champagne-600" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Replay transition button */}
          <button
            onClick={triggerReplay}
            className="px-3 py-2 rounded-xl bg-romantic-50 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 hover:bg-romantic-100 dark:hover:bg-velvet-700 border border-romantic-200 dark:border-velvet-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Replay cinematic entrance transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Customize Studio Drawer Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-romantic-500 to-rose-500 hover:from-romantic-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-romantic-sm transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Close Studio' : 'Motion Studio'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Motion Choreography Studio Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden pt-4 mt-4 border-t border-romantic-100 dark:border-velvet-800 space-y-6"
          >
            {/* Presets Grid */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-800 dark:text-velvet-200">
                  1. Select Cinematic Transition Choreography
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-velvet-500">Route-Adaptive:</span>
                  <button
                    onClick={toggleRouteAwareAdaptive}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      config.preset === 'auto_route'
                        ? 'bg-romantic-500 text-white shadow-sm'
                        : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300'
                    }`}
                  >
                    {config.preset === 'auto_route' ? '✨ Enabled (Auto)' : 'Manual Override'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {presetsList.map((p) => {
                  const Icon = p.icon;
                  const isSelected = config.preset === p.id;
                  const isEffectiveWhenAuto = config.preset === 'auto_route' && activeEffectivePreset === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id)}
                      className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-romantic-500 text-white border-romantic-600 shadow-romantic-md scale-[1.02]'
                          : isEffectiveWhenAuto
                          ? 'bg-romantic-50/90 dark:bg-velvet-800/90 text-romantic-900 dark:text-champagne-300 border-romantic-400 dark:border-romantic-500 ring-2 ring-romantic-400/50'
                          : 'bg-white dark:bg-velvet-800 text-velvet-800 dark:text-velvet-200 border-romantic-200 dark:border-velvet-700 hover:border-romantic-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-romantic-100 dark:bg-velvet-700 text-romantic-600 dark:text-champagne-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-romantic-100 dark:bg-velvet-700 text-romantic-700 dark:text-romantic-300'
                        }`}>
                          {p.tag}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="block font-display text-xs font-bold leading-tight">
                            {p.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-champagne-300 shrink-0 ml-1" />}
                        </div>
                        <span className={`text-[10px] line-clamp-2 mt-1 leading-snug ${isSelected ? 'text-white/85' : 'text-velvet-500 dark:text-velvet-400'}`}>
                          {p.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Section Jumper (Route-Aware Navigation) */}
            {onSelectRoute && (
              <div className="p-4 rounded-2xl bg-romantic-50/60 dark:bg-velvet-950/60 border border-romantic-200 dark:border-velvet-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-romantic-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-velvet-800 dark:text-velvet-200">
                      2. Route-Aware Section Jumper (Test Dynamic Transitions)
                    </span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveTabFilter(cat.id as any)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                          activeTabFilter === cat.id
                            ? 'bg-romantic-500 text-white shadow-xs'
                            : 'bg-white dark:bg-velvet-800 text-velvet-600 dark:text-velvet-400 border border-romantic-200 dark:border-velvet-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Object.values(ROUTE_REGISTRY)
                    .filter((r) => activeTabFilter === 'all' || r.category === activeTabFilter)
                    .map((route) => {
                      const isActive = currentSectionId === route.id;
                      return (
                        <button
                          key={route.id}
                          onClick={() => onSelectRoute(route.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-romantic-500 to-rose-500 text-white border-romantic-600 shadow-sm'
                              : 'bg-white dark:bg-velvet-800 text-velvet-700 dark:text-velvet-300 border-romantic-200 dark:border-velvet-700 hover:border-romantic-400'
                          }`}
                        >
                          <span className="block text-xs font-bold truncate">{route.label}</span>
                          <span className={`block text-[9px] truncate ${isActive ? 'text-white/80' : 'text-velvet-400'}`}>
                            {route.recommendedPreset.replace('_', ' ')}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Dynamics & Spatial Toggles Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Timing Speed */}
              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-800 dark:text-velvet-200">
                  3. Timing Curve &amp; Easing ({getDuration(config.speed)}s)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {speedsList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSpeed(s.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        config.speed === s.id
                          ? 'bg-romantic-100 dark:bg-velvet-700 text-romantic-900 dark:text-champagne-300 border-romantic-400 dark:border-romantic-500 shadow-sm'
                          : 'bg-white dark:bg-velvet-800 text-velvet-600 dark:text-velvet-300 border-romantic-200 dark:border-velvet-700 hover:border-romantic-300'
                      }`}
                    >
                      <span className="block font-medium">{s.label}</span>
                      <span className="text-[10px] font-mono opacity-75">{s.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Spatial Effects, Particle Sweep & Chime Toggles */}
              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-velvet-800 dark:text-velvet-200">
                  4. Spatial &amp; Sensory Enhancements
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={toggle3dDepth}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                      config.enable3dDepth
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-velvet-800 text-velvet-500 border-romantic-200 dark:border-velvet-700'
                    }`}
                  >
                    <span>3D Perspective</span>
                    <span className="text-[10px] uppercase font-bold">{config.enable3dDepth ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={toggleSparkleTrail}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                      config.enableSparkleTrail
                        ? 'bg-champagne-50 dark:bg-champagne-950/40 text-champagne-800 dark:text-champagne-300 border-champagne-300 dark:border-champagne-800'
                        : 'bg-white dark:bg-velvet-800 text-velvet-500 border-romantic-200 dark:border-velvet-700'
                    }`}
                  >
                    <span>Luminous Wipe</span>
                    <span className="text-[10px] uppercase font-bold">{config.enableSparkleTrail ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={toggleSoundSim}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                      config.enableSoundSim
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-velvet-800 text-velvet-500 border-romantic-200 dark:border-velvet-700'
                    }`}
                  >
                    <span>528Hz Chime</span>
                    <span className="text-[10px] uppercase font-bold">{config.enableSoundSim ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Motion Telemetry Inspector Bar */}
            <div className="p-3 rounded-2xl bg-velvet-950 text-velvet-200 font-mono text-[11px] flex flex-wrap items-center justify-between gap-3 border border-velvet-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-champagne-400" />
                <span>Motion Telemetry:</span>
                <span className="text-champagne-300">Preset: {config.preset}</span>
                <span>•</span>
                <span className="text-romantic-300">Speed: {config.speed} ({getDuration(config.speed)}s)</span>
                <span>•</span>
                <span className="text-emerald-300">Distance Multiplier: {Math.min(1.4, 1 + (stepDistance - 1) * 0.08).toFixed(2)}x</span>
              </div>
              <div className="text-velvet-400">
                Easing: <code className="text-white">cubic-bezier(0.22, 1, 0.36, 1)</code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
