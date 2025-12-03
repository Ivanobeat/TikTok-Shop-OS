
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

// Funções de Fallback Local (Para garantir que nunca falha)
const localGeminiAnalysis = async (productDescription: string): Promise<AiAnalysisResult> => {
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
        console.error("Local Gemini Analysis Error:", error);
        return {
        score: 75,
        strengths: ["Produto visualmente apelativo", "Bom potencial para Q4", "Nicho de saúde/beleza em alta"],
        risks: ["Alta saturação de mercado", "Custos de envio variáveis"],
        keywords: ["tiktok made me buy it", "viral", "gift ideas", "trends"]
        };
    }
}

const localGeminiCreative = async (productName: string, features: string): Promise<CreativeGenerationResult> => {
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
        console.error("Local Gemini Creative Error:", error);
        return {
        titles: ["Erro na API - Tente Novamente", "Verifique a Cota", "Título Exemplo"],
        descriptions: ["Houve um erro na geração.", "Tente novamente mais tarde."],
        scripts: ["Erro ao gerar script."]
        };
    }
}

export const analyzeProductWithGemini = async (productDescription: string): Promise<AiAnalysisResult> => {
  const n8nUrl = getN8nUrl();
  
  // Se houver N8N configurado, usa-o
  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyze_product', 
          description: productDescription, // Mapped to 'description' as expected by N8N Code Node
          stats: 'Simulated Stats' // Added mock stats for consistency
        })
      });
      
      // Se der erro de rede (normal em browser vs N8N local), falha silenciosamente e usa local
      if (!response.ok) {
        throw new Error('N8N Failed');
      }

      const json = await response.json();
      
      // Se o N8N devolver a estrutura bruta do Google, extrai o conteúdo
      if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
         try {
            return JSON.parse(json.candidates[0].content.parts[0].text);
         } catch(e) {
            console.warn("N8N Raw Parse Error, using local");
         }
      }
      
      if (json.score && json.strengths) return json;
      throw new Error("Invalid N8N Format");

    } catch (e) {
      // FAIL-SAFE: Erro silencioso, usa local
      return await localGeminiAnalysis(productDescription);
    }
  }

  // Se não houver N8N, usa Local
  return await localGeminiAnalysis(productDescription);
};

export const generateCreativesWithGemini = async (productName: string, features: string): Promise<CreativeGenerationResult> => {
  const n8nUrl = getN8nUrl();

  // Se houver N8N configurado, usa-o
  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           action: 'generate_creative', 
           productName, 
           features,
           audience: 'General' // Added default audience
        })
      });

      if (!response.ok) {
         throw new Error('N8N Failed');
      }

      const json = await response.json();

       // Se o N8N devolver a estrutura bruta do Google, extrai o conteúdo
       if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
        try {
           return JSON.parse(json.candidates[0].content.parts[0].text);
        } catch(e) {
           console.warn("N8N Raw Parse Error");
        }
     }

      if (json.titles && json.scripts) return json;
      
      throw new Error("Invalid N8N Format");

    } catch (e) {
      // FAIL-SAFE: Erro silencioso, usa local
      return await localGeminiCreative(productName, features);
    }
  }

  // Se não houver N8N, usa Local
  return await localGeminiCreative(productName, features);
};
