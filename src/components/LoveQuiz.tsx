import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Flame,
  Crown,
  Share2,
  Copy,
  Check,
  Edit3,
  Plus,
  Trash2,
  Gift,
  ArrowRight,
  ArrowLeft,
  Stars,
  BookHeart,
  Coffee,
  Moon,
  Music,
  Plane,
  Camera,
  Utensils,
  PartyPopper
} from 'lucide-react';
import { useGiftStore } from '../store/useGiftStore';

/* ======================================================================
   DATA TYPES & INTERFACES
   ====================================================================== */

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  romanticNote?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  category: 'Milestone' | 'Playful' | 'Deep Bond' | 'Favorites' | 'Future Dreams';
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  icon?: string;
}

export interface QuizCategoryPreset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questions: QuizQuestion[];
}

export interface LoveQuizProps {
  partnerOneName?: string;
  partnerTwoName?: string;
  onComplete?: (score: number, total: number) => void;
  className?: string;
}

/* ======================================================================
   DEFAULT CURATED ROMANTIC QUESTION SETS
   ====================================================================== */

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'Milestone',
    question: 'Where did our very first unforgettable date take place?',
    options: [
      { id: 'o1', text: 'A cozy corner café with warm cappuccinos' },
      { id: 'o2', text: 'A candlelit bistro under twinkling fairy lights' },
      { id: 'o3', text: 'An impromptu evening stroll in the city park' },
      { id: 'o4', text: 'A bustling rooftop with panoramic skyline views' },
    ],
    correctOptionId: 'o2',
    explanation: 'The night where time stood completely still and every minute felt like pure magic.',
  },
  {
    id: 'q2',
    category: 'Playful',
    question: 'Who is officially most guilty of stealing the cozy duvet blankets at 2 AM?',
    options: [
      { id: 'o1', text: 'Partner 1 (without admitting it!)' },
      { id: 'o2', text: 'Partner 2 (with absolute mastery)' },
      { id: 'o3', text: 'A 50/50 midnight tug-of-war championship' },
      { id: 'o4', text: 'The secret bed monster' },
    ],
    correctOptionId: 'o2',
    explanation: 'A daily romantic trial that is forgiven every morning with warm coffee and gentle smiles.',
  },
  {
    id: 'q3',
    category: 'Favorites',
    question: 'What is our undisputed comfort food for cozy movie marathons?',
    options: [
      { id: 'o1', text: 'Artisanal woodfired truffle pizza' },
      { id: 'o2', text: 'Sweet caramel popcorn & melted Belgian chocolate' },
      { id: 'o3', text: 'Steaming handmade dumplings & ramen' },
      { id: 'o4', text: 'Gourmet cheese board with sparkling rosé' },
    ],
    correctOptionId: 'o1',
    explanation: 'Pairing good crust with great cinema is practically our official relationship tradition.',
  },
  {
    id: 'q4',
    category: 'Deep Bond',
    question: 'What was the exact moment you knew we had something truly rare and extraordinary?',
    options: [
      { id: 'o1', text: 'When we stayed up until 4 AM laughing until our ribs ached' },
      { id: 'o2', text: 'During our first long road trip singing old songs off-key' },
      { id: 'o3', text: 'When simple silence together felt warmer than any conversation' },
      { id: 'o4', text: 'The very first second our eyes met across the room' },
    ],
    correctOptionId: 'o3',
    explanation: 'Finding peaceful serenity in each other’s presence is the deepest hallmark of true devotion.',
  },
  {
    id: 'q5',
    category: 'Future Dreams',
    question: 'What is our ultimate dream anniversary celebration retreat?',
    options: [
      { id: 'o1', text: 'A private secluded villa over azure Maldivian waters' },
      { id: 'o2', text: 'A rustic alpine chalet with a crackling stone fireplace' },
      { id: 'o3', text: 'An Italian Tuscan vineyard farmhouse with wine tasting' },
      { id: 'o4', text: 'A quiet Parisian balcony overlooking the golden Eiffel tower' },
    ],
    correctOptionId: 'o1',
    explanation: 'Nothing rivals private sunsets, warm waves, and infinite horizons together.',
  },
  {
    id: 'q6',
    category: 'Playful',
    question: 'When getting ready for an evening soirée, who takes precisely 15 minutes longer?',
    options: [
      { id: 'o1', text: 'Partner 1 perfecting their fragrance and hair' },
      { id: 'o2', text: 'Partner 2 trying on 4 different outfit combinations' },
      { id: 'o3', text: 'Both of us equally losing track of time together' },
      { id: 'o4', text: 'We are miraculously punctual every single time' },
    ],
    correctOptionId: 'o2',
    explanation: 'Perfection takes time, and the breathtaking reveal is always worth every single extra second.',
  },
];

/* ======================================================================
   VERDICT CALCULATION HELPER
   ====================================================================== */

interface VerdictInfo {
  tier: string;
  badge: string;
  badgeColor: string;
  title: string;
  message: string;
  traits: { label: string; score: number }[];
  romanticVoucher: string;
  icon: any;
}

const getVerdict = (percentage: number, p1: string, p2: string): VerdictInfo => {
  if (percentage >= 90) {
    return {
      tier: 'Celestial Harmony',
      badge: '100% Soulmate Synced',
      badgeColor: 'from-amber-400 via-rose-400 to-romantic-500',
      title: `${p1} & ${p2}: The Timeless Soulmates`,
      message: `Your hearts beat in pure, synchronous poetry. You know each other's hidden glances, cherished memories, and deepest secrets inside and out. A truly rare and breathtaking love story!`,
      traits: [
        { label: 'Telepathic Connection', score: 99 },
        { label: 'Shared Memory Fidelity', score: 96 },
        { label: 'Unconditional Chemistry', score: 98 },
        { label: 'Romantic Synchrony', score: 100 },
      ],
      romanticVoucher: 'VIP Breakfast-in-Bed & 60-Minute Relaxing Massage Token',
      icon: Crown,
    };
  } else if (percentage >= 70) {
    return {
      tier: 'Golden Devotion',
      badge: 'Deeply Enamored Match',
      badgeColor: 'from-romantic-400 to-velvet-600',
      title: `${p1} & ${p2}: Devoted Sweethearts`,
      message: `An affectionate, resilient bond filled with warmth, inside jokes, and deeply cherished milestones. You two complement each other seamlessly!`,
      traits: [
        { label: 'Telepathic Connection', score: 85 },
        { label: 'Shared Memory Fidelity', score: 88 },
        { label: 'Playful Spark & Banter', score: 92 },
        { label: 'Romantic Synchrony', score: 89 },
      ],
      romanticVoucher: 'Custom Candlelit Dinner Date & Movie Choice Privilege',
      icon: Trophy,
    };
  } else if (percentage >= 50) {
    return {
      tier: 'Blossoming Romance',
      badge: 'Sweet & Playful Bond',
      badgeColor: 'from-champagne-400 to-romantic-400',
      title: `${p1} & ${p2}: Adventurous Lovers`,
      message: `Every day together is a vibrant journey of new discoveries, sweet surprises, and ever-growing affection. Your story is full of thrilling chapters waiting to be written!`,
      traits: [
        { label: 'Excitement & Discovery', score: 94 },
        { label: 'Curiosity & Playfulness', score: 90 },
        { label: 'Spontaneous Spark', score: 86 },
        { label: 'Romantic Synchrony', score: 75 },
      ],
      romanticVoucher: 'Spontaneous Ice Cream & Stargazing Night Out',
      icon: Sparkles,
    };
  } else {
    return {
      tier: 'The Discovery Phase',
      badge: 'Enchanting Enigma',
      badgeColor: 'from-velvet-400 to-romantic-400',
      title: `${p1} & ${p2}: The Mystery & The Spark`,
      message: `Love is the greatest puzzle, and you two have endless delightful secrets left to unlock. Perfect excuse for a dedicated wine & question-and-answer date night!`,
      traits: [
        { label: 'Mystery & Intrigue', score: 96 },
        { label: 'Flirty Banter Level', score: 91 },
        { label: 'Date-Night Need', score: 99 },
        { label: 'Romantic Synchrony', score: 65 },
      ],
      romanticVoucher: 'Guaranteed 2-Hour Deep Talk & Dessert Tasting Date',
      icon: Flame,
    };
  }
};

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

export const LoveQuiz: React.FC<LoveQuizProps> = ({
  partnerOneName,
  partnerTwoName,
  onComplete,
  className = '',
}) => {
  const storeGiftData = useGiftStore((s) => s.giftData);

  // Game & Configuration State
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [p1, setP1] = useState<string>(partnerOneName || storeGiftData.recipientName);
  const [p2, setP2] = useState<string>(partnerTwoName || storeGiftData.senderName);
  
  // Navigation & Answers
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'play' | 'customizer'>('play');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Customizer edit form state
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  // Trigger celebration on complete
  useEffect(() => {
    if (isCompleted) {
      // Calculate Score
      let score = 0;
      questions.forEach((q) => {
        if (userAnswers[q.id] === q.correctOptionId) {
          score++;
        }
      });

      // Sync with centralized Zustand store
      useGiftStore.getState().setQuizScore(score);

      if (onComplete) {
        onComplete(score, totalQuestions);
      }

      // Fire festive romantic confetti
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#e0e7ff', '#ffffff'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#e11d48', '#fbbf24', '#fbcfe8'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#e11d48', '#fbbf24', '#fbcfe8'],
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, questions, userAnswers, totalQuestions, onComplete]);

  // Handle Option Select
  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return; // Prevent double taps during explanation

    setSelectedOptionId(optionId);
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
    setShowFeedback(true);
  };

  // Next Question
  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOptionId(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      setShowFeedback(false);
      setSelectedOptionId(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Restart Quiz
  const handleRestart = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setShowFeedback(false);
    setSelectedOptionId(null);
    setIsCompleted(false);
  };

  // Calculate results
  const correctCount = questions.reduce((acc, q) => {
    return acc + (userAnswers[q.id] === q.correctOptionId ? 1 : 0);
  }, 0);

  const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);
  const verdict = getVerdict(percentage, p1, p2);

  // Copy certificate / verdict
  const handleCopyVerdict = () => {
    const text = `🌹 Giftlove Romance Score: ${p1} & ${p2} are a ${percentage}% "${verdict.tier}" match! (${correctCount}/${totalQuestions} Milestones). Unlocked Reward: "${verdict.romanticVoucher}" 💕`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Customizer CRUD
  const handleSaveQuestion = (q: QuizQuestion) => {
    if (isAddingNew) {
      setQuestions((prev) => [...prev, q]);
    } else {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    }
    setEditingQuestion(null);
    setIsAddingNew(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 2) {
      alert('A minimum of 2 questions is recommended for the love quiz.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (currentIndex >= questions.length - 1) {
      setCurrentIndex(0);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold border border-romantic-200 dark:border-velvet-700 mb-2">
            <Heart className="w-3.5 h-3.5 text-romantic-500 fill-romantic-500" />
            <span>Interactive Couple Game</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white flex items-center gap-2">
            <span>The Eternal Love &amp; Memory Quiz</span>
          </h2>
          <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 mt-1 max-w-xl">
            Test how well you and your partner know each other&apos;s cherished milestones, secret habits, and romantic dreams.
          </p>
        </div>

        {/* Play vs Customize Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto p-1.5 rounded-2xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 shadow-romantic-sm">
          <button
            onClick={() => {
              setActiveTab('play');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'play'
                ? 'bg-romantic-500 text-white shadow-romantic-sm'
                : 'text-velvet-600 dark:text-velvet-300 hover:text-romantic-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Take Quiz</span>
          </button>
          <button
            onClick={() => setActiveTab('customizer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'customizer'
                ? 'bg-romantic-500 text-white shadow-romantic-sm'
                : 'text-velvet-600 dark:text-velvet-300 hover:text-romantic-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Customize Questions ({questions.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: PLAY MODE
          =================================================================== */}
      {activeTab === 'play' && (
        <div className="space-y-6">
          {!isCompleted ? (
            /* Active Question Screen */
            <div className="rounded-3xl bg-white/95 dark:bg-velvet-900/95 backdrop-blur-xl border border-romantic-200 dark:border-velvet-800 shadow-romantic-lg p-6 sm:p-10 relative overflow-hidden">
              {/* Background ambient romance glow */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-romantic-300/20 dark:bg-romantic-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-champagne-300/20 dark:bg-champagne-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Progress & Milestone Header */}
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex items-center justify-between text-xs font-semibold text-velvet-600 dark:text-velvet-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-romantic-50 dark:bg-velvet-800 text-romantic-600 dark:text-romantic-300 border border-romantic-200/60 dark:border-velvet-700 font-mono">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-champagne-50 dark:bg-champagne-950/40 text-champagne-800 dark:text-champagne-300 border border-champagne-200/60 dark:border-champagne-800">
                      {currentQ.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-romantic-600 dark:text-champagne-400 font-medium">
                    <BookHeart className="w-4 h-4" />
                    <span>
                      {p1} &amp; {p2}
                    </span>
                  </div>
                </div>

                {/* Animated Heart Progress Bar */}
                <div className="relative w-full h-2.5 bg-romantic-100 dark:bg-velvet-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-romantic-500 via-rose-400 to-champagne-400 rounded-full"
                    initial={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
                    animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Question Text with Animated Entrance */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6 relative z-10"
                >
                  <div className="space-y-2">
                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-romantic-950 dark:text-white leading-snug">
                      {currentQ.question}
                    </h3>
                  </div>

                  {/* Multiple Choice Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {currentQ.options.map((option, idx) => {
                      const optionLetters = ['A', 'B', 'C', 'D'];
                      const isSelected = selectedOptionId === option.id || userAnswers[currentQ.id] === option.id;
                      const isCorrect = option.id === currentQ.correctOptionId;

                      // Feedback state coloring
                      let cardStyle = 'bg-romantic-50/50 dark:bg-velvet-800/50 border-romantic-200 dark:border-velvet-700 hover:border-romantic-400 hover:bg-romantic-50 dark:hover:bg-velvet-800';
                      let letterStyle = 'bg-romantic-100 dark:bg-velvet-700 text-romantic-700 dark:text-romantic-200';

                      if (showFeedback) {
                        if (isCorrect) {
                          cardStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 shadow-sm';
                          letterStyle = 'bg-emerald-500 text-white';
                        } else if (isSelected && !isCorrect) {
                          cardStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100';
                          letterStyle = 'bg-rose-500 text-white';
                        } else {
                          cardStyle = 'opacity-50 border-romantic-100 dark:border-velvet-800';
                        }
                      } else if (isSelected) {
                        cardStyle = 'bg-romantic-500 text-white border-romantic-600 shadow-romantic-md';
                        letterStyle = 'bg-white/20 text-white';
                      }

                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: showFeedback ? 1 : 1.01 }}
                          whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                          onClick={() => handleSelectOption(option.id)}
                          disabled={showFeedback}
                          className={`p-4 sm:p-5 rounded-2xl border text-left flex items-start gap-3.5 transition-all relative overflow-hidden ${cardStyle}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${letterStyle}`}
                          >
                            {optionLetters[idx] || `${idx + 1}`}
                          </span>

                          <div className="flex-1 pr-2">
                            <span className="font-sans text-sm font-medium leading-relaxed block">
                              {option.text}
                            </span>
                          </div>

                          {/* Status Icons on feedback */}
                          {showFeedback && (
                            <div className="shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                              ) : null}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback / Romantic Reflection Box */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-2xl bg-romantic-100/70 dark:bg-velvet-800/80 border border-romantic-200 dark:border-velvet-700 flex items-start gap-3 text-xs sm:text-sm text-velvet-800 dark:text-velvet-200"
                      >
                        <Heart className="w-4 h-4 text-romantic-500 shrink-0 mt-0.5 fill-romantic-500" />
                        <div>
                          <span className="font-bold text-romantic-950 dark:text-white block mb-0.5">
                            Cherished Memory Reflection:
                          </span>
                          <p className="italic text-velvet-700 dark:text-velvet-300">
                            &ldquo;{currentQ.explanation}&rdquo;
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-romantic-100 dark:border-velvet-800">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        currentIndex === 0
                          ? 'opacity-30 cursor-not-allowed text-velvet-400'
                          : 'bg-romantic-50 dark:bg-velvet-800 text-velvet-700 dark:text-velvet-200 hover:bg-romantic-100 dark:hover:bg-velvet-700'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {showFeedback ? (
                        <button
                          onClick={handleNext}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-romantic-500 to-rose-500 hover:from-romantic-600 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-romantic-md transition-all"
                        >
                          <span>{currentIndex === totalQuestions - 1 ? 'Reveal Love Verdict' : 'Next Milestone'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-velvet-400 italic">
                          Select your answer to proceed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* ===============================================================
               RESULTS SCREEN & ROMANTIC CERTIFICATE
               =============================================================== */
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Grand Certificate Card */}
              <div className="rounded-3xl bg-gradient-to-b from-romantic-50/90 via-white to-champagne-50/50 dark:from-velvet-900/90 dark:via-velvet-950 dark:to-velvet-900 border-2 border-romantic-300/80 dark:border-velvet-700 shadow-romantic-xl p-6 sm:p-12 relative overflow-hidden">
                {/* Vintage Guilloche / Romantic Flourish Border Background */}
                <div className="absolute inset-2 border border-romantic-200/60 dark:border-velvet-800 rounded-2xl pointer-events-none" />
                <div className="absolute top-4 left-4 text-romantic-400/40 text-xl font-serif">❦</div>
                <div className="absolute top-4 right-4 text-romantic-400/40 text-xl font-serif">❦</div>
                <div className="absolute bottom-4 left-4 text-romantic-400/40 text-xl font-serif">❦</div>
                <div className="absolute bottom-4 right-4 text-romantic-400/40 text-xl font-serif">❦</div>

                {/* Animated Central Seal Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
                    className="inline-flex p-4 rounded-full bg-gradient-to-tr from-romantic-500 via-rose-400 to-champagne-400 text-white shadow-romantic-lg mx-auto"
                  >
                    <verdict.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </motion.div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-romantic-600 dark:text-champagne-400 bg-romantic-100 dark:bg-velvet-800 px-3 py-1 rounded-full border border-romantic-200 dark:border-velvet-700">
                      Official Giftlove Love Certificate
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-romantic-950 dark:text-white mt-3">
                      {verdict.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-velvet-500 dark:text-velvet-400 mt-1">
                      Certified on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Score & Harmony Tier Gauge */}
                  <div className="py-4">
                    <div className="inline-block p-6 rounded-3xl bg-white/80 dark:bg-velvet-800/80 border border-romantic-200 dark:border-velvet-700 shadow-inner">
                      <div className="font-display text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-romantic-600 via-rose-500 to-champagne-500">
                        {percentage}%
                      </div>
                      <span className="text-xs font-semibold text-velvet-600 dark:text-velvet-300 uppercase tracking-wider block mt-1">
                        {correctCount} of {totalQuestions} Milestones Matched
                      </span>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-romantic-50 dark:bg-velvet-900 text-romantic-700 dark:text-romantic-300 text-xs font-bold border border-romantic-200 dark:border-velvet-700">
                        <Stars className="w-3.5 h-3.5 text-champagne-500" />
                        <span>{verdict.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Romantic Verdict Prose */}
                  <p className="font-serif italic text-base sm:text-lg text-velvet-800 dark:text-velvet-200 leading-relaxed max-w-xl mx-auto">
                    &ldquo;{verdict.message}&rdquo;
                  </p>
                </div>

                {/* Compatibility Dimensions / Relationship Traits */}
                <div className="mt-10 pt-8 border-t border-romantic-200 dark:border-velvet-800 max-w-3xl mx-auto">
                  <h4 className="text-center text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400 mb-6">
                    Couple Resonance Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {verdict.traits.map((trait, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/70 dark:bg-velvet-900/60 border border-romantic-100 dark:border-velvet-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-velvet-800 dark:text-velvet-200">
                          <span>{trait.label}</span>
                          <span className="font-mono text-romantic-600 dark:text-champagne-400">{trait.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-romantic-100 dark:bg-velvet-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="h-full bg-gradient-to-r from-romantic-500 to-champagne-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unlocked Romantic Perk Voucher */}
                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-champagne-500/10 via-romantic-500/10 to-rose-500/10 border border-champagne-300 dark:border-champagne-800/60 text-center max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-champagne-800 dark:text-champagne-300">
                    <Gift className="w-4 h-4 text-romantic-500" />
                    <span>Unlocked Couple Reward Perk</span>
                  </div>
                  <p className="font-display text-base sm:text-lg font-bold text-romantic-950 dark:text-white">
                    {verdict.romanticVoucher}
                  </p>
                  <p className="text-[11px] text-velvet-500">
                    Redeemable anytime by presenting this digital certificate to your partner!
                  </p>
                </div>

                {/* Bottom Interactive Actions */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 relative z-10">
                  <button
                    onClick={handleCopyVerdict}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-velvet-800 text-velvet-800 dark:text-velvet-200 border border-romantic-200 dark:border-velvet-700 hover:border-romantic-400 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Verdict Copied!' : 'Copy Love Certificate'}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 rounded-xl bg-romantic-500 hover:bg-romantic-600 text-white text-xs font-semibold flex items-center gap-2 shadow-romantic-md transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ===================================================================
          TAB 2: CUSTOMIZER & QUESTION BUILDER ATELIER
          =================================================================== */}
      {activeTab === 'customizer' && (
        <div className="rounded-3xl bg-white/95 dark:bg-velvet-900/95 backdrop-blur-xl border border-romantic-200 dark:border-velvet-800 shadow-romantic-lg p-6 sm:p-8 space-y-8">
          {/* Couple Name Configuration */}
          <div className="p-5 rounded-2xl bg-romantic-50/60 dark:bg-velvet-800/60 border border-romantic-200 dark:border-velvet-700 space-y-4">
            <h3 className="font-display text-lg font-bold text-romantic-950 dark:text-white flex items-center gap-2">
              <BookHeart className="w-4 h-4 text-romantic-500" />
              <span>Couple Profile &amp; Names</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Partner 1 Name:
                </label>
                <input
                  type="text"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-900 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  placeholder="e.g. Eleanor"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                  Partner 2 Name:
                </label>
                <input
                  type="text"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-900 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none"
                  placeholder="e.g. Alexander"
                />
              </div>
            </div>
          </div>

          {/* Question List Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-romantic-950 dark:text-white">
                  Quiz Questions ({questions.length})
                </h3>
                <p className="text-xs text-velvet-500">
                  Personalize the milestones, funny habits, and inside jokes to make this quiz uniquely yours.
                </p>
              </div>

              <button
                onClick={() => {
                  const newQ: QuizQuestion = {
                    id: `q_${Date.now()}`,
                    category: 'Milestone',
                    question: 'What is our favorite inside joke or song?',
                    options: [
                      { id: 'opt_1', text: 'Option A' },
                      { id: 'opt_2', text: 'Option B' },
                      { id: 'opt_3', text: 'Option C' },
                      { id: 'opt_4', text: 'Option D' },
                    ],
                    correctOptionId: 'opt_1',
                    explanation: 'A memory that never fails to make us smile!',
                  };
                  setEditingQuestion(newQ);
                  setIsAddingNew(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-romantic-500 hover:bg-romantic-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-romantic-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions Table / Card List */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-velvet-800/80 border border-romantic-200 dark:border-velvet-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-romantic-400 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-romantic-100 dark:bg-velvet-700 text-romantic-700 dark:text-romantic-300 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-champagne-600 dark:text-champagne-400">
                        {q.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-romantic-950 dark:text-white">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-velvet-500 dark:text-velvet-400 line-clamp-1">
                      Correct: {q.options.find((o) => o.id === q.correctOptionId)?.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsAddingNew(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-romantic-50 dark:bg-velvet-700 text-romantic-700 dark:text-romantic-300 hover:bg-romantic-100 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit / Add Modal */}
          {editingQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-velvet-950/80 backdrop-blur-md">
              <div className="relative w-full max-w-xl bg-white dark:bg-velvet-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-romantic-200 dark:border-velvet-700 max-h-[90vh] overflow-y-auto space-y-4">
                <h3 className="font-display text-xl font-bold text-romantic-950 dark:text-white">
                  {isAddingNew ? 'Add Custom Love Question' : 'Edit Question'}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Question Text:
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.question}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, question: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Category:
                    </label>
                    <select
                      value={editingQuestion.category}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                    >
                      <option value="Milestone">Milestone</option>
                      <option value="Playful">Playful</option>
                      <option value="Deep Bond">Deep Bond</option>
                      <option value="Favorites">Favorites</option>
                      <option value="Future Dreams">Future Dreams</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300">
                      Answer Choices (Select the correct radio):
                    </label>
                    {editingQuestion.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOpt"
                          checked={editingQuestion.correctOptionId === opt.id}
                          onChange={() =>
                            setEditingQuestion({ ...editingQuestion, correctOptionId: opt.id })
                          }
                          className="text-romantic-500 focus:ring-romantic-400"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[oIdx].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-velvet-700 dark:text-velvet-300 mb-1">
                      Romantic Memory Note (revealed after answering):
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.explanation}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-romantic-100 dark:border-velvet-800">
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-romantic-50 dark:bg-velvet-800 text-velvet-700 dark:text-velvet-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveQuestion(editingQuestion)}
                    className="px-5 py-2 rounded-xl bg-romantic-500 hover:bg-romantic-600 text-white text-xs font-semibold shadow-romantic-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
