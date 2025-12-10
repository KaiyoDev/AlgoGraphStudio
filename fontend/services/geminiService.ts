import { GoogleGenAI, Type } from "@google/genai";
import { GraphData } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert graph theory algorithm assistant. 
Your job is to generate graph data (nodes and edges) based on user requests, or explain graph algorithms.
When asked to generate a graph, return purely JSON compatible with the specified schema.
The coordinate system is roughly 800x600. Keep nodes somewhat spaced out.
`;

export const generateGraphWithGemini = async (prompt: string): Promise<GraphData | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY not found in environment");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a graph for: ${prompt}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                },
                required: ["id", "x", "y", "label"],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  weight: { type: Type.NUMBER },
                  isDirected: { type: Type.BOOLEAN },
                },
                required: ["id", "source", "target", "weight"],
              },
            },
            isDirected: { type: Type.BOOLEAN },
          },
          required: ["nodes", "edges", "isDirected"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GraphData;
    }
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};