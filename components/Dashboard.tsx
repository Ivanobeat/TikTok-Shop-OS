import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Activity } from 'lucide-react';

const data = [
  { name: 'Seg', roas: 2.4, spend: 400, sales: 960 },
  { name: 'Ter', roas: 2.8, spend: 300, sales: 840 },
  { name: 'Qua', roas: 3.2, spend: 500, sales: 1600 },
  { name: 'Qui', roas: 2.9, spend: 450, sales: 1305 },
  { name: 'Sex', roas: 3.5, spend: 600, sales: 2100 },
  { name: 'Sáb', roas: 3.8, spend: 700, sales: 2660 },
  { name: 'Dom', roas: 3.1, spend: 550, sales: 1705 },
];

const StatCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
      <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
        {subtext}
      </p>
    </div>
    <div className="p-3 bg-indigo-50 rounded-lg">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Sistema Ativo
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value="€12,450" 
          subtext="+15% vs semana passada" 
          icon={DollarSign} 
          trend="up" 
        />
        <StatCard 
          title="ROAS Médio" 
          value="3.2x" 
          subtext="Meta: 2.5x" 
          icon={TrendingUp} 
          trend="up" 
        />
        <StatCard 
          title="Produtos Ativos" 
          value="8" 
          subtext="3 em fase de teste" 
          icon={ShoppingBag} 
          trend="up" 
        />
        <StatCard 
          title="CPA Médio" 
          value="€8.40" 
          subtext="-2% vs ontem" 
          icon={Activity} 
          trend="up" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance de Vendas (7 Dias)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  itemStyle={{color: '#1e293b'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Gastos vs ROAS</h3>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="spend" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="roas" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
