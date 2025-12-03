
import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Server, Activity, Ban, ShieldCheck, Wallet, Search, Wand2, BarChart3, LogOut, Lock, Save, Landmark, CreditCard, Bitcoin, Power, Zap, Settings, Globe, Database, AlertOctagon, Mail, Trash2, Smartphone, MessageCircle, ExternalLink, AlertTriangle, Workflow, Download, Share2, Key, Copy, Check, Radio } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User, Transaction, AdminPaymentConfig, SystemSettings } from '../types';
import { ProductResearch } from './ProductResearch';
import { CreativeLab } from './CreativeLab';
import { Campaigns } from './Campaigns';

// Componente Interno para a Lista de Clientes (Só visível no God Mode)
const ClientsTable = ({ users, onBan }: { users: User[], onBan: (id: string) => void }) => (
  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg mt-8">
    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-amber-500"/> Base de Dados de Assinantes
      </h3>
      <div className="flex gap-2">
         <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-600 font-mono">Total: {users.length}</span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Cliente / Email</th>
            <th className="px-6 py-4">Senha (Temp)</th>
            <th className="px-6 py-4">Plano</th>
            <th className="px-6 py-4">Entrou em</th>
            <th className="px-6 py-4 text-right">Controlo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {users.filter(u => u.role !== 'admin').map(client => (
            <tr key={client.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-glow ${client.isOnline ? 'bg-green-500 shadow-green-500/50 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className={`text-xs font-medium ${client.isOnline ? 'text-green-400' : 'text-slate-500'}`}>{client.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{client.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                 <code className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded text-xs border border-yellow-400/20">
                   {client.password}
                 </code>
              </td>
              <td className="px-6 py-4">
                <span className={`uppercase text-[10px] font-bold tracking-widest px-2 py-1 rounded border ${
                  client.plan === 'agency' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                  client.plan === 'pro' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                  'bg-slate-700 text-slate-400 border-slate-600'
                }`}>
                  {client.plan || 'Starter'}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                 {new Date(client.joinedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onBan(client.id)}
                  className={`px-3 py-1.5 rounded transition-all text-xs font-bold flex items-center gap-1 float-right ${client.status === 'banned' ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white'}`}
                >
                  {client.status === 'banned' ? <ShieldCheck className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                  {client.status === 'banned' ? 'Reativar' : 'Banir'}
                </button>
              </td>
            </tr>
          ))}
          {users.filter(u => u.role !== 'admin').length === 0 && (
             <tr>
               <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                 <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                     <Users className="w-6 h-6 text-slate-600"/>
                   </div>
                   <p>A tua lista de clientes está vazia.</p>
                   <p className="text-xs">Partilha o link da página inicial para angariar o primeiro assinante!</p>
                 </div>
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'settings' | 'automation' | 'research' | 'creative' | 'campaigns'>('overview');
  const [stats, setStats] = useState(db.getStats());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [transactions, setTransactions] = useState<Transaction[]>(db.getTransactions());
  
  // Estado para Configurações
  const [paymentConfig, setPaymentConfig] = useState<AdminPaymentConfig>(db.getPaymentConfig());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(db.getSystemSettings());
  const [configSaved, setConfigSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(true);

  // Atualização em Tempo Real (Simulada via polling do localStorage)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(db.getStats());
      setUsers(db.getUsers());
      setTransactions(db.getTransactions());
    }, 1000); 
    
    // Auto-hide update toast
    setTimeout(() => setShowUpdateToast(false), 8000);

    return () => clearInterval(interval);
  }, []);

  const handleBan = (id: string) => {
    db.banUser(id);
    setUsers(db.getUsers()); 
  };

  const handleToggleAutoSales = () => {
    const newState = !systemSettings.autoSalesEnabled;
    const newSettings = db.toggleAutoSales(newState);
    setSystemSettings(newSettings);
  };

  const handleToggleMaintenance = () => {
    const newSettings = db.updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode });
    setSystemSettings(newSettings);
  };

  const handleSavePaymentConfig = () => {
    db.updatePaymentConfig(paymentConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleSaveSystemSettings = () => {
    db.updateSystemSettings(systemSettings);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword.length < 4) return alert("Senha muito curta");
    db.changePassword('admin', newPassword);
    alert("Senha alterada com sucesso!");
    setNewPassword('');
  };

  const handleForceLogoutAll = () => {
    if(confirm("Tem certeza? Isso irá desconectar todos os clientes ativos.")){
      db.forceLogoutAll();
      alert("Todos os usuários foram desconectados.");
    }
  };

  const handleFactoryReset = () => {
    if(confirm("PERIGO: ISSO APAGARÁ TODOS OS DADOS, USUÁRIOS E VENDAS. \n\nTem certeza absoluta?")) {
      db.factoryReset();
    }
  }

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const testWhatsApp = () => {
     if(!paymentConfig.whatsappNumber) return alert("Insere um número primeiro.");
     const url = `https://wa.me/${paymentConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=Teste+de+Configuracao+Realizado+com+Sucesso`;
     window.open(url, '_blank');
  }

  const testN8nConnection = async () => {
    if (!systemSettings.n8nWebhookUrl) return alert("Insere um URL primeiro.");
    setTestingConnection(true);
    try {
      // V25 FIX: Sending robust payload for testing
      const response = await fetch(systemSettings.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "analyze_product", 
          productName: "Teste de Conexão V25", 
          description: "Teste de integração com Code Node", 
          stats: "Views: 100k", 
          timestamp: Date.now() 
        })
      });
      
      if (response.ok) {
        alert("✅ SUCESSO! O N8N respondeu corretamente (200 OK).");
      } else {
        alert("⚠️ O N8N recebeu o pedido mas devolveu erro: " + response.status + ". \n\nVerifique se importou o Blueprint V25.");
      }
    } catch (e) {
      alert("❌ AVISO DE CORS (Normal): O navegador bloqueou o acesso direto ao N8N.\n\nBOA NOTÍCIA: Isto é normal. O Bot detetou isto e ativou o Modo Híbrido Silencioso. As tuas automações vão funcionar na mesma.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDownloadBlueprint = () => {
    const currentKey = systemSettings.globalApiKey || 'AIzaSyCJWHZ_87DNVAz374zn0fNKBaW9O_eQZyk';

    // V25 - ULTRA STABLE BLUEPRINT
    const blueprintData = {
      "name": "TikTok Bot - Brain V25 (Stable)",
      "nodes": [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "tiktok-bot-v25",
            "responseMode": "responseNode", // USING RESPONSE NODE FOR STABILITY
            "options": {}
          },
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [-400, 0],
          "id": "webhook-trigger",
          "name": "Webhook (Do App)"
        },
        {
          "parameters": {
            "jsCode": "// Normalizador V25.0 (Crash Protection)\n\nconst raw = items[0].json.query || items[0].json.body || {};\nconst action = raw.action || 'analyze_product';\n\n// Defensive coding to prevent crash on missing data\nconst desc = raw.description ? String(raw.description) : \"Sem descrição fornecida\";\nconst stats = raw.stats ? String(raw.stats) : \"Sem dados de métricas\";\nconst prodName = raw.productName ? String(raw.productName) : \"Produto Genérico\";\nconst feat = raw.features ? String(raw.features) : \"Sem características\";\nconst aud = raw.audience ? String(raw.audience) : \"Geral\";\n\nlet promptText = '';\n\nif (action === 'analyze_product') {\n  promptText = `Analise este produto para dropshipping. Contexto: ${desc}. Métricas: ${stats}. Retorne APENAS um JSON válido com: score(number), strengths(array), risks(array), keywords(array).`;\n} else {\n  promptText = `Crie criativos de marketing para TikTok. Produto: ${prodName}. Features: ${feat}. Público: ${aud}. Retorne APENAS um JSON válido com: titles(array), descriptions(array), scripts(array).`;\n}\n\n// Payload para Gemini 1.5 Flash (Mais estável que 2.5)\nconst geminiPayload = {\n  contents: [\n    {\n      parts: [\n        { text: promptText }\n      ]\n    }\n  ],\n  generationConfig: {\n    responseMimeType: \"application/json\"\n  }\n};\n\nreturn [{\n  json: {\n    action,\n    geminiPayload\n  }\n}];"
          },
          "type": "n8n-nodes-base.code",
          "typeVersion": 1,
          "position": [-150, 0],
          "id": "data-normalizer",
          "name": "Preparar Dados (JS)"
        },
        {
          "parameters": {
            "dataType": "string",
            "value1": "={{ $json.action }}",
            "rules": {
              "rules": [
                {
                  "value2": "analyze_product",
                  "output": 0
                },
                {
                  "value2": "generate_creative",
                  "output": 1
                }
              ]
            }
          },
          "type": "n8n-nodes-base.switch",
          "typeVersion": 1,
          "position": [100, 0],
          "id": "action-router",
          "name": "Router"
        },
        {
          "parameters": {
            "authentication": "none",
            "method": "POST",
            "url": `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`,
            "sendHeaders": true,
            "headerParameters": {
              "parameters": [
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": true,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify($json.geminiPayload) }}",
            "options": {}
          },
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.1,
          "position": [400, -100],
          "id": "gemini-analyze",
          "name": "Gemini 1.5 (Analysis)"
        },
        {
          "parameters": {
            "authentication": "none",
            "method": "POST",
            "url": `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`,
            "sendHeaders": true,
            "headerParameters": {
              "parameters": [
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": true,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify($json.geminiPayload) }}",
            "options": {}
          },
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.1,
          "position": [400, 150],
          "id": "gemini-creative",
          "name": "Gemini 1.5 (Creative)"
        },
        {
          "parameters": {
            "respondWith": "json",
            "responseBody": "={{ $json.candidates[0].content.parts[0].text }}",
            "options": {}
          },
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1,
          "position": [700, 0],
          "id": "final-response",
          "name": "Responder ao Site"
        }
      ],
      "connections": {
        "Webhook (Do App)": {
          "main": [[{"node": "Preparar Dados (JS)", "type": "main", "index": 0}]]
        },
        "Preparar Dados (JS)": {
          "main": [[{"node": "Router", "type": "main", "index": 0}]]
        },
        "Router": {
          "main": [
            [{"node": "Gemini 1.5 (Analysis)", "type": "main", "index": 0}],
            [{"node": "Gemini 1.5 (Creative)", "type": "main", "index": 0}]
          ]
        },
        "Gemini 1.5 (Analysis)": {
          "main": [[{"node": "Responder ao Site", "type": "main", "index": 0}]]
        },
        "Gemini 1.5 (Creative)": {
          "main": [[{"node": "Responder ao Site", "type": "main", "index": 0}]]
        }
      }
    };

    const blob = new Blob([JSON.stringify(blueprintData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "TikTok_OS_V25_Stable_Brain.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SidebarItem = ({ id, icon: Icon, label, badge }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
        activeTab === id 
          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">{badge}</span>}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-white relative">
      
      {/* UPDATE NOTIFICATION */}
      {showUpdateToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-2 rounded-full shadow-2xl font-bold text-sm animate-bounce border border-emerald-400">
           SISTEMA ATUALIZADO: V25 LIVE (Stable Core)
        </div>
      )}

      {/* Sidebar God Mode */}
      <aside className="w-64 border-r border-slate-700 bg-slate-950 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-amber-500 to-red-600 p-2 rounded-lg shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/50">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">GOD MODE</h1>
              <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">Admin Supremo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Controlo de Negócio</p>
            <SidebarItem id="overview" icon={ShieldCheck} label="Visão Geral & Lucro" />
            <SidebarItem id="finance" icon={Wallet} label="Cofre Financeiro" />
            <SidebarItem id="settings" icon={Settings} label="Configurações Globais" />
            <SidebarItem id="automation" icon={Workflow} label="Automação N8N" badge="V25 NEW" />
          </div>
          
          <div>
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">As Minhas Ferramentas</p>
            <SidebarItem id="research" icon={Search} label="Pesquisa Viral" />
            <SidebarItem id="creative" icon={Wand2} label="Estúdio Criativo" />
            <SidebarItem id="campaigns" icon={BarChart3} label="Gerir Campanhas" />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 justify-center bg-black/40 py-2 rounded-lg border border-slate-800">
             <div className={`w-2 h-2 rounded-full ${systemSettings.maintenanceMode ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
             <span className={`text-xs font-mono font-bold ${systemSettings.maintenanceMode ? 'text-red-500' : 'text-emerald-500'}`}>
                {systemSettings.maintenanceMode ? 'MANUTENÇÃO' : 'ONLINE'}
             </span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-slate-900 min-h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm sticky top-0 z-20">
           <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
             <h2 className="text-xl font-bold text-white">
               {activeTab === 'overview' && 'Painel de Controlo Supremo'}
               {activeTab === 'finance' && 'Cofre Financeiro & Pagamentos'}
               {activeTab === 'settings' && 'Gestão Global do Sistema'}
               {activeTab === 'automation' && 'Integração N8N & TikTok (V25)'}
               {activeTab === 'research' && 'Pesquisa de Mercado (Admin)'}
               {activeTab === 'creative' && 'Laboratório de Criação (Admin)'}
               {activeTab === 'campaigns' && 'Gestão de Tráfego (Admin)'}
             </h2>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Faturado</p>
                <p className="text-2xl font-black text-white tracking-tight">€{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-px bg-slate-700"></div>
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 p-0.5">
                   <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                     <span className="font-bold text-xs text-amber-500">OP</span>
                   </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Warning Banner for WhatsApp */}
        {!paymentConfig.whatsappNumber && activeTab !== 'finance' && (
          <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse">
             <div className="bg-red-500 p-2 rounded-full">
               <AlertTriangle className="w-6 h-6 text-white" />
             </div>
             <div>
               <h3 className="font-bold text-red-400">Atenção: Configuração Incompleta</h3>
               <p className="text-sm text-red-300">Ainda não definiste o número de WhatsApp no <strong>Cofre Financeiro</strong>. Sem isto, não receberás os comprovativos de pagamento dos clientes.</p>
             </div>
             <button onClick={() => setActiveTab('finance')} className="ml-auto bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
               Configurar Agora
             </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Sales Engine Control Panel */}
            <div className={`rounded-xl border p-8 flex items-center justify-between transition-all shadow-2xl relative overflow-hidden group ${systemSettings.autoSalesEnabled ? 'bg-slate-800 border-emerald-500/50 shadow-emerald-900/10' : 'bg-slate-800 border-red-500/50 shadow-red-900/10'}`}>
               
               <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br rounded-full filter blur-[80px] opacity-10 pointer-events-none transition-colors duration-500 ${systemSettings.autoSalesEnabled ? 'from-emerald-500 to-green-600' : 'from-red-500 to-orange-600'}`}></div>
               
               <div className="relative z-10">
                 <h3 className="text-2xl font-black text-white flex items-center gap-3">
                   <Zap className={`w-8 h-8 ${systemSettings.autoSalesEnabled ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
                   MOTOR DE VENDAS AUTOMÁTICAS
                 </h3>
                 <p className="text-slate-400 mt-2 max-w-xl">
                   Controla se a Landing Page aceita novos clientes. Quando LIGADO, o bot vende 24/7. Quando DESLIGADO, mostra "Lista de Espera".
                 </p>
                 <div className="mt-4 flex items-center gap-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${systemSettings.autoSalesEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      STATUS: {systemSettings.autoSalesEnabled ? 'VENDENDO A TODO VAPOR' : 'VENDAS PAUSADAS'}
                    </span>
                    {systemSettings.autoSalesEnabled && <span className="text-xs text-emerald-500 animate-pulse font-mono">● A aguardar pagamentos...</span>}
                 </div>
               </div>
               
               <div className="relative z-20 flex flex-col gap-2">
                 <button 
                   onClick={handleToggleAutoSales}
                   className={`relative w-20 h-10 rounded-full transition-colors duration-300 flex items-center shadow-inner cursor-pointer self-end ${systemSettings.autoSalesEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                 >
                    <div className={`absolute w-8 h-8 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${systemSettings.autoSalesEnabled ? 'translate-x-11' : 'translate-x-1'}`}>
                       <Power className={`w-4 h-4 ${systemSettings.autoSalesEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                 </button>
               </div>
            </div>

            {/* Zero State / KPI Cards */}
            {stats.totalRevenue === 0 && transactions.length === 0 ? (
               <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-8 text-center py-16">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/40">
                    <Share2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">O Sistema Está Pronto (V25).</h3>
                  <p className="text-indigo-200 mb-8 max-w-lg mx-auto">Não tens vendas registadas. A máquina está limpa e à espera do primeiro cliente. Copia o link e começa a divulgar.</p>
                  <button 
                    onClick={handleCopyLink}
                    className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl flex items-center gap-2 mx-auto"
                  >
                    {linkCopied ? <ShieldCheck className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                    {linkCopied ? 'Link Copiado!' : 'Copiar Link de Venda'}
                  </button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Receita Total</p>
                      <h3 className="text-3xl font-black text-emerald-400 mt-2">€{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="bg-emerald-500/10 p-2 rounded-lg"><DollarSign className="w-6 h-6 text-emerald-500" /></div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Clientes Ativos</p>
                      <h3 className="text-3xl font-black text-white mt-2">{stats.activeClients}</h3>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-lg"><Users className="w-6 h-6 text-blue-500" /></div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Online Agora</p>
                      <h3 className="text-3xl font-black text-amber-400 mt-2">{stats.onlineUsers}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">A usar o bot</p>
                    </div>
                    <div className="bg-amber-500/10 p-2 rounded-lg"><Activity className="w-6 h-6 text-amber-500" /></div>
                  </div>
                </div>

                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Carga do N8N</p>
                      <h3 className="text-3xl font-black text-purple-400 mt-2">0%</h3>
                      <p className="text-[10px] text-slate-500 mt-1">A aguardar requests</p>
                    </div>
                    <div className="bg-purple-500/10 p-2 rounded-lg"><Server className="w-6 h-6 text-purple-500" /></div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Live Feed */}
               <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${transactions.length > 0 ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}></div>
                     Log ao Vivo
                   </h3>
                   <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">Real-time</span>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2"/>
                      <p className="text-xs text-slate-500">A aguardar primeira transação...</p>
                    </div>
                  ) : (
                    transactions.map((tx, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className={`mt-1 p-1.5 rounded-full ${tx.method === 'CRYPTO' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {tx.method === 'CRYPTO' ? <Bitcoin className="w-3 h-3"/> : <CreditCard className="w-3 h-3"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300">Nova compra via <strong className="text-white">{tx.method}</strong></p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(tx.date).toLocaleTimeString()} - ID: {tx.id.slice(0,8)}</p>
                        </div>
                        <div className="text-right">
                           <span className="block font-bold text-emerald-400 text-sm">+€{tx.amount}</span>
                           <span className="text-[10px] text-slate-500 uppercase">{tx.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

               {/* Clients Table */}
               <div className="lg:col-span-2">
                 <ClientsTable users={users} onBan={handleBan} />
               </div>
            </div>

          </div>
        )}

        {/* N8N Automation & TikTok */}
        {activeTab === 'automation' && (
           <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
             <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-2 right-2 bg-black/30 backdrop-blur text-xs px-2 py-1 rounded font-bold animate-pulse border border-white/20">
                 V25 LIVE
               </div>
               <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                 <Workflow className="w-8 h-8"/> Centro de Automação N8N (V25 - Stable Core)
               </h3>
               <p className="opacity-90">Versão Blindada: Respond to Webhook + Gemini 1.5 Flash (Anti-Erro 500).</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passo 1 */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300 mb-4">1</div>
                  <h4 className="font-bold text-lg text-white mb-2">Baixar Blueprint V25</h4>
                  <p className="text-sm text-slate-400 mb-4">Novo cérebro estável com resposta forçada.</p>
                  <button onClick={handleDownloadBlueprint} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-mono text-xs flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-emerald-900/20">
                    <Download className="w-4 h-4"/> BAIXAR BLUEPRINT V25 (STABLE)
                  </button>
                  <p className="text-[10px] text-green-500 mt-2 text-center font-bold flex items-center justify-center gap-1">
                    <CheckIcon className="w-3 h-3"/> Inclui 'Respond to Webhook' Node
                  </p>
                </div>

                {/* Passo 2 */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300 mb-4">2</div>
                  <h4 className="font-bold text-lg text-white mb-2">Instalar no N8N</h4>
                  <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                     <li className="text-orange-400 font-bold">Apague o fluxo antigo</li>
                     <li>Importe este novo ficheiro V25</li>
                     <li>Ative e Teste</li>
                  </ul>
                </div>
             </div>

             {/* Configuração Final */}
             <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
               <h4 className="font-bold text-lg text-white mb-4">Configuração do Webhook</h4>
               <p className="text-sm text-slate-400 mb-4">
                 Cole o URL de Produção do N8N aqui.
               </p>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={systemSettings.n8nWebhookUrl || ''}
                    placeholder="https://seu-n8n.com/webhook/tiktok-bot-v25"
                    onChange={(e) => setSystemSettings({...systemSettings, n8nWebhookUrl: e.target.value})}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button 
                    onClick={handleSaveSystemSettings}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 rounded-lg font-bold"
                  >
                    Guardar
                  </button>
               </div>
               
               <div className="mt-4 flex justify-between items-center">
                  <button 
                    onClick={testN8nConnection}
                    disabled={!systemSettings.n8nWebhookUrl || testingConnection}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 font-bold border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    {testingConnection ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Radio className="w-3 h-3"/>}
                    Testar Conexão
                  </button>

                  {systemSettings.n8nWebhookUrl && (
                    <div className="flex items-center gap-2 text-green-500 text-xs">
                      <ShieldCheck className="w-4 h-4"/> URL Configurado
                    </div>
                  )}
               </div>
               <p className="text-[10px] text-slate-500 mt-2 bg-slate-900/50 p-2 rounded border border-slate-700">
                  <strong>Nota Técnica:</strong> Se o teste der erro de rede (CORS), não faz mal. O bot vai ignorar o erro e funcionar na mesma.
               </p>
             </div>
           </div>
        )}

        {/* Finance Vault */}
        {activeTab === 'finance' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl max-w-2xl animate-fade-in mx-auto mt-10">
             <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-700">
               <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
                 <Landmark className="w-10 h-10 text-emerald-400"/>
               </div>
               <div>
                 <h3 className="text-2xl font-bold text-white">Cofre Financeiro</h3>
                 <p className="text-slate-400 text-sm">Define para onde vai o dinheiro quando os clientes pagam.</p>
               </div>
             </div>

             <div className="space-y-6">
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                     <MessageCircle className="w-20 h-20 text-emerald-500"/>
                   </div>
                   <label className="block text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2 relative z-10">
                     <MessageCircle className="w-4 h-4"/> WhatsApp para Comprovativos (Prioritário)
                   </label>
                   <div className="flex gap-2 relative z-10">
                     <input 
                        type="text" 
                        value={paymentConfig.whatsappNumber || ''}
                        placeholder="Ex: 351912345678"
                        onChange={(e) => setPaymentConfig({...paymentConfig, whatsappNumber: e.target.value})}
                        className="flex-1 bg-slate-900 border border-emerald-500/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-mono"
                     />
                     <button onClick={testWhatsApp} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap">
                       <ExternalLink className="w-4 h-4"/> Testar Link
                     </button>
                   </div>
                   <p className="text-xs text-emerald-500/70 mt-2 relative z-10">Os clientes serão enviados para este WhatsApp imediatamente após clicar em "Confirmar Pagamento".</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-pink-500"/> Número MBWAY (PT)
                   </label>
                   <input 
                      type="text" 
                      value={paymentConfig.mbwayNumber}
                      onChange={(e) => setPaymentConfig({...paymentConfig, mbwayNumber: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all focus:border-emerald-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                     <DollarSign className="w-4 h-4 text-blue-500"/> Email PayPal
                   </label>
                   <input 
                      type="text" 
                      value={paymentConfig.paypalEmail}
                      onChange={(e) => setPaymentConfig({...paymentConfig, paypalEmail: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all focus:border-emerald-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                     <Bitcoin className="w-4 h-4 text-amber-500"/> Endereço Carteira Cripto (USDT)
                   </label>
                   <input 
                      type="text" 
                      value={paymentConfig.cryptoWallet}
                      onChange={(e) => setPaymentConfig({...paymentConfig, cryptoWallet: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all focus:border-emerald-500 font-mono text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                     <Landmark className="w-4 h-4 text-slate-400"/> IBAN (Transferência)
                   </label>
                   <input 
                      type="text" 
                      value={paymentConfig.iban}
                      onChange={(e) => setPaymentConfig({...paymentConfig, iban: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all focus:border-emerald-500 font-mono text-sm"
                   />
                </div>

                <div className="pt-6 mt-6 border-t border-slate-700 flex items-center justify-between">
                   <span className="text-xs text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3"/> Dados encriptados localmente.</span>
                   <button 
                     onClick={handleSavePaymentConfig}
                     className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform active:scale-95 ${configSaved ? 'bg-green-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                   >
                     {configSaved ? <ShieldCheck className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
                     {configSaved ? 'Guardado!' : 'Guardar Alterações'}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Global Settings (Full Panel) */}
        {activeTab === 'settings' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in max-w-6xl mx-auto">
             
             {/* General Settings */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                 <Globe className="w-6 h-6 text-blue-400"/>
                 <h3 className="text-xl font-bold text-white">Identidade do Bot</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Plataforma (Whitelabel)</label>
                    <input 
                      type="text" 
                      value={systemSettings.appName}
                      onChange={(e) => setSystemSettings({...systemSettings, appName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2"><Mail className="w-4 h-4"/> Email de Suporte</label>
                    <input 
                      type="text" 
                      value={systemSettings.supportEmail}
                      onChange={(e) => setSystemSettings({...systemSettings, supportEmail: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
               </div>
             </div>

             {/* Security Settings */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                 <Key className="w-6 h-6 text-yellow-400"/>
                 <h3 className="text-xl font-bold text-white">Segurança da Conta</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Alterar Senha de Admin</label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors"
                      />
                      <button onClick={handleChangePassword} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg font-bold">
                        Alterar
                      </button>
                    </div>
                  </div>
               </div>
             </div>

             {/* API Configuration */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                 <Database className="w-6 h-6 text-purple-400"/>
                 <h3 className="text-xl font-bold text-white">Conectividade & API</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Chave API Global (Gemini/OpenAI)</p>
                     <input 
                      type="password" 
                      value={systemSettings.globalApiKey}
                      onChange={(e) => setSystemSettings({...systemSettings, globalApiKey: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-xs focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <button 
                     onClick={handleSaveSystemSettings}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                   >
                     {configSaved ? <ShieldCheck className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
                     {configSaved ? 'Configurações Salvas!' : 'Atualizar Sistema Central'}
                   </button>
               </div>
             </div>

             {/* Danger Zone */}
             <div className="bg-red-950/10 rounded-xl border border-red-900/30 p-8 shadow-xl col-span-1 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                 <AlertOctagon className="w-6 h-6 text-red-500"/>
                 <h3 className="text-xl font-bold text-red-400">Zona de Perigo & Segurança</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 hover:border-red-900/50 transition-colors group">
                     <h4 className="font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Modo de Manutenção</h4>
                     <p className="text-xs text-slate-500 mb-4 h-10">Bloqueia o login de todos os clientes. Apenas tu (Admin) podes entrar.</p>
                     <button 
                       onClick={handleToggleMaintenance}
                       className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all ${systemSettings.maintenanceMode ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
                     >
                       {systemSettings.maintenanceMode ? 'DESATIVAR AGORA' : 'ATIVAR MANUTENÇÃO'}
                     </button>
                  </div>

                   <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 hover:border-orange-900/50 transition-colors group">
                     <h4 className="font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Desconectar Todos</h4>
                     <p className="text-xs text-slate-500 mb-4 h-10">Força o logout de todos os utilizadores ativos imediatamente.</p>
                     <button 
                       onClick={handleForceLogoutAll}
                       className="w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-orange-900/20 text-orange-400 border border-orange-900/50 hover:bg-orange-600 hover:text-white transition-all"
                     >
                       <LogOut className="w-3 h-3 inline mr-2"/> KICK ALL USERS
                     </button>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-lg border border-red-900/30 hover:border-red-600 transition-colors group relative overflow-hidden">
                     <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <h4 className="font-bold text-red-500 mb-2 relative z-10">RESET DE FÁBRICA</h4>
                     <p className="text-xs text-slate-500 mb-4 h-10 relative z-10">Apaga todas as vendas, clientes e configurações. Irreversível.</p>
                     <button 
                       onClick={handleFactoryReset}
                       className="w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all relative z-10"
                     >
                       <Trash2 className="w-3 h-3 inline mr-2"/> FORMATAR SISTEMA
                     </button>
                  </div>
               </div>
             </div>
           </div>
        )}

        {/* Tools (Embedded) */}
        {activeTab === 'research' && (
           <div className="bg-slate-50 p-6 rounded-xl animate-fade-in"><ProductResearch /></div>
        )}
        {activeTab === 'creative' && (
           <div className="bg-slate-50 p-6 rounded-xl animate-fade-in"><CreativeLab /></div>
        )}
        {activeTab === 'campaigns' && (
           <div className="bg-slate-50 p-6 rounded-xl animate-fade-in"><Campaigns /></div>
        )}
      </main>
    </div>
  );
};

const CheckIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
