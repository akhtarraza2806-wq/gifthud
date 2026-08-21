import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  HelpCircle,
  MessageSquare,
  Send,
  Sparkles,
  Heart,
  Crown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  AlertCircle,
  Gem
} from 'lucide-react';

/* ======================================================================
   TYPES & PRESETS
   ====================================================================== */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  urgency: 'standard' | 'vip_concierge' | 'urgent_anniversary';
  orderReference?: string;
}

export type InputStyleTheme = 'romantic' | 'champagne' | 'atelier_blend';

const SUBJECT_PRESETS = [
  'Bespoke Floral & Hamper Curation',
  'Urgent Anniversary / Birthday Delivery',
  'Custom Wax Seal & Love Letter Calligraphy',
  'Manual Wire or Zelle Verification',
  'Private Concierge VIP Booking',
  'General Gifting Inquiries'
];

export const ContactSupport: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'vip_concierge',
    orderReference: '',
  });

  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    submittedAt: string;
    data: ContactFormData;
  } | null>(null);

  const [inputTheme, setInputTheme] = useState<InputStyleTheme>('atelier_blend');
  const [copiedTicket, setCopiedTicket] = useState(false);

  /* ======================================================================
     VALIDATION & SUBMISSION
     ====================================================================== */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name or gifting title.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format (e.g. client@domain.com).';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select or enter an inquiry subject.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please share the details of your inquiry or gifting request.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters for our concierge team.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate luxury API dispatch
    setTimeout(() => {
      const generatedTicketId = `GL-CONCIERGE-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      setSubmittedTicket({
        ticketId: generatedTicketId,
        submittedAt: timestamp,
        data: { ...formData }
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      urgency: 'vip_concierge',
      orderReference: '',
    });
    setErrors({});
    setIsSubmitted(false);
    setSubmittedTicket(null);
  };

  const handleCopyTicket = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(
      `Giftlove Concierge Ticket: ${submittedTicket.ticketId}\nClient: ${submittedTicket.data.name} (${submittedTicket.data.email})\nSubject: ${submittedTicket.data.subject}\nDate: ${submittedTicket.submittedAt}`
    );
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  /* ======================================================================
     THEMED INPUT STYLES GENERATOR
     ====================================================================== */

  const getInputClasses = (hasError?: boolean) => {
    const base = 'w-full px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 outline-none placeholder:text-velvet-400 dark:placeholder:text-velvet-500';

    if (hasError) {
      return `${base} bg-rose-50/70 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100 focus:ring-2 focus:ring-rose-400/30`;
    }

    switch (inputTheme) {
      case 'champagne':
        return `${base} bg-champagne-50/50 dark:bg-velvet-800/80 border border-champagne-300/80 dark:border-champagne-700/60 text-velvet-900 dark:text-white focus:border-champagne-500 focus:ring-2 focus:ring-champagne-400/30 dark:focus:border-champagne-400 shadow-sm focus:shadow-champagne-glow`;
      case 'romantic':
        return `${base} bg-romantic-50/60 dark:bg-velvet-800/80 border border-romantic-200 dark:border-romantic-800/60 text-velvet-900 dark:text-white focus:border-romantic-500 focus:ring-2 focus:ring-romantic-400/30 shadow-sm focus:shadow-romantic-sm`;
      case 'atelier_blend':
      default:
        return `${base} bg-white dark:bg-velvet-800/90 border border-romantic-200/80 dark:border-velvet-700 text-velvet-900 dark:text-white focus:border-romantic-400 dark:focus:border-champagne-400 focus:ring-2 focus:ring-champagne-300/30 shadow-sm hover:border-romantic-300 dark:hover:border-velvet-600`;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header & Luxury Theme Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-romantic-100 dark:border-velvet-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300 text-xs font-semibold mb-3 border border-romantic-200 dark:border-velvet-700">
            <Crown className="w-3.5 h-3.5 text-champagne-600 dark:text-champagne-400" />
            <span>Private Atelier Concierge &amp; Customer Care</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-romantic-950 dark:text-white tracking-tight">
            How May We Attend to You?
          </h2>
          <p className="text-sm text-velvet-600 dark:text-velvet-300 mt-2 max-w-2xl leading-relaxed">
            Whether inquiring about custom floral arrangements, tracking a sealed wax anniversary letter, or arranging private white-glove courier delivery, our dedicated concierge is at your service.
          </p>
        </div>

        {/* Style Showcase Controller */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-romantic-50 dark:bg-velvet-800/80 border border-romantic-200/60 dark:border-velvet-700 self-start md:self-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-velvet-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-champagne-500" />
            Theme:
          </span>
          {[
            { id: 'atelier_blend', label: 'Atelier Luxe' },
            { id: 'romantic', label: 'Romantic Rose' },
            { id: 'champagne', label: 'Champagne Silk' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => setInputTheme(theme.id as InputStyleTheme)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                inputTheme === theme.id
                  ? 'bg-white dark:bg-velvet-900 text-romantic-600 dark:text-romantic-300 shadow-sm border border-romantic-200 dark:border-velvet-700'
                  : 'text-velvet-600 dark:text-velvet-400 hover:text-romantic-600'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form / Confirmation + Concierge Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Column: Contact Form or Confirmation State */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              /* ==========================================================
                 FORM STATE
                 ========================================================== */
              <motion.div
                key="contact-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                className="p-6 sm:p-9 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-romantic-sm relative overflow-hidden"
              >
                {/* Decorative Top Accent Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-romantic-400 via-champagne-400 to-romantic-600" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-romantic-500" />
                          Your Name / Title *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: '' });
                          }}
                          placeholder="e.g. Eleanor Vance"
                          className={getInputClasses(!!errors.name)}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-champagne-600 dark:text-champagne-400" />
                          Email Address *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          placeholder="e.g. eleanor.vance@luxury.com"
                          className={getInputClasses(!!errors.email)}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject Presets & Input */}
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-romantic-500" />
                        Inquiry Subject *
                      </span>
                    </label>

                    {/* Quick Preset Selector Chips */}
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      {SUBJECT_PRESETS.map((preset) => {
                        const isSelected = formData.subject === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, subject: preset });
                              if (errors.subject) setErrors({ ...errors, subject: '' });
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-romantic-500 to-romantic-600 text-white shadow-romantic-sm scale-[1.02]'
                                : 'bg-romantic-50 dark:bg-velvet-800 text-velvet-700 dark:text-velvet-300 border border-romantic-200/70 dark:border-velvet-700 hover:border-romantic-400'
                            }`}
                          >
                            {preset}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData({ ...formData, subject: e.target.value });
                          if (errors.subject) setErrors({ ...errors, subject: '' });
                        }}
                        placeholder="Or enter a bespoke subject line..."
                        className={getInputClasses(!!errors.subject)}
                      />
                    </div>
                    {errors.subject && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Optional Order Reference & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-romantic-50/50 dark:bg-velvet-950/40 border border-romantic-100 dark:border-velvet-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-velvet-700 dark:text-velvet-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-velvet-400" />
                        Order Reference # (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderReference || ''}
                        onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
                        placeholder="e.g. GL-ORD-9842"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 text-velvet-900 dark:text-white outline-none focus:ring-1 focus:ring-romantic-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-velvet-700 dark:text-velvet-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-champagne-600 dark:text-champagne-400" />
                        Concierge Handling Priority
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-700 text-velvet-900 dark:text-white outline-none focus:ring-1 focus:ring-romantic-400 font-medium"
                      >
                        <option value="vip_concierge">👑 VIP Concierge Service (Within 2 Hours)</option>
                        <option value="urgent_anniversary">🌹 Urgent Anniversary / Proposal Today</option>
                        <option value="standard">💌 Standard Inquiries (Within 12 Hours)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-romantic-500" />
                        Your Message / Curation Details *
                      </span>
                      <span className="text-[11px] text-velvet-400 font-normal lowercase">
                        {formData.message.length} characters
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        rows={5}
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          if (errors.message) setErrors({ ...errors, message: '' });
                        }}
                        placeholder="Please share any specific requests, delivery timing, personalized letter sentiments, or special packaging instructions..."
                        className={getInputClasses(!!errors.message)}
                      />
                    </div>
                    {errors.message && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button & Security Guarantee */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-velvet-500 dark:text-velvet-400 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Confidential &amp; Encrypted Concierge Channel</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto btn-romantic px-8 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-romantic-md disabled:opacity-75 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching to Concierge...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Inquiry to Atelier</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* ==========================================================
                 CONFIRMATION STATE
                 ========================================================== */
              <motion.div
                key="contact-confirmation"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-romantic-lg relative overflow-hidden text-center space-y-8"
              >
                {/* Background ambient lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-romantic-300/20 dark:bg-romantic-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Badge Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-romantic-500 to-champagne-400 p-1 shadow-romantic-md flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-velvet-900 flex items-center justify-center text-romantic-600 dark:text-champagne-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                </motion.div>

                {/* Confirmation Title & Message */}
                <div className="space-y-3 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-champagne-100 dark:bg-champagne-950/60 text-champagne-800 dark:text-champagne-300 border border-champagne-300 dark:border-champagne-700">
                    <Crown className="w-3.5 h-3.5 text-champagne-600" />
                    <span>VIP Concierge Dispatched</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                    Thank You, {submittedTicket?.data.name}
                  </h3>
                  <p className="text-sm text-velvet-600 dark:text-velvet-300 leading-relaxed">
                    Your inquiry has been safely received by our Paris &amp; London Haute Gifting Concierge. An artisan curator has been assigned to your request.
                  </p>
                </div>

                {/* Ticket Summary Card */}
                {submittedTicket && (
                  <div className="p-6 rounded-3xl bg-romantic-50/70 dark:bg-velvet-950/60 border border-romantic-200/80 dark:border-velvet-800 text-left space-y-4 max-w-xl mx-auto shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-romantic-200/60 dark:border-velvet-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-velvet-500">
                          Concierge Ticket Reference
                        </span>
                        <div className="font-mono text-base font-bold text-romantic-900 dark:text-champagne-300">
                          {submittedTicket.ticketId}
                        </div>
                      </div>

                      <button
                        onClick={handleCopyTicket}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-velvet-800 border border-romantic-200 dark:border-velvet-700 text-xs font-semibold text-velvet-700 dark:text-velvet-300 hover:text-romantic-600 shadow-sm transition-all active:scale-95"
                      >
                        {copiedTicket ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Reference</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-velvet-400 block text-[11px]">Subject:</span>
                        <span className="font-semibold text-romantic-950 dark:text-white">
                          {submittedTicket.data.subject}
                        </span>
                      </div>
                      <div>
                        <span className="text-velvet-400 block text-[11px]">Recipient Email:</span>
                        <span className="font-mono text-velvet-800 dark:text-velvet-200">
                          {submittedTicket.data.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-velvet-400 block text-[11px]">Submitted At:</span>
                        <span className="text-velvet-700 dark:text-velvet-300">
                          {submittedTicket.submittedAt}
                        </span>
                      </div>
                      <div>
                        <span className="text-velvet-400 block text-[11px]">Priority Response:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Within 2 Hours Guaranteed
                        </span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="pt-2 border-t border-romantic-200/50 dark:border-velvet-800/80">
                      <span className="text-velvet-400 block text-[11px] mb-1">Message Summary:</span>
                      <p className="text-xs text-velvet-700 dark:text-velvet-300 italic line-clamp-3 bg-white/60 dark:bg-velvet-900/60 p-3 rounded-xl border border-romantic-100 dark:border-velvet-800">
                        "{submittedTicket.data.message}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    onClick={handleResetForm}
                    className="btn-romantic-outline text-xs px-6 py-3 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Send Another Inquiry</span>
                  </button>

                  <a
                    href="mailto:concierge@giftlove.luxury"
                    className="btn-champagne text-xs px-6 py-3 flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Direct VIP Concierge Email</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: VIP Atelier Contacts & Service Guarantees */}
        <div className="lg:col-span-4 space-y-6">
          {/* Atelier Contact Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-romantic-100 dark:border-velvet-800">
              <div className="p-2.5 rounded-2xl bg-champagne-100 dark:bg-velvet-800 text-champagne-700 dark:text-champagne-400">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-romantic-950 dark:text-white">
                  Direct Concierge Desks
                </h4>
                <p className="text-xs text-velvet-500 dark:text-velvet-400">
                  Instant VIP assistance &amp; advice
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Phone / Private WhatsApp */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-romantic-50/50 dark:bg-velvet-800/50">
                <Phone className="w-4 h-4 text-romantic-500 mt-0.5" />
                <div>
                  <span className="font-semibold text-romantic-950 dark:text-white block">
                    VIP Concierge Hotline
                  </span>
                  <span className="font-mono text-velvet-600 dark:text-velvet-300">
                    +1 (800) 845-LOVE / +33 1 42 68 00
                  </span>
                  <span className="text-[10px] text-velvet-400 block mt-0.5">
                    Available 24/7 for Diamond VIP members
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-romantic-50/50 dark:bg-velvet-800/50">
                <Mail className="w-4 h-4 text-champagne-600 dark:text-champagne-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-romantic-950 dark:text-white block">
                    Bespoke Curation Inquiries
                  </span>
                  <span className="font-mono text-velvet-600 dark:text-velvet-300">
                    concierge@giftlove.luxury
                  </span>
                  <span className="text-[10px] text-velvet-400 block mt-0.5">
                    Average response: under 45 minutes
                  </span>
                </div>
              </div>

              {/* Physical Boutiques */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-romantic-50/50 dark:bg-velvet-800/50">
                <MapPin className="w-4 h-4 text-romantic-500 mt-0.5" />
                <div>
                  <span className="font-semibold text-romantic-950 dark:text-white block">
                    Flagship Boutiques
                  </span>
                  <p className="text-velvet-600 dark:text-velvet-300 text-[11px] leading-snug">
                    Place Vendôme, Paris &bull; Mayfair, London &bull; Madison Ave, New York
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Guarantee Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-romantic-500 to-romantic-700 text-white shadow-romantic-md space-y-4">
            <div className="flex items-center gap-2 text-champagne-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>The Giftlove Promise</span>
            </div>

            <h4 className="font-display text-xl font-bold leading-snug">
              Every Sentiment Handled with Utmost Grace
            </h4>

            <p className="text-xs text-white/90 leading-relaxed">
              All handwritten letters are penned on 300gsm cotton rag parchment, sealed with genuine beeswax, and verified by our senior master calligrapher.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-champagne-200">
              <ShieldCheck className="w-4 h-4" />
              <span>100% On-Time Delivery Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
