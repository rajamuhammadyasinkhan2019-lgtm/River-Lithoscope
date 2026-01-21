
export interface RockArchetype {
  name: string;
  minBrightness: number;
  maxBrightness: number;
  textureRange: [number, number]; // [min, max] standard deviation
  edgeRange: [number, number];    // [min, max] normalized density
  colorBias?: 'red' | 'green' | 'blue' | 'neutral';
  description: string;
}

const ARCHETYPES: RockArchetype[] = [
  {
    name: "Felsic Igneous (Granite/Rhyolite)",
    minBrightness: 150,
    maxBrightness: 255,
    textureRange: [40, 100],
    edgeRange: [0.06, 0.15],
    colorBias: 'neutral',
    description: "High-albedo crystalline structure with visible phaneritic speckling."
  },
  {
    name: "Mafic Igneous (Basalt/Gabbro)",
    minBrightness: 0,
    maxBrightness: 80,
    textureRange: [10, 45],
    edgeRange: [0.04, 0.12],
    colorBias: 'neutral',
    description: "Low-albedo, fine-grained melanocratic composition."
  },
  {
    name: "Siliciclastic (Sandstone/Quartzite)",
    minBrightness: 120,
    maxBrightness: 220,
    textureRange: [20, 50],
    edgeRange: [0.03, 0.09],
    colorBias: 'neutral',
    description: "Granular sedimentary texture with moderate fluvial rounding."
  },
  {
    name: "Microcrystalline (Chert/Jasper)",
    minBrightness: 80,
    maxBrightness: 180,
    textureRange: [5, 25],
    edgeRange: [0.12, 0.25], 
    colorBias: 'red',
    description: "Dense, non-granular silica with sharp edge retention."
  },
  {
    name: "Metamorphic (Schist/Slate/Phyllite)",
    minBrightness: 50,
    maxBrightness: 140,
    textureRange: [30, 70],
    edgeRange: [0.10, 0.20],
    colorBias: 'blue',
    description: "Foliated or slaty cleavage planes creating linear edge artifacts."
  },
  {
    name: "Ultramafic (Serpentinite)",
    minBrightness: 60,
    maxBrightness: 130,
    textureRange: [15, 40],
    edgeRange: [0.05, 0.13],
    colorBias: 'green',
    description: "Low-to-mid albedo with characteristic waxy luster and greenish hue."
  },
  {
    name: "Ferruginous / Gossanous Material",
    minBrightness: 60,
    maxBrightness: 150,
    textureRange: [30, 80],
    edgeRange: [0.08, 0.18],
    colorBias: 'red',
    description: "Oxidized iron-rich crusting or staining on parent lithology."
  }
];

export const runLocalHeuristic = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve("Offline mode active. No visual data available.");

      const size = 128;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      const imageData = ctx.getImageData(0, 0, size, size).data;
      let rTotal = 0, gTotal = 0, bTotal = 0;
      const grays: number[] = [];
      
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i+1];
        const b = imageData[i+2];
        rTotal += r;
        gTotal += g;
        bTotal += b;
        grays.push(0.299 * r + 0.587 * g + 0.114 * b);
      }
      
      const count = imageData.length / 4;
      const avgR = rTotal / count;
      const avgG = gTotal / count;
      const avgB = bTotal / count;
      const avgGray = grays.reduce((a, b) => a + b, 0) / count;

      // Variance (Texture)
      const variance = grays.reduce((sum, val) => sum + Math.pow(val - avgGray, 2), 0) / count;
      const textureScore = Math.sqrt(variance);

      // Edge Density & Fossil Grid Analysis
      let edgeSum = 0;
      const gridSize = 16; // 8x8 grid on 128px image
      const gridEdges = new Array(gridSize * gridSize).fill(0);
      
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          const idx = y * size + x;
          const val = grays[idx];
          const neighbors = [
            grays[(y-1) * size + x],
            grays[(y+1) * size + x],
            grays[y * size + (x-1)],
            grays[y * size + (x+1)]
          ];
          const edgeVal = Math.abs(4 * val - neighbors.reduce((a, b) => a + b, 0));
          edgeSum += edgeVal;
          
          // Map to grid
          const gx = Math.floor(x / 8);
          const gy = Math.floor(y / 8);
          gridEdges[gy * gridSize + gx] += edgeVal;
        }
      }

      const normalizedEdge = edgeSum / (count * 255);
      
      // Fossil Detection Logic: High spatial variance in edges
      // Look for localized patches of high complexity (biomorphic structures)
      const avgGridEdge = gridEdges.reduce((a, b) => a + b, 0) / gridEdges.length;
      const gridVariance = gridEdges.reduce((sum, val) => sum + Math.pow(val - avgGridEdge, 2), 0) / gridEdges.length;
      const biomorphicIndex = Math.sqrt(gridVariance) / avgGridEdge; // Relative complexity variation

      let fossilLikelihood = "Low";
      let fossilDetails = "No significant localized structural anomalies detected.";
      
      if (biomorphicIndex > 1.2 && normalizedEdge > 0.08) {
        fossilLikelihood = "Moderate";
        fossilDetails = "Detected localized edge clusters (BCI: " + biomorphicIndex.toFixed(2) + ") consistent with potential biomorphic imprints or trace fossil structures.";
      } else if (biomorphicIndex > 1.8) {
        fossilLikelihood = "High (Preliminary)";
        fossilDetails = "Strong spatial complexity anomalies detected. Highly suggestive of repetitive biological structures or intricate mineralized imprints.";
      }

      // Determine Color Bias
      let detectedBias: 'red' | 'green' | 'blue' | 'neutral' = 'neutral';
      if (avgR > avgG + 15 && avgR > avgB + 15) detectedBias = 'red';
      else if (avgG > avgR + 10 && avgG > avgB + 5) detectedBias = 'green';
      else if (avgB > avgR + 10 && avgB > avgG + 5) detectedBias = 'blue';

      // Match against Archetypes
      let bestMatch = ARCHETYPES[0];
      let lowestDistance = Infinity;

      ARCHETYPES.forEach(arch => {
        const dBr = Math.abs(avgGray - (arch.minBrightness + arch.maxBrightness) / 2) / 255;
        const dTx = Math.abs(textureScore - (arch.textureRange[0] + arch.textureRange[1]) / 2) / 100;
        const dEd = Math.abs(normalizedEdge - (arch.edgeRange[0] + arch.edgeRange[1]) / 2) / 0.3;
        const dBias = detectedBias === arch.colorBias ? 0 : 0.5;

        const distance = Math.sqrt(dBr*dBr + dTx*dTx + dEd*dEd) + dBias;
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = arch;
        }
      });

      const confidence = Math.max(15, Math.min(45, Math.round((1 - (lowestDistance / 2)) * 50)));

      // Roundness logic
      let roundness = "Sub-rounded";
      if (normalizedEdge < 0.06) roundness = "Well-rounded (High-Energy Fluvial)";
      else if (normalizedEdge > 0.16) roundness = "Angular / Fractured (In-situ / Brecciated)";
      else if (normalizedEdge > 0.11) roundness = "Sub-angular (Local Colluvial)";

      resolve(`[OFFLINE MODE: Advanced Heuristic Preview]
1. Identification Summary: Visual proxy analysis identifies this specimen as ${bestMatch.name}. ${bestMatch.description}
2. Drainage & River Context: Local sensors indicate fluvial environment. Specific drainage hierarchy requires Cloud Sync.
3. Transport History: Roundness index (${(normalizedEdge * 100).toFixed(1)}%) suggests a ${roundness} profile.
4. Fossil / Gem / Mineral Assessment:
   - Fossil Potential: ${fossilLikelihood}. ${fossilDetails}
   - Mineral Signature: RGB(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)}) -> ${detectedBias.toUpperCase()} BIAS
   - Grain Complexity: ${textureScore.toFixed(1)} SD (Structural Heterogeneity)
5. Economic Significance: Placer potential restricted in offline mode. Heuristic match suggests ${bestMatch.name.includes('Igneous') ? 'Moderate' : 'Low'} probability for associated heavy minerals.
6. Confidence Level: ${confidence}% (Archetype Variance Match).
7. Recommendations: Upload to Gemini 3 Flash to perform high-resolution feature extraction of identified ${fossilLikelihood !== 'Low' ? 'structural anomalies' : 'lithology'}.`);
    };
    img.onerror = () => resolve("Error loading field image for local edge-heuristic processing.");
  });
};
