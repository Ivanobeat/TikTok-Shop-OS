
export interface Product {
  id: string;
  name: string;
  category: string;
  viralScore: number;
  supplierPrice: number;
  targetPrice: number;
  margin: number;
  status: 'scanning' | 'approved' | 'rejected' | 'active';
  imageUrl: string;
  trends: string[];
}

export interface Creative {
  id: string;
  productId: string;
  type: 'video_script' | 'ad_copy' | 'title';
  variant: 'A' | 'B' | 'C';
  content: string;
  generatedDate: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'TikTok' | 'Meta';
  budget: number;
  spend: number;
  roas: number;
  cpa: number;
  status: 'active' | 'paused' | 'learning';
}

export interface AiAnalysisResult {
  score: number;
  strengths: string[];
  risks: string[];
  keywords: string[];
}

export interface CreativeGenerationResult {
  titles: string[];
  descriptions: string[];
  scripts: string[];
}

// Novos tipos para o sistema SaaS
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  password?: string; // Para display no painel admin (simulação)
  name: string;
  role: UserRole;
  plan?: 'starter' | 'pro' | 'agency';
  status: 'active' | 'pending_payment' | 'banned';
  isOnline: boolean;
  joinedAt: string;
  lastLogin: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  method: 'PAYPAL' | 'MBWAY' | 'CRYPTO';
  status: 'completed' | 'pending';
  date: string;
}

export interface AdminStats {
  totalRevenue: number;
  activeClients: number;
  totalCreativesGenerated: number;
  serverLoad: number;
}

export interface AdminPaymentConfig {
  mbwayNumber: string;
  paypalEmail: string;
  cryptoWallet: string;
  iban: string;
  whatsappNumber: string; // Essencial para receber comprovativos
}

export interface SystemSettings {
  autoSalesEnabled: boolean;
  appName: string;
  globalApiKey: string;
  n8nWebhookUrl: string; // URL do Webhook do N8N para automação real
  maintenanceMode: boolean;
  supportEmail: string;
}
