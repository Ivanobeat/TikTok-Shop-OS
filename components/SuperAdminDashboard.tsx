
import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Server, Activity, Ban, ShieldCheck, Wallet, Search, Wand2, BarChart3, LogOut, Lock, Save, Landmark, CreditCard, Bitcoin, Power, Zap, Settings, Globe, Database, AlertOctagon, Mail, Trash2, Smartphone, MessageCircle, ExternalLink, AlertTriangle, Workflow } from 'lucide-react';
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
               <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                 Nenhum cliente registado ainda. Ligue o "Motor de Vendas" e aguarde.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'settings' | 'research' | 'creative' | 'campaigns'>('overview');
  const [stats, setStats] = useState(db.getStats());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [transactions, setTransactions] = useState<Transaction[]>(db.getTransactions());
  
  // Estado para Configurações
  const [paymentConfig, setPaymentConfig] = useState<AdminPaymentConfig>(db.getPaymentConfig());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(db.getSystemSettings());
  const [configSaved, setConfigSaved] = useState(false);

  // Atualização em Tempo Real (Simulada via polling do localStorage)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(db.getStats());
      setUsers(db.getUsers());
      setTransactions(db.getTransactions());
    }, 1000); // Polling mais rápido para sentir "real time"
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

  const testWhatsApp = () => {
     if(!paymentConfig.whatsappNumber) return alert("Insere um número primeiro.");
     const url = `https://wa.me/${paymentConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=Teste+de+Configuracao+Realizado+com+Sucesso`;
     window.open(url, '_blank');
  }

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
        activeTab === id 
          ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      
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
        {!paymentConfig.whatsappNumber && (
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
               
               <button 
                 onClick={handleToggleAutoSales}
                 className={`relative w-20 h-10 rounded-full transition-colors duration-300 flex items-center shadow-inner cursor-pointer z-20 ${systemSettings.autoSalesEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
               >
                  <div className={`absolute w-8 h-8 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${systemSettings.autoSalesEnabled ? 'translate-x-11' : 'translate-x-1'}`}>
                     <Power className={`w-4 h-4 ${systemSettings.autoSalesEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
               </button>
            </div>

            {/* KPI Cards */}
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
                    <h3 className="text-3xl font-black text-purple-400 mt-2">12%</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Servidor Saudável</p>
                  </div>
                  <div className="bg-purple-500/10 p-2 rounded-lg"><Server className="w-6 h-6 text-purple-500" /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Live Feed */}
               <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                     Log ao Vivo
                   </h3>
                   <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">Real-time</span>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2"/>
                      <p className="text-xs text-slate-500">A aguardar transações...</p>
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
                   <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
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

                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                       <Workflow className="w-3 h-3 text-orange-500"/> N8N Webhook URL (Automação)
                     </p>
                     <input 
                      type="text" 
                      value={systemSettings.n8nWebhookUrl || ''}
                      placeholder="https://teu-n8n.com/webhook/..."
                      onChange={(e) => setSystemSettings({...systemSettings, n8nWebhookUrl: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-xs focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                      Cola aqui o teu Webhook do N8N. Quando preenchido, o bot envia os dados para lá em vez de processar localmente.
                    </p>
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
