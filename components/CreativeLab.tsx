import React, { useState } from 'react';
import { Wand2, Video, Type, Copy, Check, PlayCircle } from 'lucide-react';
import { generateCreativesWithGemini } from '../services/geminiService';
import { CreativeGenerationResult } from '../types';

export const CreativeLab: React.FC = () => {
  const [productName, setProductName] = useState('Escova de Limpeza 5-em-1');
  const [features, setFeatures] = useState('Recarregável, 3 velocidades, 5 cabeças diferentes, à prova de água');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CreativeGenerationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<{type: string, index: number} | null>(null);

  const handleGenerate = async () => {
    if (!productName || !features) return;
    setIsGenerating(true);
    try {
      const data = await generateCreativesWithGemini(productName, features);
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar criativos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ type, index });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600"/> Gerador de Criativos
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
              <input 
                type="text" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: Corretor de Postura"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Características / Benefícios</label>
              <textarea 
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-32 resize-none"
                placeholder="Ex: Alivia dores nas costas, invisível sob a roupa..."
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isGenerating ? <Wand2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
              {isGenerating ? 'A Gerar Magia...' : 'Gerar Scripts & Copy'}
            </button>
            <p className="text-xs text-slate-400 text-center">Powered by Gemini 2.5 Flash & N8N</p>
          </div>
        </div>

        {/* Video Preview Placeholder */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md aspect-[9/16] relative group">
           <img 
             src="https://picsum.photos/400/700?grayscale" 
             className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity" 
             alt="Preview"
            />
           <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
             <PlayCircle className="w-16 h-16 mb-4 opacity-80"/>
             <span className="text-sm font-medium tracking-wide">PREVISÃO DE VÍDEO (N8N)</span>
             <span className="text-xs text-slate-300 mt-2">A aguardar script...</span>
           </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-6">
        {!results && !isGenerating && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-12">
            <Wand2 className="w-12 h-12 mb-4 text-slate-300"/>
            <p>Preenche os dados e clica em "Gerar" para criar conteúdo viral.</p>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
            <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
            <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
          </div>
        )}

        {results && (
          <div className="space-y-6 animate-fade-in">
            {/* Titles */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-pink-500"/> Títulos Virais (TikTok)
              </h3>
              <div className="space-y-2">
                {results.titles.map((title, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors group">
                    <span className="text-slate-700 font-medium">{title}</span>
                    <button 
                      onClick={() => copyToClipboard(title, 'title', idx)}
                      className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex?.type === 'title' && copiedIndex.index === idx ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-500"/> Descrições (Ads)
              </h3>
              <div className="grid gap-4">
                {results.descriptions.map((desc, idx) => (
                  <div key={idx} className="relative p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all group">
                    <p className="text-sm text-slate-600 pr-6">{desc}</p>
                    <button 
                      onClick={() => copyToClipboard(desc, 'desc', idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex?.type === 'desc' && copiedIndex.index === idx ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

             {/* Scripts */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-500"/> Roteiros de Vídeo (AI Voice Ready)
              </h3>
              <div className="space-y-6">
                {results.scripts.map((script, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Opção {idx + 1}</span>
                      <button 
                        onClick={() => copyToClipboard(script, 'script', idx)}
                        className="text-slate-400 hover:text-purple-600"
                      >
                         {copiedIndex?.type === 'script' && copiedIndex.index === idx ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                      {script}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
