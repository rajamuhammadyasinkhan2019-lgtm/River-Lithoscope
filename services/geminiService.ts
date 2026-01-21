
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppMode } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

const SYSTEM_PROMPT = `You are RIVERLITHOSCOPE, a high-confidence, multimodal Geological AI Assistant and Advisor, specialized in riverine, fluvial, and drainage-controlled geology.
You analyze field photographs, riverbed images, boulders, gravels, hand specimens, fossils, gemstones, polished samples, thin-section photomicrographs, satellite imagery, and maps to identify, classify, and interpret geological materials found along rivers and drainage systems.
Your reasoning must be visual-first, context-aware, and source-to-sink focused.

Output Structure (Strict):
1. Identification Summary: High-level overview.
2. Drainage & River Context: Pattern, position (Upper/Middle/Lower), energy regime, sediment characteristics.
3. Transport & Weathering History: Grain size, sorting, roundness, transport indicators.
4. Fossil / Gem / Mineral Assessment: Detailed IDs of fossils or minerals.
5. Economic Significance: Placer Probability Score (%) and potential classification (Low/Moderate/High).
6. Confidence Level (%): Your estimated accuracy.
7. Exploration Recommendations: Upstream guidance, sampling zones.

Mandatory Footer:
Expert App Developer: Muhammad Yasin Khan
Powered By: Google Gemini 3 Flash Preview`;

export const analyzeGeology = async (
  images: { base64: string; mimeType: string }[],
  mode: AppMode,
  sensitivity: number,
  manualLog?: { textureNotes?: string; mineralObservations?: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modeInstructions = {
    [AppMode.TEACHING]: "Use simple explanations, educational diagrams descriptions, and focus on foundational learning.",
    [AppMode.PROFESSIONAL]: "Use advanced technical terminology, discuss tectonics, provenance, and detailed lithology.",
    [AppMode.EXPLORATION]: "Focus heavily on economic geology, placer probability, and specific mining/sampling targets."
  };

  const sensitivityGuidance = sensitivity < 30 
    ? "Be SPECULATIVE: Flag even subtle morphological patterns or ambiguous mineral traces. Prioritize identifying potential features over certainty."
    : sensitivity > 70 
      ? "Be CONSERVATIVE: Only report features that are clearly identifiable with high visual evidence. Avoid speculation on ambiguous textures."
      : "Be BALANCED: Provide standard professional interpretation of visual evidence with appropriate caveats.";

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType
    }
  }));

  const logContext = manualLog ? `
  FIELD OBSERVATIONS:
  - Texture: ${manualLog.textureNotes || "N/A"}
  - Mineralogy: ${manualLog.mineralObservations || "N/A"}` : "";

  const textPart = {
    text: `Perform a geological analysis of the attached riverine images in ${mode}. 
    ANALYSIS THRESHOLD (${sensitivity}%): ${sensitivityGuidance}
    ${modeInstructions[mode]}
    ${logContext}
    Analyze the drainage context, identify rocks/minerals/fossils, and estimate placer potential.
    Strictly follow the output structure provided in your system instructions.`
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [...imageParts, textPart] },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: sensitivity < 40 ? 0.7 : 0.3, // Higher temp for speculative mode
        topP: 0.8,
        topK: 40
      },
    });

    return response.text || "Analysis failed to generate text content.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to communicate with the geological AI engine.");
  }
};
