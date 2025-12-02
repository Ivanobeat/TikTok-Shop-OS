
import React, { useState, useEffect } from 'react';
import { Check, Zap, BarChart, Shield, Lock, CreditCard, Bitcoin, PlayCircle, Star, ArrowRight, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';
import { db } from '../services/mockDatabase';

interface LandingPageProps {
  onLoginClick: () => void;
  onPurchaseComplete: (username: string, pass: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onPurchaseComplete }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'MBWAY' | 'PAYPAL' | 'CRYPTO'>('MBWAY');
  const [showNotification, setShowNotification] = useState(false);
  
  // Buscar config do admin e status de vendas
  const adminConfig = db.getPaymentConfig();
  const salesSettings = db.getSystemSettings();
  const isSalesOpen = salesSettings.autoSalesEnabled;

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlanSelection = (plan: 'starter' | 'pro' | 'agency') => {
    if (!isSalesOpen) {
      alert("⚠️ As inscrições estão temporariamente fechadas. Entre na lista de espera.");
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  useEffect(() => {
    if (!isSalesOpen) return;
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isSalesOpen]);

  const getPrice = (plan: string) => {
    if (plan === 'starter') return 50;
    if (plan === 'pro') return 150;
    return 499;
  };

  const handlePurchase = () => {
    setProcessing(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      setProcessing(false);
      setShowPaymentModal(false);
      
      const tempId = `user_${Math.floor(Math.random() * 10000)}`;
      const tempPass = Math.random().toString(36).slice(-6).toUpperCase();
      const planPrice = getPrice(selectedPlan);

      // 1. Criar o utilizador na DB
      db.addUser({
        id: tempId,
        name: `Cliente Novo (${tempId})`,
        email: tempId,
        password: tempPass,
        role: 'client',
        plan: selectedPlan,
        status: 'active',
        isOnline: false,
        joinedAt: new Date().toISOString(),
        lastLogin: 'Never'
      });

      // 2. Registar a venda
      db.addTransaction({
        id: `tx_${Date.now()}`,
        userId: tempId,
        amount: planPrice,
        method: paymentMethod,
        status: 'completed',
        date: new Date().toISOString()
      });
      
      // 3. WhatsApp Integration (Mundo Real)
      const whatsappNumber = adminConfig.whatsappNumber;
      
      if (whatsappNumber) {
        // Formatar mensagem
        const message = `Olá! 👋\n\nAcabei de realizar o pagamento do plano *${selectedPlan.toUpperCase()}* (€${planPrice}) via *${paymentMethod}*.\n\nMeu ID de acesso gerado foi: *${tempId}*\n\nEnvio em anexo o comprovativo. Aguardo a liberação total!`;
        
        // Abrir WhatsApp
        const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        alert(`🎉 PAGAMENTO INICIADO!\n\nVocê escolheu o plano: ${selectedPlan.toUpperCase()}\n\nSuas credenciais PROVISÓRIAS são:\nLOGIN: ${tempId}\nSENHA: ${tempPass}\n\n⚠️ IMPORTANTE: Uma janela do WhatsApp foi aberta. Envie o comprovativo agora para validarmos a sua conta.`);
      } else {
        alert(`🎉 PAGAMENTO REGISTADO!\n\nNota: O administrador ainda não configurou o WhatsApp automático.\n\nGuarde estas credenciais:\nLOGIN: ${tempId}\nSENHA: ${tempPass}\n\nEnvie o comprovativo manualmente para o suporte.`);
      }

      onPurchaseComplete(tempId, tempPass);
    }, 2000);
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Fake Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-200 animate-fade-in flex items-center gap-3 max-w-xs">
          <div className="bg-green-100 p-2 rounded-full">
            <DollarSignIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Nova Venda!</p>
            <p className="text-xs text-slate-500">Tiago M. comprou o plano PRO há 2 min.</p>
          </div>
        </div>
      )}

      {/* Navbar Transparente */}
      <nav className="absolute top-0 w-full z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TikTok<span className="text-indigo-400">OS</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={onLoginClick} className="text-slate-300 font-medium hover:text-white transition-colors text-sm hidden sm:block">Login</button>
            <button 
              onClick={scrollToPricing} 
              className={`px-5 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${isSalesOpen ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-red-500 text-white cursor-not-allowed opacity-80'}`}
            >
              {isSalesOpen ? (
                <>Começar Agora <ArrowRight className="w-4 h-4"/></>
              ) : (
                <>Lista de Espera <Lock className="w-4 h-4"/></>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section Imersiva */}
      <header className="relative bg-slate-900 pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Efeitos de Fundo */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        {/* Blobs Animados */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSalesOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSalesOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            {isSalesOpen ? 'SISTEMA ATIVO V5.0 (PRODUCTION)' : 'MANUTENÇÃO / FECHADO'}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-fade-in">
            O Teu Funcionário <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Autónomo de Elite</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-2000">
            Este bot pesquisa, cria criativos e vende por ti 24/7. <br className="hidden md:block"/>
            Tu ficas com o controlo. Ele fica com o trabalho duro.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-4000">
            <button 
              onClick={scrollToPricing} 
              disabled={!isSalesOpen}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform flex items-center justify-center gap-2 ${isSalesOpen ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 hover:-translate-y-1 hover:scale-105' : 'bg-slate-700 text-slate-400 cursor-not-allowed hover:none'}`}
            >
               {isSalesOpen ? (
                 <><Zap className="w-5 h-5 fill-current"/> Quero Acesso ao Bot</>
               ) : (
                 <><Lock className="w-5 h-5"/> Acesso Fechado</>
               )}
            </button>
            <button 
              onClick={scrollToFeatures}
              className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Ver Como Funciona <PlayCircle className="w-5 h-5"/>
            </button>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-float hidden md:block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 border-b border-slate-700 p-4 flex items-center gap-2">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 </div>
                 <div className="ml-4 bg-slate-900/50 px-3 py-1 rounded-md text-xs text-slate-400 font-mono w-64">tiktok-os-dashboard.exe</div>
              </div>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" alt="Dashboard Preview" className="w-full opacity-80 mix-blend-overlay" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <p className="text-white text-2xl font-bold bg-black/50 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                    Sistema Operacional de E-commerce
                 </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Poder Absoluto na Tua Mão</h2>
            <p className="text-slate-500 text-lg">Três pilares que tornam este sistema imbatível.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              color="text-yellow-500"
              bg="bg-yellow-50"
              title="Automação Total" 
              desc="O bot pesquisa tendências virais e publica vídeos sem parar. Tu dormes, ele vende."
            />
            <FeatureCard 
              icon={Shield} 
              color="text-indigo-500"
              bg="bg-indigo-50"
              title="Clone Privado" 
              desc="Recebes uma instância isolada. Ninguém vê os teus produtos vencedores. 100% Seguro."
            />
            <FeatureCard 
              icon={BarChart} 
              color="text-green-500"
              bg="bg-green-50"
              title="Lucro Direto" 
              desc="Pagamentos integrados. Quando o cliente paga, o dinheiro vai direto para a tua wallet."
            />
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <div className="bg-slate-900 border-y border-slate-800 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-slate-400 text-sm font-mono uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isSalesOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div> 
             {isSalesOpen ? 'Servidores Online' : 'Sistema em Pausa'}
           </div>
           <div className="hidden md:block">Gerando €12,400+ hoje</div>
           <div>342 Bots Ativos</div>
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-200/30 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Investimento Inteligente</h2>
          <p className="text-slate-500 mb-16 max-w-xl mx-auto">Escolhe o nível de poder que queres dar ao teu negócio. Cancele a qualquer momento.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Starter */}
            <PricingCard 
              title="Iniciante" 
              price="50" 
              features={['1 Loja Conectada', 'Pesquisa Básica', '10 Scripts/mês']}
              onClick={() => handlePlanSelection('starter')}
              disabled={!isSalesOpen}
            />

            {/* Pro */}
            <div className={`relative transform scale-105 ${!isSalesOpen ? 'opacity-70 grayscale' : ''}`}>
               <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-75 animate-pulse"></div>
               <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 flex flex-col h-full">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg tracking-wide uppercase">
                  Recomendado
                </div>
                <h3 className="text-xl font-bold text-slate-900">Profissional</h3>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">€150</span>
                  <span className="text-slate-400 font-medium">/mês</span>
                </div>
                <ul className="space-y-4 mb-8 text-left text-slate-600 text-sm flex-1">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0"/> 3 Lojas Conectadas</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0"/> <strong>Pesquisa Viral Ilimitada</strong></li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0"/> Scripts AI Ilimitados</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0"/> Auto-Ads N8N</li>
                </ul>
                <button 
                  onClick={() => handlePlanSelection('pro')}
                  disabled={!isSalesOpen}
                  className={`w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all transform hover:-translate-y-1 ${isSalesOpen ? 'bg-slate-900 hover:bg-slate-800 hover:shadow-2xl' : 'bg-slate-500 cursor-not-allowed'}`}
                >
                  {isSalesOpen ? 'Comprar Acesso Pro' : 'Indisponível'}
                </button>
              </div>
            </div>

            {/* Agency */}
            <PricingCard 
              title="Agência (God Mode)" 
              price="499" 
              features={['Lojas Ilimitadas', 'Acesso API Completo', 'Whitelabel', 'Suporte Prioritário']}
              onClick={() => handlePlanSelection('agency')}
              disabled={!isSalesOpen}
            />

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-slate-900">TikTok OS</span>
           </div>
           <p className="text-slate-400 text-sm">© 2024 TikTok Shop OS. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl scale-100 transform transition-all">
            <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
              <h3 className="text-2xl font-bold relative z-10">Checkout Seguro</h3>
              <p className="text-slate-400 text-sm mt-1 relative z-10">Plano {selectedPlan.toUpperCase()} - €{getPrice(selectedPlan)}</p>
            </div>
            <div className="p-8">
              {!processing ? (
                <>
                  <p className="text-slate-900 mb-6 text-sm font-bold uppercase tracking-wide">Selecione o método:</p>
                  <div className="space-y-4 mb-8">
                    <button 
                      onClick={() => setPaymentMethod('MBWAY')}
                      className={`w-full flex flex-col items-start p-4 rounded-xl border-2 ${paymentMethod === 'MBWAY' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'} transition-all`}
                    >
                      <div className="flex justify-between w-full mb-1">
                        <span className="font-bold text-slate-800">MB WAY</span>
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">PT</span>
                      </div>
                      {paymentMethod === 'MBWAY' && (
                        <span className="text-xs text-indigo-600 font-mono mt-1">
                           {adminConfig.mbwayNumber ? `Envie para: ${adminConfig.mbwayNumber}` : 'Número disponível no WhatsApp'}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('PAYPAL')}
                      className={`w-full flex flex-col items-start p-4 rounded-xl border-2 ${paymentMethod === 'PAYPAL' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'} transition-all`}
                    >
                      <span className="font-bold text-slate-800 flex items-center gap-3"><CreditCard className="w-5 h-5 text-blue-600"/> Cartão / PayPal</span>
                      {paymentMethod === 'PAYPAL' && (
                         <span className="text-xs text-indigo-600 font-mono mt-1 ml-8">
                           {adminConfig.paypalEmail || 'Email disponível no WhatsApp'}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('CRYPTO')}
                      className={`w-full flex flex-col items-start p-4 rounded-xl border-2 ${paymentMethod === 'CRYPTO' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'} transition-all`}
                    >
                      <span className="font-bold text-slate-800 flex items-center gap-3"><Bitcoin className="w-5 h-5 text-amber-500"/> Crypto (USDT)</span>
                      {paymentMethod === 'CRYPTO' && (
                         <span className="text-[10px] text-indigo-600 font-mono mt-1 ml-8 break-all">
                           {adminConfig.cryptoWallet || 'Wallet disponível no WhatsApp'}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handlePurchase} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform active:scale-95">
                      Confirmar Pagamento
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                     <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">A processar...</h4>
                  <p className="text-slate-500 text-sm mt-2">A abrir WhatsApp para envio do comprovativo...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const FeatureCard = ({ icon: Icon, title, desc, color, bg }: any) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const PricingCard = ({ title, price, features, onClick, disabled }: any) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-200 hover:shadow-lg transition-all ${disabled ? 'opacity-75 grayscale' : ''}`}>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <div className="my-6">
      <span className="text-4xl font-bold text-slate-900">€{price}</span><span className="text-slate-500">/mês</span>
    </div>
    <ul className="space-y-4 mb-8 text-left text-slate-600 text-sm">
      {features.map((f: string, i: number) => (
         <li key={i} className="flex items-center gap-3"><Check className="w-5 h-5 text-green-500 flex-shrink-0"/> {f}</li>
      ))}
    </ul>
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 font-bold rounded-xl transition-colors ${disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
    >
      {disabled ? 'Indisponível' : `Escolher ${title}`}
    </button>
  </div>
);

const DollarSignIcon = (props: any) => (
  <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
)
