import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Admin2FaConfig,
  AdminAuthSession,
  loadAdmin2FaConfig,
  saveAdmin2FaConfig,
  loadAdminAuthSession,
  saveAdminAuthSession
} from '../utils/totpAuth';

/* ======================================================================
   STORE TYPES & INTERFACES
   ====================================================================== */

export type TabType =
  | 'palette'
  | 'typography'
  | 'components'
  | 'card_builder'
  | 'pdf_keepsake'
  | 'scratch_card'
  | 'qr_card'
  | 'gallery'
  | 'countdown'
  | 'quiz'
  | 'payment'
  | 'admin'
  | 'support'
  | 'tokens';

export type SealType = 'rose' | 'heart' | 'ring' | 'dove';
export type PaperType = 'blush' | 'champagne' | 'velvet' | 'cream';
export type ThemeType = 'blush' | 'champagne' | 'midnight' | 'burgundy';
export type CurrencyType = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface GiftData {
  recipientName: string;
  senderName: string;
  giftTitle: string;
  noteMessage: string;
  customText: string;
  selectedSeal: SealType;
  selectedPaper: PaperType;
  selectedTheme: ThemeType;
  giftUrl: string;
  tagline: string;
  isPasswordProtected: boolean;
  giftPassword: string;
  giftHint: string;
  selectedPackageId: string;
  milestoneDate: string;
  milestoneTitle: string;
  quizScore: number;
  scratchRevealed: boolean;
}

export interface UserPreferences {
  isDarkMode: boolean;
  activeTab: TabType;
  currency: CurrencyType;
  soundEffects: boolean;
  animationsEnabled: boolean;
}

export interface StoredOrder {
  orderId: string;
  paymentId: string;
  method: 'razorpay' | 'manual_upi';
  amount: number;
  currency: string;
  recipientName: string;
  senderName: string;
  giftTitle: string;
  timestamp: string;
  utrNumber?: string;
  status: 'verified' | 'manual_verification_pending' | 'rejected';
}

export interface SensitiveActionPayload {
  action: () => void;
  title: string;
  description: string;
}

export interface GiftStoreState {
  // 1. User Preferences
  isDarkMode: boolean;
  activeTab: TabType;
  currency: CurrencyType;
  soundEffects: boolean;
  animationsEnabled: boolean;

  // 2. Current Gift Data
  giftData: GiftData;

  // 3. Authentication & Security
  authSession: AdminAuthSession | null;
  twoFaConfig: Admin2FaConfig;
  isLoginModalOpen: boolean;
  pendingSensitiveAction: SensitiveActionPayload | null;

  // 4. Orders & Fulfillment
  orders: StoredOrder[];

  // 5. Toast Notifications
  toastMessage: string | null;

  // ====================================================================
  // ACTIONS: Preferences
  // ====================================================================
  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: TabType) => void;
  setCurrency: (currency: CurrencyType) => void;
  setSoundEffects: (enabled: boolean) => void;
  toggleSoundEffects: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;

  // ====================================================================
  // ACTIONS: Gift Data
  // ====================================================================
  setRecipientName: (name: string) => void;
  setSenderName: (name: string) => void;
  setGiftTitle: (title: string) => void;
  setNoteMessage: (message: string) => void;
  setCustomText: (text: string) => void;
  setSelectedSeal: (seal: SealType) => void;
  setSelectedPaper: (paper: PaperType) => void;
  setSelectedTheme: (theme: ThemeType) => void;
  setGiftUrl: (url: string) => void;
  setTagline: (tagline: string) => void;
  setPasswordProtection: (enabled: boolean, password?: string, hint?: string) => void;
  setSelectedPackageId: (pkgId: string) => void;
  setMilestone: (date: string, title: string) => void;
  setQuizScore: (score: number) => void;
  setScratchRevealed: (revealed: boolean) => void;
  updateGiftData: (partial: Partial<GiftData>) => void;
  resetGiftData: () => void;

  // ====================================================================
  // ACTIONS: Authentication & 2FA
  // ====================================================================
  setAuthSession: (session: AdminAuthSession | null) => void;
  setTwoFaConfig: (config: Admin2FaConfig) => void;
  loginAdmin: (session: AdminAuthSession) => void;
  logoutAdmin: () => void;
  openLoginModal: (pendingAction?: SensitiveActionPayload | null) => void;
  closeLoginModal: () => void;
  executeWith2Fa: (action: () => void, title: string, description: string) => void;

  // ====================================================================
  // ACTIONS: Orders
  // ====================================================================
  addOrder: (order: StoredOrder) => void;
  updateOrderStatus: (orderId: string, status: StoredOrder['status']) => void;

  // ====================================================================
  // ACTIONS: Toast
  // ====================================================================
  showToast: (message: string, durationMs?: number) => void;
  clearToast: () => void;
}

const DEFAULT_GIFT_DATA: GiftData = {
  recipientName: 'Eleanor',
  senderName: 'Alexander',
  giftTitle: 'The Eternal Rose Hamper & Keepsake',
  noteMessage: 'To the one who turns everyday moments into pure poetry. Happy Anniversary, my love.',
  customText: 'Because every thoughtful moment deserves a touch of timeless romance.',
  selectedSeal: 'rose',
  selectedPaper: 'blush',
  selectedTheme: 'blush',
  giftUrl: 'https://giftlove.app/reveal/rose-hamper-7829',
  tagline: 'Scan with your phone camera to reveal your handwritten note & gift',
  isPasswordProtected: false,
  giftPassword: 'forever',
  giftHint: 'Our special anniversary word',
  selectedPackageId: 'gold_keepsake',
  milestoneDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 42).toISOString(),
  milestoneTitle: 'Our 5th Wedding Anniversary',
  quizScore: 0,
  scratchRevealed: false,
};

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const useGiftStore = create<GiftStoreState>()(
  persist(
    (set, get) => ({
      // Initial States
      isDarkMode: false,
      activeTab: 'palette',
      currency: 'INR',
      soundEffects: true,
      animationsEnabled: true,

      giftData: DEFAULT_GIFT_DATA,

      authSession: loadAdminAuthSession(),
      twoFaConfig: loadAdmin2FaConfig(),
      isLoginModalOpen: false,
      pendingSensitiveAction: null,

      orders: [
        {
          orderId: 'ORD-GL-8921',
          paymentId: 'pay_rzp_98412891',
          method: 'razorpay',
          amount: 4999,
          currency: 'INR',
          recipientName: 'Eleanor Vance',
          senderName: 'Alexander Hayes',
          giftTitle: 'Gold Keepsake & Wax Seal Studio',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          status: 'verified',
        },
        {
          orderId: 'ORD-GL-8922',
          paymentId: 'MAN-UPI-41829',
          method: 'manual_upi',
          amount: 9999,
          currency: 'INR',
          recipientName: 'Clara Oswald',
          senderName: 'Julian Sterling',
          giftTitle: 'Grand Royal Romance Hamper',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          utrNumber: '428910482910',
          status: 'manual_verification_pending',
        },
      ],

      toastMessage: null,

      // ====================================================================
      // Preferences Handlers
      // ====================================================================
      setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setActiveTab: (tab: TabType) => set({ activeTab: tab }),
      setCurrency: (currency: CurrencyType) => set({ currency }),
      setSoundEffects: (enabled: boolean) => set({ soundEffects: enabled }),
      toggleSoundEffects: () => set((state) => ({ soundEffects: !state.soundEffects })),
      setAnimationsEnabled: (enabled: boolean) => set({ animationsEnabled: enabled }),

      // ====================================================================
      // Gift Data Handlers
      // ====================================================================
      setRecipientName: (name: string) =>
        set((state) => ({ giftData: { ...state.giftData, recipientName: name } })),
      setSenderName: (name: string) =>
        set((state) => ({ giftData: { ...state.giftData, senderName: name } })),
      setGiftTitle: (title: string) =>
        set((state) => ({ giftData: { ...state.giftData, giftTitle: title } })),
      setNoteMessage: (message: string) =>
        set((state) => ({ giftData: { ...state.giftData, noteMessage: message } })),
      setCustomText: (text: string) =>
        set((state) => ({ giftData: { ...state.giftData, customText: text } })),
      setSelectedSeal: (seal: SealType) =>
        set((state) => ({ giftData: { ...state.giftData, selectedSeal: seal } })),
      setSelectedPaper: (paper: PaperType) =>
        set((state) => ({ giftData: { ...state.giftData, selectedPaper: paper } })),
      setSelectedTheme: (theme: ThemeType) =>
        set((state) => ({ giftData: { ...state.giftData, selectedTheme: theme } })),
      setGiftUrl: (url: string) =>
        set((state) => ({ giftData: { ...state.giftData, giftUrl: url } })),
      setTagline: (tagline: string) =>
        set((state) => ({ giftData: { ...state.giftData, tagline } })),
      setPasswordProtection: (enabled: boolean, password?: string, hint?: string) =>
        set((state) => ({
          giftData: {
            ...state.giftData,
            isPasswordProtected: enabled,
            ...(password ? { giftPassword: password } : {}),
            ...(hint ? { giftHint: hint } : {}),
          },
        })),
      setSelectedPackageId: (pkgId: string) =>
        set((state) => ({ giftData: { ...state.giftData, selectedPackageId: pkgId } })),
      setMilestone: (date: string, title: string) =>
        set((state) => ({
          giftData: { ...state.giftData, milestoneDate: date, milestoneTitle: title },
        })),
      setQuizScore: (score: number) =>
        set((state) => ({ giftData: { ...state.giftData, quizScore: score } })),
      setScratchRevealed: (revealed: boolean) =>
        set((state) => ({ giftData: { ...state.giftData, scratchRevealed: revealed } })),
      updateGiftData: (partial: Partial<GiftData>) =>
        set((state) => ({ giftData: { ...state.giftData, ...partial } })),
      resetGiftData: () => set({ giftData: DEFAULT_GIFT_DATA }),

      // ====================================================================
      // Authentication & 2FA Handlers
      // ====================================================================
      setAuthSession: (session: AdminAuthSession | null) => {
        saveAdminAuthSession(session);
        set({ authSession: session });
      },
      setTwoFaConfig: (config: Admin2FaConfig) => {
        saveAdmin2FaConfig(config);
        set({ twoFaConfig: config });
      },
      loginAdmin: (session: AdminAuthSession) => {
        saveAdminAuthSession(session);
        set({ authSession: session, isLoginModalOpen: false });
        get().showToast(`2FA Authentication verified: Welcome ${session.adminName}`);
        const pending = get().pendingSensitiveAction;
        if (pending) {
          pending.action();
          set({ pendingSensitiveAction: null });
        }
      },
      logoutAdmin: () => {
        saveAdminAuthSession(null);
        set({ authSession: null });
        get().showToast('Admin session locked. 2FA credentials cleared.');
      },
      openLoginModal: (pendingAction = null) => {
        set({
          isLoginModalOpen: true,
          pendingSensitiveAction: pendingAction,
        });
      },
      closeLoginModal: () => {
        set({
          isLoginModalOpen: false,
          pendingSensitiveAction: null,
        });
      },
      executeWith2Fa: (action: () => void, title: string, description: string) => {
        const { twoFaConfig, authSession } = get();

        if (!twoFaConfig.isEnabled || !twoFaConfig.requireForSensitiveActions) {
          action();
          return;
        }

        if (
          authSession &&
          authSession.is2FaVerified &&
          authSession.expiresAt &&
          Date.now() < authSession.expiresAt
        ) {
          action();
          return;
        }

        // Require 2FA Challenge
        get().openLoginModal({ action, title, description });
      },

      // ====================================================================
      // Orders Handlers
      // ====================================================================
      addOrder: (order: StoredOrder) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (orderId: string, status: StoredOrder['status']) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.orderId === orderId ? { ...o, status } : o)),
        })),

      // ====================================================================
      // Toast Handlers
      // ====================================================================
      showToast: (message: string, durationMs: number = 3000) => {
        if (toastTimeout) clearTimeout(toastTimeout);
        set({ toastMessage: message });
        toastTimeout = setTimeout(() => {
          set({ toastMessage: null });
        }, durationMs);
      },
      clearToast: () => {
        if (toastTimeout) clearTimeout(toastTimeout);
        set({ toastMessage: null });
      },
    }),
    {
      name: 'giftlove_app_zustand_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        activeTab: state.activeTab,
        currency: state.currency,
        soundEffects: state.soundEffects,
        animationsEnabled: state.animationsEnabled,
        giftData: state.giftData,
        twoFaConfig: state.twoFaConfig,
        orders: state.orders,
      }),
    }
  )
);

/* ======================================================================
   CUSTOM HOOK SLICES FOR CONVENIENT COMPONENT CONSUMPTION
   ====================================================================== */

export const useGiftData = () => {
  const giftData = useGiftStore((s) => s.giftData);
  const setRecipientName = useGiftStore((s) => s.setRecipientName);
  const setSenderName = useGiftStore((s) => s.setSenderName);
  const setGiftTitle = useGiftStore((s) => s.setGiftTitle);
  const setNoteMessage = useGiftStore((s) => s.setNoteMessage);
  const setCustomText = useGiftStore((s) => s.setCustomText);
  const setSelectedSeal = useGiftStore((s) => s.setSelectedSeal);
  const setSelectedPaper = useGiftStore((s) => s.setSelectedPaper);
  const setSelectedTheme = useGiftStore((s) => s.setSelectedTheme);
  const setGiftUrl = useGiftStore((s) => s.setGiftUrl);
  const setTagline = useGiftStore((s) => s.setTagline);
  const setPasswordProtection = useGiftStore((s) => s.setPasswordProtection);
  const updateGiftData = useGiftStore((s) => s.updateGiftData);
  const resetGiftData = useGiftStore((s) => s.resetGiftData);

  return {
    ...giftData,
    giftData,
    setRecipientName,
    setSenderName,
    setGiftTitle,
    setNoteMessage,
    setCustomText,
    setSelectedSeal,
    setSelectedPaper,
    setSelectedTheme,
    setGiftUrl,
    setTagline,
    setPasswordProtection,
    updateGiftData,
    resetGiftData,
  };
};

export const useUserPreferences = () => {
  const isDarkMode = useGiftStore((s) => s.isDarkMode);
  const activeTab = useGiftStore((s) => s.activeTab);
  const currency = useGiftStore((s) => s.currency);
  const soundEffects = useGiftStore((s) => s.soundEffects);
  const animationsEnabled = useGiftStore((s) => s.animationsEnabled);
  const setDarkMode = useGiftStore((s) => s.setDarkMode);
  const toggleDarkMode = useGiftStore((s) => s.toggleDarkMode);
  const setActiveTab = useGiftStore((s) => s.setActiveTab);
  const setCurrency = useGiftStore((s) => s.setCurrency);
  const setSoundEffects = useGiftStore((s) => s.setSoundEffects);
  const toggleSoundEffects = useGiftStore((s) => s.toggleSoundEffects);
  const setAnimationsEnabled = useGiftStore((s) => s.setAnimationsEnabled);

  return {
    isDarkMode,
    activeTab,
    currency,
    soundEffects,
    animationsEnabled,
    setDarkMode,
    toggleDarkMode,
    setActiveTab,
    setCurrency,
    setSoundEffects,
    toggleSoundEffects,
    setAnimationsEnabled,
  };
};

export const useAuthStatus = () => {
  const authSession = useGiftStore((s) => s.authSession);
  const twoFaConfig = useGiftStore((s) => s.twoFaConfig);
  const isLoginModalOpen = useGiftStore((s) => s.isLoginModalOpen);
  const pendingSensitiveAction = useGiftStore((s) => s.pendingSensitiveAction);
  const setAuthSession = useGiftStore((s) => s.setAuthSession);
  const setTwoFaConfig = useGiftStore((s) => s.setTwoFaConfig);
  const loginAdmin = useGiftStore((s) => s.loginAdmin);
  const logoutAdmin = useGiftStore((s) => s.logoutAdmin);
  const openLoginModal = useGiftStore((s) => s.openLoginModal);
  const closeLoginModal = useGiftStore((s) => s.closeLoginModal);
  const executeWith2Fa = useGiftStore((s) => s.executeWith2Fa);

  return {
    authSession,
    twoFaConfig,
    isLoginModalOpen,
    pendingSensitiveAction,
    isAuthenticated: !!authSession?.isAuthenticated,
    is2FaVerified: !!authSession?.is2FaVerified,
    adminEmail: authSession?.adminEmail || null,
    adminName: authSession?.adminName || null,
    setAuthSession,
    setTwoFaConfig,
    loginAdmin,
    logoutAdmin,
    openLoginModal,
    closeLoginModal,
    executeWith2Fa,
  };
};
