
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Wand2, BarChart3, Settings, LogOut, Menu, X, Shield } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ProductResearch } from './components/ProductResearch';
import { CreativeLab } from './components/CreativeLab';
import { Campaigns } from './components/Campaigns';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { UserRole, User } from './types';
import { db } from './services/mockDatabase';

// Styles for fade animation and new glowing effects
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  .animate-spin-slow {
    animation: spin 3s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

const App: React.FC = () => {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'app'>('landing');

  // Estado da App Cliente
  const [activeTab, setActiveTab] = useState<'dashboard' | 'research' | 'creative' | 'campaigns' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restaurar sessão ao carregar (se houver dados no LocalStorage e status online)
  useEffect(() => {
    // Check for "remembered" session logic implies verifying persistence
    // For this implementation, we start at landing, but check DB consistency
    const users = db.getUsers();
    // Optional: Auto-login logic could go here if we stored a session token in LS
  }, []);

  // Handlers de Auth
  const handleLogin = (role: UserRole) => {
    const users = db.getUsers();
    // Tenta encontrar o usuário que acabou de logar (isOnline = true)
    // Num sistema real, o componente Login passaria o objeto User diretamente
    const loggedUser = users.find(u => u.isOnline && u.role === role) || users.find(u => u.role === role);
    
    if (loggedUser) {
      setCurrentUser(loggedUser);
      setIsAuthenticated(true);
      setUserRole(role);
      setCurrentPage('app');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
       db.logout(currentUser.id);
    }
    
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handlePurchaseComplete = (user: string, pass: string) => {
    // Redireciona para o login após compra
    setCurrentPage('login');
  };

  // Renderização Condicional de Páginas Iniciais
  if (currentPage === 'landing') {
    return <LandingPage onLoginClick={() => setCurrentPage('login')} onPurchaseComplete={handlePurchaseComplete} />;
  }

  if (currentPage === 'login') {
    return <Login onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
  }

  // --- SE FOR SUPER ADMIN (GOD MODE) ---
  if (isAuthenticated && userRole === 'admin') {
    return (
        <div className="relative">
             <SuperAdminDashboard />
             <button 
                onClick={handleLogout}
                className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 font-bold z-50 flex items-center gap-2 hover:scale-105 transition-transform"
             >
                <LogOut className="w-4 h-4"/> Sair do Modo Deus
             </button>
        </div>
    );
  }

  // --- SE FOR CLIENTE (O CLONE DO SISTEMA) ---
  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-slate-400'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
        
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm z-10">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-300">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TikTok Shop OS</h1>
            </div>
            <span className="text-xs text-slate-400 mt-1 ml-10 block bg-slate-100 px-2 py-0.5 rounded w-fit">v2.5 Stable</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="research" icon={ShoppingCart} label="Pesquisa Viral" />
            <NavItem id="creative" icon={Wand2} label="Estúdio Criativo" />
            <NavItem id="campaigns" icon={BarChart3} label="Campanhas" />
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
             <NavItem id="settings" icon={Settings} label="Configurações" />
             <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3 px-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} alt="User" />
                  </div>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || 'Cliente'}</p>
                 <p className="text-xs text-slate-500 truncate capitalize">{currentUser?.plan || 'Free'} Plan</p>
               </div>
               <LogOut onClick={handleLogout} className="w-4 h-4 text-slate-400 cursor-pointer hover:text-red-500 transition-colors"/>
             </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">TikTok OS</h1>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 pt-20 px-4 md:hidden animate-fade-in">
            <nav className="space-y-2">
              <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem id="research" icon={ShoppingCart} label="Pesquisa Viral" />
              <NavItem id="creative" icon={Wand2} label="Estúdio Criativo" />
              <NavItem id="campaigns" icon={BarChart3} label="Campanhas" />
              <NavItem id="settings" icon={Settings} label="Configurações" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair da Conta</span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 md:ml-0 pt-16 md:pt-0 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
             {activeTab === 'dashboard' && <Dashboard />}
             {activeTab === 'research' && <ProductResearch />}
             {activeTab === 'creative' && <CreativeLab />}
             {activeTab === 'campaigns' && <Campaigns />}
             {activeTab === 'settings' && (
               <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Configurações da Conta</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chave API Pessoal (Opcional)</label>
                      <p className="text-xs text-slate-500 mb-2">Se deixares em branco, o bot usará a chave mestre do sistema.</p>
                      <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="sk-..." />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Plano Atual</label>
                       <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg uppercase text-sm">
                         {currentUser?.plan || 'Starter'}
                       </div>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
