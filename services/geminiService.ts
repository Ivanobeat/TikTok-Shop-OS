
import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult, CreativeGenerationResult } from "../types";
import { db } from "./mockDatabase";

// Prioritiza a variável de ambiente, mas usa a chave fornecida pelo usuário como fallback
const USER_PROVIDED_KEY = 'AIzaSyCJWHZ_87DNVAz374zn0fNKBaW9O_eQZyk';
const apiKey = process.env.API_KEY || USER_PROVIDED_KEY;

const ai = new GoogleGenAI({ apiKey });

// Helper to check for N8N Webhook
const getN8nUrl = () => {
  const settings = db.getSystemSettings();
  return settings.n8nWebhookUrl;
};

export const analyzeProductWithGemini = async (productDescription: string): Promise<AiAnalysisResult> => {
  const n8nUrl = getN8nUrl();
  
  // Se houver N8N configurado, usa-o
  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_product', productDescription })
      });
      if (!response.ok) throw new Error('N8N Error');
      return await response.json();
    } catch (e) {
      console.warn("N8N failed, falling back to local Gemini", e);
    }
  }

  // Fallback Local (Gemini Direct)
  if (!apiKey) {
    return {
      score: 85,
      strengths: ["Alta viralidade visual", "Margem de lucro saudável", "Tendência crescente no Q4"],
      risks: ["Concorrência alta", "Dependência de vídeo de alta qualidade"],
      keywords: ["gadget", "cozinha", "viral", "limpeza"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analisa este produto para dropshipping/TikTok Shop: "${productDescription}". 
      Retorna um JSON estrito.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "0 a 100 baseada em viralidade" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "strengths", "risks", "keywords"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 75,
      strengths: ["Produto visual", "Bom para Q4"],
      risks: ["Saturação média"],
      keywords: ["exemplo", "fallback"]
    };
  }
};

export const generateCreativesWithGemini = async (productName: string, features: string): Promise<CreativeGenerationResult> => {
  const n8nUrl = getN8nUrl();

  // Se houver N8N configurado, usa-o
  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_creative', productName, features })
      });
      if (!response.ok) throw new Error('N8N Error');
      return await response.json();
    } catch (e) {
      console.warn("N8N failed, falling back to local Gemini", e);
    }
  }

  // Fallback Local
  if (!apiKey) {
    return {
      titles: ["Compre agora!", "O melhor do mercado", "Imperdível"],
      descriptions: ["Produto incrível para si.", "Mude a sua vida hoje."],
      scripts: ["[Cena 1] Mostra produto..."]
    };
  }

  const prompt = `
    És um especialista em TikTok Shop. Para o produto "${productName}" com estas características: "${features}".
    Gera:
    1. 3 Títulos curtos e virais (PT-PT).
    2. 3 Descrições persuasivas para anúncio (PT-PT).
    3. 3 Roteiros curtos (15s) para vídeo (Hook, Body, CTA).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            scripts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["titles", "descriptions", "scripts"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as CreativeGenerationResult;
  } catch (error) {
    console.error("Gemini Creative Error:", error);
     return {
      titles: ["Erro na API - Tente Novamente", "Verifique a Cota", "Título Exemplo"],
      descriptions: ["Houve um erro na geração.", "Tente novamente mais tarde."],
      scripts: ["Erro ao gerar script."]
    };
  }
};
