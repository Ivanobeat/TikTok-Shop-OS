
import { User, Transaction, UserRole, AdminPaymentConfig, SystemSettings } from '../types';

// VERSÃO 6.0 - MUNDO REAL (Limpeza total de dados de teste)
const KEYS = {
  USERS: 'tiktok_os_users_v6_real_world',
  TRANSACTIONS: 'tiktok_os_transactions_v6_real_world',
  PAYMENT_CONFIG: 'tiktok_os_payment_config_v6_real_world',
  SYSTEM_SETTINGS: 'tiktok_os_system_settings_v6_real_world'
};

// Seed Data LIMPO - Apenas o Dono existe inicialmente
const DEFAULT_USERS: User[] = [
  { 
    id: 'admin', 
    name: 'CEO / Dono', 
    email: 'admin', 
    password: 'admin', 
    role: 'admin', 
    status: 'active', 
    isOnline: true, 
    joinedAt: new Date().toISOString(), 
    lastLogin: new Date().toISOString() 
  }
];

// Sem transações falsas. Começamos do zero.
const DEFAULT_TRANSACTIONS: Transaction[] = [];

const DEFAULT_CONFIG: AdminPaymentConfig = {
  mbwayNumber: '', // Usuário deve configurar
  paypalEmail: '',
  cryptoWallet: '',
  iban: '',
  whatsappNumber: '' // CRÍTICO: Usuário deve configurar para receber comprovativos
};

const DEFAULT_SETTINGS: SystemSettings = {
  autoSalesEnabled: true,
  appName: 'TikTok Shop OS',
  globalApiKey: 'AIzaSyCJWHZ_87DNVAz374zn0fNKBaW9O_eQZyk',
  n8nWebhookUrl: '', 
  maintenanceMode: false,
  supportEmail: 'suporte@meubot.com'
};

// Helpers de LocalStorage
const load = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
};

const save = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

// Estado em Memória
let users: User[] = load(KEYS.USERS, DEFAULT_USERS);
let transactions: Transaction[] = load(KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
let paymentConfig: AdminPaymentConfig = load(KEYS.PAYMENT_CONFIG, DEFAULT_CONFIG);
let systemSettings: SystemSettings = load(KEYS.SYSTEM_SETTINGS, DEFAULT_SETTINGS);

export const db = {
  getUsers: () => [...users],
  getTransactions: () => [...transactions],
  getPaymentConfig: () => ({ ...paymentConfig }),
  getSystemSettings: () => ({ ...systemSettings }),

  // Settings
  toggleAutoSales: (status: boolean) => {
    systemSettings = { ...systemSettings, autoSalesEnabled: status };
    save(KEYS.SYSTEM_SETTINGS, systemSettings);
    return systemSettings;
  },

  updateSystemSettings: (settings: Partial<SystemSettings>) => {
    systemSettings = { ...systemSettings, ...settings };
    save(KEYS.SYSTEM_SETTINGS, systemSettings);
    return systemSettings;
  },

  updatePaymentConfig: (config: AdminPaymentConfig) => {
    paymentConfig = { ...config };
    save(KEYS.PAYMENT_CONFIG, paymentConfig);
    return paymentConfig;
  },

  // Users & Transactions
  addUser: (user: User) => {
    users = [user, ...users];
    save(KEYS.USERS, users);
    return user;
  },

  addTransaction: (tx: Transaction) => {
    transactions = [tx, ...transactions];
    save(KEYS.TRANSACTIONS, transactions);
    return tx;
  },

  // Auth
  authenticate: (email: string, pass: string) => {
    // Recarregar para garantir dados frescos
    users = load(KEYS.USERS, DEFAULT_USERS);
    systemSettings = load(KEYS.SYSTEM_SETTINGS, DEFAULT_SETTINGS);

    if (systemSettings.maintenanceMode && email !== 'admin') {
      throw new Error('O sistema está em manutenção temporária.');
    }

    const user = users.find(u => (u.email === email || u.id === email) && u.password === pass);
    
    if (user) {
      if (user.status === 'banned') throw new Error('Acesso revogado pelo administrador.');
      user.isOnline = true;
      user.lastLogin = new Date().toISOString();
      users = users.map(u => u.id === user.id ? user : u);
      save(KEYS.USERS, users);
      return user;
    }
    return null;
  },

  logout: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isOnline = false;
      users = users.map(u => u.id === userId ? user : u);
      save(KEYS.USERS, users);
    }
  },

  // Admin Tools
  forceLogoutAll: () => {
    users = users.map(u => u.role !== 'admin' ? { ...u, isOnline: false } : u);
    save(KEYS.USERS, users);
  },

  banUser: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== 'admin') {
      user.status = user.status === 'banned' ? 'active' : 'banned';
      if (user.status === 'banned') user.isOnline = false;
      users = users.map(u => u.id === userId ? user : u); 
      save(KEYS.USERS, users);
    }
  },

  factoryReset: () => {
    localStorage.clear();
    window.location.reload();
  },

  getStats: () => {
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const activeClients = users.filter(u => u.role === 'client' && u.status === 'active').length;
    const onlineUsers = users.filter(u => u.isOnline && u.role === 'client').length;
    return { totalRevenue, activeClients, onlineUsers };
  }
};
