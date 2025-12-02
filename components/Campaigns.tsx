import React from 'react';
import { Campaign } from '../types';
import { Play, Pause, AlertTriangle } from 'lucide-react';

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Escova 5-em-1 - Teste A', platform: 'TikTok', budget: 50, spend: 125, roas: 3.2, cpa: 4.5, status: 'active' },
  { id: '2', name: 'Escova 5-em-1 - Teste B', platform: 'TikTok', budget: 50, spend: 120, roas: 1.8, cpa: 8.2, status: 'paused' },
  { id: '3', name: 'Mini Printer - Escala', platform: 'Meta', budget: 100, spend: 850, roas: 2.9, cpa: 12.0, status: 'active' },
];

export const Campaigns: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestor de Campanhas</h2>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          Ajuste Automático de Orçamento (N8N): <span className="text-green-600 font-bold">LIGADO</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
             <tr>
                <th className="px-6 py-4">Campanha</th>
                <th className="px-6 py-4">Plataforma</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Gasto Total</th>
                <th className="px-6 py-4">ROAS</th>
                <th className="px-6 py-4">CPA</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CAMPAIGNS.map(camp => (
              <tr key={camp.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{camp.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${camp.platform === 'TikTok' ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
                    {camp.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                   {camp.status === 'active' ? (
                     <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                       <Play className="w-3 h-3 fill-current"/> Ativa
                     </span>
                   ) : (
                     <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                       <Pause className="w-3 h-3 fill-current"/> Pausada (Auto)
                     </span>
                   )}
                </td>
                <td className="px-6 py-4">€{camp.spend.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${camp.roas >= 2.5 ? 'text-green-600' : 'text-red-500'}`}>
                    {camp.roas}x
                  </span>
                </td>
                <td className="px-6 py-4">€{camp.cpa.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                   <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                     Configurar
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-800">Regra de Proteção Ativada</h4>
          <p className="text-sm text-yellow-700">A campanha "Teste B" foi pausada automaticamente pelo N8N pois o CPA excedeu €8.00 por 3 horas consecutivas.</p>
        </div>
      </div>
    </div>
  );
}
