import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, BarChart2, ExternalLink, Plus } from 'lucide-react';
import { Product, AiAnalysisResult } from '../types';
import { analyzeProductWithGemini } from '../services/geminiService';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Corretor de Postura Inteligente',
    category: 'Saúde & Bem-estar',
    viralScore: 0, // To be calculated
    supplierPrice: 4.50,
    targetPrice: 24.99,
    margin: 82,
    status: 'scanning',
    imageUrl: 'https://picsum.photos/id/1/200/200',
    trends: ['#saude', '#postura']
  },
  {
    id: '2',
    name: 'Mini Impressora Térmica Portátil',
    category: 'Gadgets',
    viralScore: 0,
    supplierPrice: 12.00,
    targetPrice: 39.99,
    margin: 70,
    status: 'scanning',
    imageUrl: 'https://picsum.photos/id/180/200/200',
    trends: ['#studyhacks', '#miniprinter']
  },
  {
    id: '3',
    name: 'Escova de Limpeza Elétrica 5-em-1',
    category: 'Casa',
    viralScore: 92,
    supplierPrice: 8.20,
    targetPrice: 29.90,
    margin: 72,
    status: 'approved',
    imageUrl: 'https://picsum.photos/id/225/200/200',
    trends: ['#cleantok', '#cleaninghacks']
  }
];

export const ProductResearch: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isScanning, setIsScanning] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, result: AiAnalysisResult} | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate N8N Webhook latency
    setTimeout(() => {
      setIsScanning(false);
      // In a real app, this would fetch new rows from Airtable
    }, 2000);
  };

  const handleAnalyze = async (product: Product) => {
    setAnalyzingId(product.id);
    try {
      const result = await analyzeProductWithGemini(product.name + " " + product.category);
      setAnalysisResult({ id: product.id, result });
      
      // Update product with new score
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, viralScore: result.score, status: result.score > 70 ? 'approved' : 'rejected' } : p
      ));
    } catch (e) {
      alert("Erro na análise AI. Verifique a API Key.");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pesquisa de Produtos</h2>
          <p className="text-slate-500 text-sm">Automated scraping powered by PhantomBuster & Gemini</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="animate-spin w-4 h-4"/> : <Search className="w-4 h-4"/>}
          {isScanning ? 'A procurar tendências...' : 'Iniciar Scan Viral'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço (Fornecedor/Venda)</th>
                <th className="px-6 py-4">Margem</th>
                <th className="px-6 py-4">Score Viral</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover bg-slate-200" />
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">€{product.supplierPrice.toFixed(2)}</span>
                      <span className="font-semibold text-indigo-600">€{product.targetPrice.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {product.margin}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     {product.viralScore > 0 ? (
                       <div className="flex items-center gap-2">
                         <div className="w-full max-w-[60px] h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div 
                             className={`h-full ${product.viralScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                             style={{width: `${product.viralScore}%`}}
                           ></div>
                         </div>
                         <span className="font-bold">{product.viralScore}</span>
                       </div>
                     ) : (
                       <span className="text-slate-400 italic">Pendente</span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAnalyze(product)}
                        disabled={analyzingId === product.id}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                        title="Analisar com IA"
                      >
                        {analyzingId === product.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <BarChart2 className="w-4 h-4"/>}
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                        <ExternalLink className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {analysisResult && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Análise Gemini 2.5
            </h3>
            <button onClick={() => setAnalysisResult(null)} className="text-indigo-400 hover:text-indigo-700">
              <XCircle className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Pontos Fortes</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {analysisResult.result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><XCircle className="w-4 h-4"/> Riscos</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {analysisResult.result.risks.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-indigo-600 mb-2 flex items-center gap-2"><Plus className="w-4 h-4"/> Palavras-chave</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.result.keywords.map((k, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">#{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
