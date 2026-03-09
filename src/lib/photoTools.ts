export type AnalysisInput = {
  iso: number;
  shutterSpeed: number;
  aperture: number;
  colorTemperature: number;
  noiseLevel: number;
  highlightsClipping: number;
  shadowsClipping: number;
};

export type ThermalStatus = 'ok' | 'warning' | 'critical';

export type AnalysisResult = {
  exposureScore: number;
  thermalStatus: ThermalStatus;
  dynamicRangeScore: number;
  clippingRisk: 'low' | 'medium' | 'high';
  whiteBalanceOffset: number;
  suggestions: string[];
  workflow: string[];
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function calculateExposureScore({iso, shutterSpeed, aperture}: AnalysisInput): number {
  const isoPenalty = clamp((iso - 100) / 3200, 0, 1);
  const shutterBonus = clamp((1 / shutterSpeed) / 250, 0, 1);
  const apertureBonus = clamp(2.8 / aperture, 0, 1);

  const score = 100 * (0.4 * (1 - isoPenalty) + 0.3 * shutterBonus + 0.3 * apertureBonus);
  return Math.round(clamp(score, 0, 100));
}

export function calculateDynamicRangeScore({iso, noiseLevel}: AnalysisInput): number {
  const isoLoss = clamp((iso - 100) / 6300, 0, 1);
  const noiseLoss = clamp(noiseLevel / 100, 0, 1);
  return Math.round(100 * (1 - 0.6 * isoLoss - 0.4 * noiseLoss));
}

export function evaluateThermalGuard(colorTemperature: number): ThermalStatus {
  if (colorTemperature < 2800 || colorTemperature > 7600) {
    return 'critical';
  }

  if (colorTemperature < 3200 || colorTemperature > 7000) {
    return 'warning';
  }

  return 'ok';
}

export function detectClippingRisk(highlightsClipping: number, shadowsClipping: number): AnalysisResult['clippingRisk'] {
  const peak = Math.max(highlightsClipping, shadowsClipping);
  if (peak >= 60) return 'high';
  if (peak >= 30) return 'medium';
  return 'low';
}

export function calculateWhiteBalanceOffset(colorTemperature: number): number {
  return Math.round((5600 - colorTemperature) / 100);
}

export function buildSuggestions(input: AnalysisInput, result: Pick<AnalysisResult, 'exposureScore' | 'dynamicRangeScore' | 'thermalStatus' | 'clippingRisk'>): string[] {
  const suggestions: string[] = [];

  if (input.iso > 1600) {
    suggestions.push('Reducir ISO o añadir luz para bajar ruido digital.');
  }

  if (input.shutterSpeed < 1 / 120) {
    suggestions.push('Usar trípode o aumentar velocidad de obturación para evitar trepidación.');
  }

  if (input.aperture > 5.6) {
    suggestions.push('Abrir diafragma para mejorar captación de luz en escena oscura.');
  }

  if (result.thermalStatus !== 'ok') {
    suggestions.push('Corregir balance de blancos con referencia neutra y ajuste fino en Kelvin.');
  }

  if (result.dynamicRangeScore < 60) {
    suggestions.push('Usar recuperación selectiva de altas luces/sombras para conservar rango dinámico.');
  }

  if (result.clippingRisk === 'high') {
    suggestions.push('Aplicar bracketing o curva logarítmica para minimizar clipping severo.');
  }

  if (input.noiseLevel > 70) {
    suggestions.push('Aplicar reducción de ruido por IA con perfil suave para preservar detalle.');
  }

  if (result.exposureScore >= 80 && suggestions.length === 0) {
    suggestions.push('Parámetros sólidos: solo ajustes finos de color y contraste recomendados.');
  }

  return suggestions;
}

export function buildWorkflow(input: AnalysisInput, result: AnalysisResult): string[] {
  const wbStep =
    result.whiteBalanceOffset === 0
      ? 'Balance de blancos estable: mantener temperatura actual.'
      : `Ajustar WB ${Math.abs(result.whiteBalanceOffset)} clicks hacia ${result.whiteBalanceOffset > 0 ? 'frío' : 'cálido'}.`;

  return [
    `1) Exposición base: llevar histograma al centro sin sobrepasar highlights (${input.highlightsClipping}%).`,
    `2) Recuperación tonal: reducir clipping en sombras (${input.shadowsClipping}%) y altas luces con curva en S suave.`,
    `3) ${wbStep}`,
    `4) Detalle y limpieza: ruido ${input.noiseLevel}/100, aplicar denoise por luminancia con máscara de detalle.`,
    `5) Export técnico: contraste micro + nitidez de salida según destino (web o impresión).`,
  ];
}

export function analyzePhoto(input: AnalysisInput): AnalysisResult {
  const exposureScore = calculateExposureScore(input);
  const thermalStatus = evaluateThermalGuard(input.colorTemperature);
  const dynamicRangeScore = calculateDynamicRangeScore(input);
  const clippingRisk = detectClippingRisk(input.highlightsClipping, input.shadowsClipping);
  const whiteBalanceOffset = calculateWhiteBalanceOffset(input.colorTemperature);

  const partial = {exposureScore, dynamicRangeScore, thermalStatus, clippingRisk};
  const suggestions = buildSuggestions(input, partial);

  const draft: AnalysisResult = {
    exposureScore,
    thermalStatus,
    dynamicRangeScore,
    clippingRisk,
    whiteBalanceOffset,
    suggestions,
    workflow: [],
  };

  draft.workflow = buildWorkflow(input, draft);
  return draft;
}

export function generatePrompt(input: AnalysisInput, result: AnalysisResult): string {
  return [
    'Eres un retocador senior de fotografía comercial.',
    `Entrada técnica: ISO ${input.iso}, ${input.shutterSpeed.toFixed(4)}s, f/${input.aperture}, ${input.colorTemperature}K.`,
    `Scores -> exposición ${result.exposureScore}/100, rango dinámico ${result.dynamicRangeScore}/100, clipping ${result.clippingRisk}.`,
    `Ruido ${input.noiseLevel}/100, clipping HL ${input.highlightsClipping}% y SH ${input.shadowsClipping}%.`,
    `Entrega: receta profesional en 5 pasos + valores sugeridos (exposure, contrast, highlights, shadows, WB, texture, sharpness).`,
  ].join(' ');
}
