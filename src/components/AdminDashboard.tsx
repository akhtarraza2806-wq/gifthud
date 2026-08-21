import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Gift,
  CreditCard,
  Settings,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Crown,
  DollarSign,
  TrendingUp,
  Package,
  FileText,
  AlertCircle,
  ChevronRight,
  Save,
  RefreshCw,
  Sliders,
  Bell,
  Lock,
  Globe,
  Mail,
  Receipt,
  Download,
  ExternalLink,
  Check,
  X,
  QrCode,
  Tag,
  ToggleLeft,
  ToggleRight,
  BarChart2,
  Activity,
  PieChart,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';
import {
  getAnalyticsState,
  resetAnalyticsData,
  exportAnalyticsJSON,
  PrivacyAnalyticsState
} from '../utils/privacyAnalytics';
import {
  Admin2FaConfig,
  AdminAuthSession,
  loadAdmin2FaConfig,
  saveAdmin2FaConfig,
  loadAdminAuthSession,
  saveAdminAuthSession
} from '../utils/totpAuth';
import { Admin2FaLoginModal } from './Admin2FaLoginModal';
import { Admin2FaSettingsManager } from './Admin2FaSettingsManager';
import { useGiftStore } from '../store/useGiftStore';

/* ======================================================================
   TYPES & INTERFACES
   ====================================================================== */

export type AdminTab = 'users' | 'gifts' | 'payments' | 'analytics' | 'two_factor' | 'settings';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'curator' | 'customer';
  tier: 'Diamond VIP' | 'Rose Gold' | 'Silk Member';
  totalSpent: number;
  giftsCreated: number;
  status: 'active' | 'suspended' | 'pending';
  joinedDate: string;
  avatarUrl: string;
}

export interface GiftProduct {
  id: string;
  sku: string;
  name: string;
  category: 'Hampers' | 'Roses' | 'Jewelry' | 'Letters' | 'Digital';
  price: number;
  stock: number;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'draft';
  isFeatured: boolean;
  hasQrCard: boolean;
  imageUrl: string;
  soldCount: number;
}

export interface ManualPaymentRequest {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: 'Wire Transfer' | 'Zelle Concierge' | 'Crypto USDT' | 'Direct VIP Invoice';
  referenceNo: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  proofUrl: string;
  notes?: string;
}

export interface GlobalStoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  orderPrefix: string;
  enableManualPayments: boolean;
  enable3DHeartPreview: boolean;
  enableAudioChimes: boolean;
  enableQrGiftCards: boolean;
  maintenanceMode: boolean;
  luxuryTaxRate: number;
  minOrderAmount: number;
  bankWireInstructions: string;
  zelleAccountEmail: string;
}

/* ======================================================================
   INITIAL MOCK DATA (High quality & realistic for luxury gifting)
   ====================================================================== */

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-101',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@chateau-luxe.com',
    role: 'customer',
    tier: 'Diamond VIP',
    totalSpent: 4850,
    giftsCreated: 14,
    status: 'active',
    joinedDate: '2025-11-12',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'usr-102',
    name: 'Julian Thorne',
    email: 'j.thorne@mayfair-investments.co.uk',
    role: 'customer',
    tier: 'Diamond VIP',
    totalSpent: 6200,
    giftsCreated: 19,
    status: 'active',
    joinedDate: '2025-08-04',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'usr-103',
    name: 'Camille Laurent',
    email: 'camille@atelier-roses.fr',
    role: 'curator',
    tier: 'Rose Gold',
    totalSpent: 1420,
    giftsCreated: 8,
    status: 'active',
    joinedDate: '2026-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'usr-104',
    name: 'Marcus Sterling',
    email: 'm.sterling@horizon-partners.com',
    role: 'customer',
    tier: 'Silk Member',
    totalSpent: 590,
    giftsCreated: 3,
    status: 'pending',
    joinedDate: '2026-02-14',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'usr-105',
    name: 'Seraphina Dupré',
    email: 'seraphina@palais-royal.eu',
    role: 'admin',
    tier: 'Diamond VIP',
    totalSpent: 9400,
    giftsCreated: 32,
    status: 'active',
    joinedDate: '2025-04-01',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'usr-106',
    name: 'Daphne Holloway',
    email: 'daphne.h@belgravia-estates.com',
    role: 'customer',
    tier: 'Silk Member',
    totalSpent: 180,
    giftsCreated: 1,
    status: 'suspended',
    joinedDate: '2026-01-20',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
  },
];

const INITIAL_GIFTS: GiftProduct[] = [
  {
    id: 'gft-201',
    sku: 'GL-ROSE-CRIMSON',
    name: 'The Sovereign Velvet Rose Box (50 Preserved Stems)',
    category: 'Roses',
    price: 340,
    stock: 24,
    status: 'active',
    isFeatured: true,
    hasQrCard: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    soldCount: 142,
  },
  {
    id: 'gft-202',
    sku: 'GL-HAMPER-ROYAL',
    name: 'Château Champagne & Artisanal Truffle Hamper',
    category: 'Hampers',
    price: 520,
    stock: 7,
    status: 'low_stock',
    isFeatured: true,
    hasQrCard: true,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
    soldCount: 98,
  },
  {
    id: 'gft-203',
    sku: 'GL-JEWEL-SOLITAIRE',
    name: 'Heirloom Rose Gold & Diamond Locket Keepsake',
    category: 'Jewelry',
    price: 890,
    stock: 12,
    status: 'active',
    isFeatured: false,
    hasQrCard: true,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
    soldCount: 45,
  },
  {
    id: 'gft-204',
    sku: 'GL-LETTER-PARCHMENT',
    name: 'Bespoke Gold Foil Calligraphed Vows with Wax Seal',
    category: 'Letters',
    price: 160,
    stock: 65,
    status: 'active',
    isFeatured: false,
    hasQrCard: true,
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop',
    soldCount: 312,
  },
  {
    id: 'gft-205',
    sku: 'GL-EXP-SUNSET',
    name: 'Private Seine Twilight Gondola Experience',
    category: 'Digital',
    price: 1200,
    stock: 0,
    status: 'out_of_stock',
    isFeatured: true,
    hasQrCard: true,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400&auto=format&fit=crop',
    soldCount: 28,
  },
];

const INITIAL_PAYMENTS: ManualPaymentRequest[] = [
  {
    id: 'pay-501',
    orderId: 'ORD-9842',
    userName: 'Julian Thorne',
    userEmail: 'j.thorne@mayfair-investments.co.uk',
    amount: 1720,
    method: 'Wire Transfer',
    referenceNo: 'WT-BARCLAYS-8839201',
    submittedAt: '2026-08-19 22:15',
    status: 'pending',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
    notes: 'Urgent wire verification for 5th Anniversary package arriving Paris Friday.',
  },
  {
    id: 'pay-502',
    orderId: 'ORD-9839',
    userName: 'Eleanor Vance',
    userEmail: 'eleanor.vance@chateau-luxe.com',
    amount: 890,
    method: 'Zelle Concierge',
    referenceNo: 'ZEL-99401284',
    submittedAt: '2026-08-19 19:40',
    status: 'verified',
    proofUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=600&auto=format&fit=crop',
    notes: 'Confirmed by Private Concierge Team.',
  },
  {
    id: 'pay-503',
    orderId: 'ORD-9831',
    userName: 'Henri Dupont',
    userEmail: 'h.dupont@rive-gauche.fr',
    amount: 2450,
    method: 'Crypto USDT',
    referenceNo: 'TX-ETH-0x892a...f41b',
    submittedAt: '2026-08-18 14:10',
    status: 'pending',
    proofUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop',
    notes: 'USDT on Ethereum Mainnet. TX hash verified on Etherscan.',
  },
  {
    id: 'pay-504',
    orderId: 'ORD-9810',
    userName: 'Daphne Holloway',
    userEmail: 'daphne.h@belgravia-estates.com',
    amount: 340,
    method: 'Direct VIP Invoice',
    referenceNo: 'INV-2026-0044',
    submittedAt: '2026-08-17 11:20',
    status: 'rejected',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
    notes: 'Receipt reference number does not match banking ledger.',
  },
];

const INITIAL_SETTINGS: GlobalStoreSettings = {
  storeName: 'Giftlove Haute Gifting & Keepsakes',
  supportEmail: 'concierge@giftlove.luxury',
  currency: 'USD ($)',
  orderPrefix: 'GL-ORD-',
  enableManualPayments: true,
  enable3DHeartPreview: true,
  enableAudioChimes: true,
  enableQrGiftCards: true,
  maintenanceMode: false,
  luxuryTaxRate: 8.5,
  minOrderAmount: 100,
  bankWireInstructions: 'Bank: Haute Banque Parisienne\nIBAN: FR76 3000 4000 5000 6000 7000 890\nSWIFT/BIC: HBPARFRPP\nBeneficiary: Giftlove Atelier Privé',
  zelleAccountEmail: 'payments@giftlove.luxury',
};

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // State Collections
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [gifts, setGifts] = useState<GiftProduct[]>(INITIAL_GIFTS);
  const [payments, setPayments] = useState<ManualPaymentRequest[]>(INITIAL_PAYMENTS);
  const [settings, setSettings] = useState<GlobalStoreSettings>(INITIAL_SETTINGS);

  // Filter & Search States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  const [giftSearch, setGiftSearch] = useState('');
  const [giftCategoryFilter, setGiftCategoryFilter] = useState<string>('all');

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Modals & Action States
  const [selectedProofPayment, setSelectedProofPayment] = useState<ManualPaymentRequest | null>(null);
  const [editingGift, setEditingGift] = useState<GiftProduct | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Centralized Zustand Store integration for Auth, 2FA, and System Toasts
  const twoFaConfig = useGiftStore((s) => s.twoFaConfig);
  const setTwoFaConfig = useGiftStore((s) => s.setTwoFaConfig);
  const authSession = useGiftStore((s) => s.authSession);
  const isLoginModalOpen = useGiftStore((s) => s.isLoginModalOpen);
  const setIsLoginModalOpen = (open: boolean) => {
    if (open) useGiftStore.getState().openLoginModal();
    else useGiftStore.getState().closeLoginModal();
  };
  const pendingSensitiveAction = useGiftStore((s) => s.pendingSensitiveAction);
  const executeWith2Fa = useGiftStore((s) => s.executeWith2Fa);
  const handle2FaSuccess = useGiftStore((s) => s.loginAdmin);
  const handleAdminLogout = useGiftStore((s) => s.logoutAdmin);
  const showToast = useGiftStore((s) => s.showToast);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'customer' as UserAccount['role'],
    tier: 'Silk Member' as UserAccount['tier'],
  });

  // New Gift Form State
  const [newGiftForm, setNewGiftForm] = useState({
    sku: '',
    name: '',
    category: 'Hampers' as GiftProduct['category'],
    price: 250,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
    isFeatured: false,
    hasQrCard: true,
  });

  /* ======================================================================
     METRICS & SUMMARY CALCULATIONS
     ====================================================================== */
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const vipCount = users.filter((u) => u.tier === 'Diamond VIP').length;
    const totalGiftsCount = gifts.reduce((acc, g) => acc + g.stock, 0);
    const activeProducts = gifts.filter((g) => g.status === 'active').length;
    const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
    const verifiedPaymentsSum = payments
      .filter((p) => p.status === 'verified')
      .reduce((acc, p) => acc + p.amount, 0);
    const totalRevenueSum = users.reduce((acc, u) => acc + u.totalSpent, 0);

    return {
      totalUsers,
      vipCount,
      totalGiftsCount,
      activeProducts,
      pendingPaymentsCount,
      verifiedPaymentsSum,
      totalRevenueSum,
    };
  }, [users, gifts, payments]);

  /* ======================================================================
     FILTERED DATA LOGIC
     ====================================================================== */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.tier.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredGifts = useMemo(() => {
    return gifts.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
        g.sku.toLowerCase().includes(giftSearch.toLowerCase());
      const matchesCat = giftCategoryFilter === 'all' || g.category === giftCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [gifts, giftSearch, giftCategoryFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.orderId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.referenceNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(paymentSearch.toLowerCase());
      const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, paymentSearch, paymentStatusFilter]);

  /* ======================================================================
     ACTION HANDLERS
     ====================================================================== */

  // Users Handlers
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('User account status updated.');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const created: UserAccount = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      tier: newUserForm.tier,
      totalSpent: 0,
      giftsCreated: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop`,
    };

    setUsers([created, ...users]);
    setIsAddingUser(false);
    setNewUserForm({ name: '', email: '', role: 'customer', tier: 'Silk Member' });
    showToast(`User ${created.name} registered successfully.`);
  };

  // Gift Handlers
  const handleToggleGiftFeatured = (giftId: string) => {
    setGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, isFeatured: !g.isFeatured } : g))
    );
    showToast('Gift showcase status modified.');
  };

  const handleAdjustStock = (giftId: string, delta: number) => {
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id === giftId) {
          const newStock = Math.max(0, g.stock + delta);
          let newStatus: GiftProduct['status'] = 'active';
          if (newStock === 0) newStatus = 'out_of_stock';
          else if (newStock <= 10) newStatus = 'low_stock';
          return { ...g, stock: newStock, status: newStatus };
        }
        return g;
      })
    );
  };

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftForm.name || !newGiftForm.sku) return;

    const created: GiftProduct = {
      id: `gft-${Date.now().toString().slice(-4)}`,
      sku: newGiftForm.sku.toUpperCase(),
      name: newGiftForm.name,
      category: newGiftForm.category,
      price: Number(newGiftForm.price),
      stock: Number(newGiftForm.stock),
      status: Number(newGiftForm.stock) > 10 ? 'active' : 'low_stock',
      isFeatured: newGiftForm.isFeatured,
      hasQrCard: newGiftForm.hasQrCard,
      imageUrl: newGiftForm.imageUrl,
      soldCount: 0,
    };

    setGifts([created, ...gifts]);
    setIsAddingGift(false);
    setNewGiftForm({
      sku: '',
      name: '',
      category: 'Hampers',
      price: 250,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
      isFeatured: false,
      hasQrCard: true,
    });
    showToast(`Gift product ${created.name} added to catalog.`);
  };

  // Payment Verification Handlers (Protected with 2FA for sensitive approvals)
  const handleVerifyPayment = (paymentId: string, status: 'verified' | 'rejected') => {
    const targetPayment = payments.find((p) => p.id === paymentId);
    const orderTitle = targetPayment ? targetPayment.orderId : 'Manual Payment';

    executeWith2Fa(
      () => {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status } : p))
        );
        if (selectedProofPayment?.id === paymentId) {
          setSelectedProofPayment(null);
        }
        showToast(
          status === 'verified'
            ? `Manual payment (${orderTitle}) approved & order scheduled for fulfillment!`
            : `Payment request (${orderTitle}) marked as rejected.`
        );
      },
      status === 'verified' ? 'Authorize Wire / Zelle Payment' : 'Reject Manual Payment Request',
      `Authorization required to ${status === 'verified' ? 'approve transfer funds and dispatch order' : 'reject payment'} for ${orderTitle}.`
    );
  };

  // Settings Save Handler (Protected with 2FA)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    executeWith2Fa(
      () => {
        showToast('Global luxury store settings saved successfully.');
      },
      'Update Global Store Configuration',
      'Enter TOTP code to authenticate storewide setting updates, tax policies, and banking routing details.'
    );
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-romantic-900/95 dark:bg-velvet-950/95 text-white border border-romantic-400/40 shadow-2xl backdrop-blur-md text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-champagne-400" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Executive Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
              Total Client Revenue
            </span>
            <div className="p-2.5 rounded-2xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600 dark:text-romantic-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
              ${metrics.totalRevenueSum.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-velvet-500 dark:text-velvet-400 mt-1">
            Includes verified wires &amp; concierge bookings
          </p>
        </div>

        {/* Metric 2: Active Clients & VIPs */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
              Registered Clients
            </span>
            <div className="p-2.5 rounded-2xl bg-champagne-100 dark:bg-velvet-800 text-champagne-700 dark:text-champagne-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
              {metrics.totalUsers}
            </span>
            <span className="text-[11px] font-semibold text-romantic-600 dark:text-romantic-400">
              {metrics.vipCount} Diamond VIPs
            </span>
          </div>
          <p className="text-[11px] text-velvet-500 dark:text-velvet-400 mt-1">
            Global clientele &amp; gift recipients
          </p>
        </div>

        {/* Metric 3: Gift Catalog & Inventory */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
              Inventory In Stock
            </span>
            <div className="p-2.5 rounded-2xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600 dark:text-romantic-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
              {metrics.totalGiftsCount} <span className="text-sm font-normal text-velvet-500">units</span>
            </span>
            <span className="text-[11px] font-semibold text-champagne-700 dark:text-champagne-400">
              {metrics.activeProducts} Live SKUs
            </span>
          </div>
          <p className="text-[11px] text-velvet-500 dark:text-velvet-400 mt-1">
            Roses, hampers &amp; fine jewelry
          </p>
        </div>

        {/* Metric 4: Pending Wire Verifications */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200/80 dark:border-velvet-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
              Pending Wire Review
            </span>
            <div
              className={`p-2.5 rounded-2xl ${
                metrics.pendingPaymentsCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 animate-pulse'
                  : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
              {metrics.pendingPaymentsCount}
            </span>
            {metrics.pendingPaymentsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                Action Needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-velvet-500 dark:text-velvet-400 mt-1">
            Bank wires awaiting receipt verification
          </p>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 sm:p-3 rounded-3xl bg-white/80 dark:bg-velvet-900/80 border border-romantic-200 dark:border-velvet-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {[
            { id: 'users', label: 'User Directory', icon: Users, badge: users.length },
            { id: 'gifts', label: 'Gift Inventory', icon: Gift, badge: gifts.length },
            {
              id: 'payments',
              label: 'Manual Payments',
              icon: CreditCard,
              badge: metrics.pendingPaymentsCount,
              isAlertBadge: metrics.pendingPaymentsCount > 0,
            },
            { id: 'two_factor', label: '2FA Security Chamber', icon: KeyRound },
            { id: 'analytics', label: 'Privacy Analytics', icon: BarChart2 },
            { id: 'settings', label: 'Global Store Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-romantic-500 to-romantic-600 text-white shadow-romantic-sm scale-[1.02]'
                    : 'text-velvet-700 dark:text-velvet-300 hover:bg-romantic-50 dark:hover:bg-velvet-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-romantic-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.isAlertBadge
                        ? 'bg-amber-500 text-white animate-bounce'
                        : 'bg-romantic-100 dark:bg-velvet-800 text-romantic-700 dark:text-romantic-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2FA Session Status / Lock Button */}
        <div className="flex items-center gap-3 px-2">
          {authSession?.is2FaVerified ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>2FA Session Active</span>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="p-2 rounded-2xl bg-romantic-50 dark:bg-velvet-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-velvet-600 dark:text-velvet-300 hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Lock 2FA Session"
              >
                <Lock className="w-3.5 h-3.5 text-romantic-500" />
                <span className="hidden md:inline">Lock 2FA</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                useGiftStore.getState().openLoginModal(null);
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-romantic-500 to-rose-600 text-white text-xs font-bold shadow-romantic-sm flex items-center gap-1.5 hover:shadow-romantic-md transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-champagne-300" />
              <span>Verify 2FA Token</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================
         TAB CONTENT SECTIONS
         ====================================================================== */}
      <AnimatePresence mode="wait">
        {/* ====================================================================
           TAB 1: USER MANAGEMENT
           ==================================================================== */}
        {activeTab === 'users' && (
          <motion.div
            key="tab-users"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Action & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-velvet-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by client name, email, or VIP tier..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium text-velvet-900 dark:text-white placeholder:text-velvet-400 outline-none focus:ring-2 focus:ring-romantic-400"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold text-velvet-700 dark:text-velvet-300 outline-none focus:ring-2 focus:ring-romantic-400"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Clients / Gifting Customers</option>
                  <option value="curator">Floral &amp; Hamper Curators</option>
                  <option value="admin">Atelier Administrators</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold text-velvet-700 dark:text-velvet-300 outline-none focus:ring-2 focus:ring-romantic-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Members</option>
                  <option value="pending">Pending Onboarding</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setIsAddingUser(true)}
                className="btn-romantic text-xs px-4 py-2.5 flex items-center justify-center gap-2 whitespace-nowrap shadow-romantic-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Register VIP Client</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-romantic-100 dark:border-velvet-800 bg-romantic-50/50 dark:bg-velvet-950/50 text-[11px] font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
                      <th className="py-3.5 px-5">Client Profile</th>
                      <th className="py-3.5 px-4">Role &amp; Privilege</th>
                      <th className="py-3.5 px-4">VIP Tier</th>
                      <th className="py-3.5 px-4">Gifts Sent</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-romantic-100 dark:divide-velvet-800/80 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-velvet-500 dark:text-velvet-400">
                          No registered users found matching the query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-romantic-50/40 dark:hover:bg-velvet-800/40 transition-colors"
                        >
                          {/* Client Profile */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-romantic-200 dark:border-velvet-700"
                              />
                              <div>
                                <div className="font-semibold text-romantic-950 dark:text-white">
                                  {u.name}
                                </div>
                                <div className="text-[11px] text-velvet-500 dark:text-velvet-400 font-mono">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <span className="capitalize font-medium text-velvet-700 dark:text-velvet-300">
                              {u.role}
                            </span>
                          </td>

                          {/* VIP Tier */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                u.tier === 'Diamond VIP'
                                  ? 'bg-champagne-100 dark:bg-champagne-950/60 text-champagne-800 dark:text-champagne-300 border border-champagne-300 dark:border-champagne-700'
                                  : u.tier === 'Rose Gold'
                                  ? 'bg-romantic-100 dark:bg-romantic-950/60 text-romantic-800 dark:text-romantic-300 border border-romantic-200'
                                  : 'bg-velvet-100 dark:bg-velvet-800 text-velvet-700 dark:text-velvet-300'
                              }`}
                            >
                              <Crown className="w-3 h-3 text-champagne-500" />
                              {u.tier}
                            </span>
                          </td>

                          {/* Gifts Sent */}
                          <td className="py-3.5 px-4 font-mono font-medium text-velvet-700 dark:text-velvet-300">
                            {u.giftsCreated} parcels
                          </td>

                          {/* Total Spent */}
                          <td className="py-3.5 px-4 font-mono font-bold text-romantic-900 dark:text-romantic-200">
                            ${u.totalSpent.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                u.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                  : u.status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500'
                                    : u.status === 'pending'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {u.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`p-1.5 rounded-xl border transition-colors ${
                                  u.status === 'active'
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                                title={u.status === 'active' ? 'Suspend Access' : 'Activate Access'}
                              >
                                {u.status === 'active' ? (
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====================================================================
           TAB 2: GIFT INVENTORY & CATALOG MANAGEMENT
           ==================================================================== */}
        {activeTab === 'gifts' && (
          <motion.div
            key="tab-gifts"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filter and Add Gift Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-velvet-400" />
                  <input
                    type="text"
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                    placeholder="Search gifts by name or SKU..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium text-velvet-900 dark:text-white placeholder:text-velvet-400 outline-none focus:ring-2 focus:ring-romantic-400"
                  />
                </div>

                <select
                  value={giftCategoryFilter}
                  onChange={(e) => setGiftCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold text-velvet-700 dark:text-velvet-300 outline-none focus:ring-2 focus:ring-romantic-400"
                >
                  <option value="all">All Gift Categories</option>
                  <option value="Roses">Velvet &amp; Preserved Roses</option>
                  <option value="Hampers">Luxury Gift Hampers</option>
                  <option value="Jewelry">Fine Jewelry &amp; Lockets</option>
                  <option value="Letters">Bespoke Love Letters</option>
                  <option value="Digital">Digital &amp; Experience Vouchers</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddingGift(true)}
                className="btn-romantic text-xs px-4 py-2.5 flex items-center justify-center gap-2 whitespace-nowrap shadow-romantic-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Gift Product</span>
              </button>
            </div>

            {/* Gifts Grid Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <div
                  key={gift.id}
                  className="rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image with Badges */}
                    <div className="relative aspect-[16/10] bg-romantic-100 dark:bg-velvet-950 overflow-hidden">
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {gift.category}
                        </span>
                        {gift.isFeatured && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-champagne-500 text-velvet-950 shadow-sm flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleGiftFeatured(gift.id)}
                          className={`p-1.5 rounded-full backdrop-blur-md border ${
                            gift.isFeatured
                              ? 'bg-champagne-400 text-velvet-950 border-champagne-300'
                              : 'bg-black/40 text-white/80 border-white/20 hover:bg-black/60'
                          }`}
                          title="Toggle Hero Showcase"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-velvet-500 dark:text-velvet-400">
                        <span>SKU: {gift.sku}</span>
                        <span>{gift.soldCount} fulfilled</span>
                      </div>

                      <h4 className="font-display font-bold text-base text-romantic-950 dark:text-white line-clamp-2 leading-snug">
                        {gift.name}
                      </h4>

                      <div className="flex items-center justify-between pt-1">
                        <div className="font-display text-xl font-bold text-romantic-600 dark:text-romantic-300">
                          ${gift.price}
                        </div>

                        {/* Stock status badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            gift.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : gift.status === 'low_stock'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {gift.status === 'active'
                            ? `${gift.stock} in stock`
                            : gift.status === 'low_stock'
                            ? `Only ${gift.stock} left`
                            : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stock Adjuster */}
                  <div className="p-4 bg-romantic-50/50 dark:bg-velvet-950/40 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-between text-xs">
                    <span className="text-velvet-600 dark:text-velvet-400 font-medium">
                      Inventory Level:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(gift.id, -1)}
                        className="w-7 h-7 rounded-lg border border-romantic-200 dark:border-velvet-700 flex items-center justify-center font-bold text-velvet-700 dark:text-velvet-300 hover:bg-romantic-100 dark:hover:bg-velvet-800"
                        title="Reduce 1"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-romantic-950 dark:text-white">
                        {gift.stock}
                      </span>
                      <button
                        onClick={() => handleAdjustStock(gift.id, 1)}
                        className="w-7 h-7 rounded-lg border border-romantic-200 dark:border-velvet-700 flex items-center justify-center font-bold text-velvet-700 dark:text-velvet-300 hover:bg-romantic-100 dark:hover:bg-velvet-800"
                        title="Add 1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ====================================================================
           TAB 3: MANUAL PAYMENT VERIFICATION REQUESTS
           ==================================================================== */}
        {activeTab === 'payments' && (
          <motion.div
            key="tab-payments"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Filter and Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-velvet-400" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search by Order ID, Client, or Wire Reference..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium text-velvet-900 dark:text-white placeholder:text-velvet-400 outline-none focus:ring-2 focus:ring-romantic-400"
                  />
                </div>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold text-velvet-700 dark:text-velvet-300 outline-none focus:ring-2 focus:ring-romantic-400"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="pending">Pending Wire Review ({metrics.pendingPaymentsCount})</option>
                  <option value="verified">Verified &amp; Approved</option>
                  <option value="rejected">Rejected / Disputed</option>
                </select>
              </div>

              <div className="text-xs text-velvet-600 dark:text-velvet-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-champagne-500" />
                <span>Manual Wire &amp; Zelle Ledger Auditing</span>
              </div>
            </div>

            {/* Payments Table */}
            <div className="rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-romantic-100 dark:border-velvet-800 bg-romantic-50/50 dark:bg-velvet-950/50 text-[11px] font-bold uppercase tracking-wider text-velvet-600 dark:text-velvet-400">
                      <th className="py-3.5 px-5">Order &amp; Timestamp</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Reference No.</th>
                      <th className="py-3.5 px-4">Wire Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Receipt &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-romantic-100 dark:divide-velvet-800/80 text-xs">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-velvet-500 dark:text-velvet-400">
                          No manual payment requests match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-romantic-50/40 dark:hover:bg-velvet-800/40 transition-colors"
                        >
                          {/* Order ID */}
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-romantic-950 dark:text-white">
                              {p.orderId}
                            </div>
                            <div className="text-[11px] text-velvet-500 dark:text-velvet-400 font-mono">
                              {p.submittedAt}
                            </div>
                          </td>

                          {/* Client */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-velvet-900 dark:text-white">
                              {p.userName}
                            </div>
                            <div className="text-[11px] text-velvet-500 dark:text-velvet-400 font-mono">
                              {p.userEmail}
                            </div>
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 font-medium text-velvet-800 dark:text-velvet-200">
                              <CreditCard className="w-3.5 h-3.5 text-champagne-500" />
                              {p.method}
                            </span>
                          </td>

                          {/* Reference */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-romantic-800 dark:text-romantic-300">
                            {p.referenceNo}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-display font-bold text-sm text-romantic-950 dark:text-white">
                            ${p.amount.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                p.status === 'verified'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                  : p.status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {p.status === 'verified' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : p.status === 'pending' ? (
                                <Clock className="w-3 h-3 text-amber-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-500" />
                              )}
                              {p.status}
                            </span>
                          </td>

                          {/* Actions & Proof View */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Proof Button */}
                              <button
                                onClick={() => setSelectedProofPayment(p)}
                                className="px-2.5 py-1.5 rounded-xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 hover:bg-romantic-50 dark:hover:bg-velvet-700 text-velvet-700 dark:text-velvet-300 font-semibold text-[11px] flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-romantic-500" />
                                <span>Inspect Proof</span>
                              </button>

                              {/* Quick Approve / Reject */}
                              {p.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id, 'verified')}
                                    className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
                                    title="Approve & Dispatch Order"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id, 'rejected')}
                                    className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
                                    title="Reject Payment"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====================================================================
           TAB 4: GLOBAL SETTINGS & ROMANTIC STORE CONFIGURATION
           ==================================================================== */}
        {activeTab === 'settings' && (
          <motion.div
            key="tab-settings"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Card 1: Brand & Atelier Identity */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-romantic-100 dark:border-velvet-800">
                  <div className="p-2.5 rounded-2xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Brand &amp; Concierge Identity
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Configure store identifiers, order number prefixes, and luxury customer service email.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      Haute Atelier Brand Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      VIP Concierge Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      Default Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    >
                      <option value="USD ($)">USD ($) - United States Dollar</option>
                      <option value="EUR (€)">EUR (€) - Euro</option>
                      <option value="GBP (£)">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      Luxury Order Prefix
                    </label>
                    <input
                      type="text"
                      value={settings.orderPrefix}
                      onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Experience & Audio Toggles */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-romantic-100 dark:border-velvet-800">
                  <div className="p-2.5 rounded-2xl bg-champagne-100 dark:bg-velvet-800 text-champagne-700 dark:text-champagne-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Experience &amp; Sensory Toggles
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Enable or disable 3D WebGL renders, synthesized romantic chimes, and QR keepsake cards.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'enable3DHeartPreview',
                      title: '3D WebGL Floating Heart Hero',
                      desc: 'Render interactive 3D extruded mesh with heartbeat pulse and orbiting charms.',
                    },
                    {
                      key: 'enableAudioChimes',
                      title: 'Harmonic Audio Synthesizer Chimes',
                      desc: 'Play Web Audio API major chord chimes during wax seal stamp and confetti events.',
                    },
                    {
                      key: 'enableQrGiftCards',
                      title: 'Retina-Quality QR Keepsake Cards',
                      desc: 'Allow users to generate downloadable 900x1200 framed cards with error-corrected codes.',
                    },
                    {
                      key: 'enableManualPayments',
                      title: 'Manual Bank Wire & Zelle Checkout',
                      desc: 'Allow clients to place orders via bank transfer proof upload.',
                    },
                  ].map((item) => {
                    const isEnabled = settings[item.key as keyof GlobalStoreSettings] as boolean;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-2xl bg-romantic-50/40 dark:bg-velvet-950/40 border border-romantic-100 dark:border-velvet-800"
                      >
                        <div>
                          <div className="font-bold text-xs text-romantic-950 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-velvet-500 dark:text-velvet-400">
                            {item.desc}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              [item.key]: !isEnabled,
                            })
                          }
                          className={`p-1.5 rounded-xl transition-colors ${
                            isEnabled
                              ? 'text-romantic-600 dark:text-romantic-400'
                              : 'text-velvet-400 dark:text-velvet-600'
                          }`}
                        >
                          {isEnabled ? (
                            <ToggleRight className="w-8 h-8" />
                          ) : (
                            <ToggleLeft className="w-8 h-8" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Bank Wire & Payment Instructions */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-romantic-100 dark:border-velvet-800">
                  <div className="p-2.5 rounded-2xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Direct Wire &amp; Zelle Instructions
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Text displayed to clients when selecting manual payment at checkout.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      Bank Wire Details (IBAN / SWIFT / Account)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.bankWireInstructions}
                      onChange={(e) =>
                        setSettings({ ...settings, bankWireInstructions: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1.5">
                      Concierge Zelle / Instant Email
                    </label>
                    <input
                      type="text"
                      value={settings.zelleAccountEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, zelleAccountEmail: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono text-velvet-900 dark:text-white outline-none focus:ring-2 focus:ring-romantic-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-romantic text-xs px-6 py-3 flex items-center gap-2 shadow-romantic-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Global Configuration</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ====================================================================
           TAB 4: 2FA SECURITY & TOTP ACCESS CONTROL
           ==================================================================== */}
        {activeTab === 'two_factor' && (
          <motion.div
            key="tab-two_factor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Admin2FaSettingsManager
              config={twoFaConfig}
              session={authSession}
              onConfigUpdate={(newConfig: Admin2FaConfig) => {
                setTwoFaConfig(newConfig);
                showToast('2FA Security policy and key settings updated.');
              }}
              onRequestVerify={() => {
                useGiftStore.getState().openLoginModal(null);
              }}
            />
          </motion.div>
        )}

        {/* ====================================================================
           TAB 5: PRIVACY-FRIENDLY AUDIENCE ANALYTICS
           ==================================================================== */}
        {activeTab === 'analytics' && (
          <motion.div
            key="tab-analytics"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-romantic-50/50 to-champagne-50/30 dark:from-velvet-900 dark:via-velvet-900 dark:to-velvet-950 border border-romantic-200 dark:border-velvet-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Privacy-First &bull; Zero Cookies &bull; No Fingerprinting</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                  Audience Intelligence &amp; Traffic Pulse
                </h3>
                <p className="text-xs sm:text-sm text-velvet-600 dark:text-velvet-300 max-w-2xl">
                  Client-side aggregated telemetry tracking page visits, atelier engagement, and hardware categories without harvesting personal data.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const json = exportAnalyticsJSON();
                    navigator.clipboard.writeText(json);
                    showToast('Anonymous Analytics JSON copied to clipboard!');
                  }}
                  className="btn-romantic text-xs px-4 py-2.5 flex items-center gap-2 shadow-romantic-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Quick Analytics Cards */}
            {(() => {
              const state = getAnalyticsState();
              const totalPvs = Object.values(state.routeStats).reduce((a, b) => a + b.views, 0);
              const devTotal = (state.deviceCounts.Mobile || 0) + (state.deviceCounts.Desktop || 0) + (state.deviceCounts.Tablet || 0) || 1;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-velvet-500">
                        Total Page Views
                      </span>
                      <div className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                        {totalPvs.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Live updating
                      </span>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-velvet-500">
                        Unique Daily Visitors
                      </span>
                      <div className="font-display text-2xl sm:text-3xl font-bold text-romantic-950 dark:text-white">
                        {state.uniqueDailyVisitors}
                      </div>
                      <span className="text-[11px] text-velvet-400">
                        Ephemeral daily salt hashing
                      </span>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-velvet-500">
                        Privacy Opt-Out State
                      </span>
                      <div className="font-display text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {state.optOut ? 'Opted Out' : 'Active (Safe)'}
                      </div>
                      <span className="text-[11px] text-velvet-400">
                        0 Cookies &bull; DNT Respected
                      </span>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-velvet-500">
                        Top Engagement Screen
                      </span>
                      <div className="font-display text-base font-bold text-romantic-600 dark:text-champagne-300 truncate">
                        Love Letter Studio
                      </div>
                      <span className="text-[11px] text-velvet-400">
                        28% of total visits
                      </span>
                    </div>
                  </div>

                  {/* Route Table & Device Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Route Breakdown */}
                    <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-romantic-100 dark:border-velvet-800">
                        <div className="flex items-center gap-2">
                          <BarChart2 className="w-5 h-5 text-romantic-500" />
                          <h4 className="font-display font-bold text-base text-romantic-950 dark:text-white">
                            Traffic by Studio &amp; Component Screen
                          </h4>
                        </div>
                        <span className="text-xs text-velvet-400 font-mono">
                          {Object.keys(state.routeStats).length} Monitored Paths
                        </span>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(state.routeStats).map(([pathKey, stat]) => {
                          const pct = totalPvs > 0 ? Math.round((stat.views / totalPvs) * 100) : 0;
                          return (
                            <div key={pathKey} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-velvet-900 dark:text-white uppercase tracking-wider text-[11px]">
                                  {pathKey.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center gap-4 text-velvet-500 font-mono">
                                  <span>{stat.views} views</span>
                                  <span className="font-bold text-romantic-600 dark:text-champagne-400">
                                    {pct}%
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-2 rounded-full bg-romantic-100 dark:bg-velvet-800 overflow-hidden">
                                <div
                                  style={{ width: `${Math.max(pct, 3)}%` }}
                                  className="h-full rounded-full bg-gradient-to-r from-romantic-500 to-champagne-400 transition-all duration-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Devices & Integrity Box */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="p-6 rounded-3xl bg-white dark:bg-velvet-900 border border-romantic-200 dark:border-velvet-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-romantic-100 dark:border-velvet-800">
                          <PieChart className="w-4 h-4 text-champagne-600" />
                          <h4 className="font-display font-bold text-sm text-romantic-950 dark:text-white">
                            Client Hardware Breakdown
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {[
                            { name: 'Mobile Handheld', icon: Smartphone, count: state.deviceCounts.Mobile || 0 },
                            { name: 'Desktop Workstation', icon: Monitor, count: state.deviceCounts.Desktop || 0 },
                            { name: 'Tablet / Foldable', icon: Tablet, count: state.deviceCounts.Tablet || 0 },
                          ].map((dev) => {
                            const Icon = dev.icon;
                            const pct = Math.round((dev.count / devTotal) * 100);
                            return (
                              <div key={dev.name} className="flex items-center justify-between p-3 rounded-2xl bg-romantic-50/50 dark:bg-velvet-800/50 text-xs">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-romantic-500" />
                                  <span className="font-medium text-velvet-900 dark:text-white">{dev.name}</span>
                                </div>
                                <span className="font-mono font-bold text-romantic-600 dark:text-champagne-400">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Compliance Badge */}
                      <div className="p-5 rounded-3xl bg-romantic-500 text-white shadow-romantic-md space-y-2.5">
                        <div className="flex items-center gap-2 text-champagne-200 text-xs font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Strict Privacy Compliance</span>
                        </div>
                        <p className="text-xs leading-relaxed text-white/90">
                          Giftlove does not track individual identities, sell client behavioral data, or store cross-site advertising identifiers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================================
         MODAL 1: INSPECT PROOF OF PAYMENT
         ====================================================================== */}
      <AnimatePresence>
        {selectedProofPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProofPayment(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-velvet-900 rounded-[32px] overflow-hidden border border-romantic-200 dark:border-velvet-700 shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-romantic-100 dark:border-velvet-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Payment Audit • {selectedProofPayment.orderId}
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Reference: {selectedProofPayment.referenceNo}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProofPayment(null)}
                  className="p-2 rounded-full hover:bg-romantic-100 dark:hover:bg-velvet-800 text-velvet-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-romantic-50 dark:bg-velvet-950/60 border border-romantic-100 dark:border-velvet-800">
                  <div>
                    <span className="text-velvet-500 block">Sender Name:</span>
                    <span className="font-bold text-romantic-950 dark:text-white">
                      {selectedProofPayment.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-velvet-500 block">Transfer Amount:</span>
                    <span className="font-bold font-display text-sm text-romantic-600 dark:text-romantic-300">
                      ${selectedProofPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-velvet-500 block">Payment Method:</span>
                    <span className="font-semibold text-velvet-800 dark:text-velvet-200">
                      {selectedProofPayment.method}
                    </span>
                  </div>
                  <div>
                    <span className="text-velvet-500 block">Submitted At:</span>
                    <span className="font-mono text-velvet-700 dark:text-velvet-300">
                      {selectedProofPayment.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Proof Receipt Attachment Image */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-2">
                    Uploaded Wire Slip / Screenshot:
                  </label>
                  <div className="rounded-2xl overflow-hidden border border-romantic-200 dark:border-velvet-700 aspect-[16/10] bg-black">
                    <img
                      src={selectedProofPayment.proofUrl}
                      alt="Bank Transfer Proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {selectedProofPayment.notes && (
                  <div className="p-3.5 rounded-xl bg-champagne-50 dark:bg-velvet-800 border border-champagne-200 dark:border-champagne-800 text-xs text-champagne-900 dark:text-champagne-200">
                    <span className="font-bold">Client Note:</span> {selectedProofPayment.notes}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedProofPayment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-velvet-600 dark:text-velvet-400 hover:bg-romantic-100 dark:hover:bg-velvet-800"
                >
                  Close Inspection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyPayment(selectedProofPayment.id, 'rejected')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 transition-colors"
                  >
                    Reject Payment
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(selectedProofPayment.id, 'verified')}
                    className="btn-romantic text-xs px-5 py-2 flex items-center gap-1.5 shadow-romantic-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Dispatch Order</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================================
         MODAL 2: REGISTER NEW VIP CLIENT
         ====================================================================== */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingUser(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-velvet-900 rounded-[32px] overflow-hidden border border-romantic-200 dark:border-velvet-700 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-romantic-100 dark:border-velvet-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Register Client Account
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Add a new client profile to the concierge directory.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingUser(false)}
                  className="p-2 rounded-full hover:bg-romantic-100 dark:hover:bg-velvet-800 text-velvet-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Lady Genevieve Dupont"
                    className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="genevieve@dupont-estates.com"
                    className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      Account Role
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) =>
                        setNewUserForm({ ...newUserForm, role: e.target.value as any })
                      }
                      className="w-full px-3 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="curator">Curator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      VIP Status Tier
                    </label>
                    <select
                      value={newUserForm.tier}
                      onChange={(e) =>
                        setNewUserForm({ ...newUserForm, tier: e.target.value as any })
                      }
                      className="w-full px-3 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold outline-none"
                    >
                      <option value="Silk Member">Silk Member</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="Diamond VIP">Diamond VIP</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-4 py-2 text-xs font-semibold text-velvet-600 dark:text-velvet-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-romantic text-xs px-5 py-2.5 shadow-romantic-sm"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================================
         MODAL 3: ADD NEW GIFT PRODUCT
         ====================================================================== */}
      <AnimatePresence>
        {isAddingGift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingGift(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-velvet-900 rounded-[32px] overflow-hidden border border-romantic-200 dark:border-velvet-700 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-romantic-100 dark:border-velvet-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-romantic-100 dark:bg-velvet-800 text-romantic-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-romantic-950 dark:text-white">
                      Add New Gift Product
                    </h3>
                    <p className="text-xs text-velvet-500 dark:text-velvet-400">
                      Catalog a new luxury gifting item with pricing and stock.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingGift(false)}
                  className="p-2 rounded-full hover:bg-romantic-100 dark:hover:bg-velvet-800 text-velvet-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGift} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newGiftForm.name}
                    onChange={(e) => setNewGiftForm({ ...newGiftForm, name: e.target.value })}
                    placeholder="Vintage French Crystal Decanter &amp; Petals"
                    className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-medium focus:ring-2 focus:ring-romantic-400 outline-none text-velvet-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      SKU Identifier
                    </label>
                    <input
                      type="text"
                      required
                      value={newGiftForm.sku}
                      onChange={(e) => setNewGiftForm({ ...newGiftForm, sku: e.target.value })}
                      placeholder="GL-CRYSTAL-01"
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono uppercase focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newGiftForm.category}
                      onChange={(e) =>
                        setNewGiftForm({ ...newGiftForm, category: e.target.value as any })
                      }
                      className="w-full px-3 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-white dark:bg-velvet-800 text-xs font-semibold outline-none"
                    >
                      <option value="Hampers">Hampers</option>
                      <option value="Roses">Roses</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Letters">Letters</option>
                      <option value="Digital">Digital</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newGiftForm.price}
                      onChange={(e) =>
                        setNewGiftForm({ ...newGiftForm, price: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-velvet-700 dark:text-velvet-300 mb-1">
                      Initial Stock Units
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={newGiftForm.stock}
                      onChange={(e) =>
                        setNewGiftForm({ ...newGiftForm, stock: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-romantic-200 dark:border-velvet-700 bg-romantic-50/50 dark:bg-velvet-800 text-xs font-mono focus:ring-2 focus:ring-romantic-400 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-romantic-100 dark:border-velvet-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingGift(false)}
                    className="px-4 py-2 text-xs font-semibold text-velvet-600 dark:text-velvet-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-romantic text-xs px-5 py-2.5 shadow-romantic-sm"
                  >
                    Add to Catalog
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================================
         MODAL 4: 2FA TOTP AUTHENTICATION & CHALLENGE MODAL
         ====================================================================== */}
      <Admin2FaLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          useGiftStore.getState().closeLoginModal();
        }}
        onSuccess={handle2FaSuccess}
        config={twoFaConfig}
        challengeActionTitle={pendingSensitiveAction?.title}
        challengeActionDesc={pendingSensitiveAction?.description}
      />
    </div>
  );
};

export default AdminDashboard;
