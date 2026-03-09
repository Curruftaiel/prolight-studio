import {useMemo, useState} from 'react';
import {MetricCard} from './components/MetricCard';
import {analyzePhoto, generatePrompt, type AnalysisInput} from './lib/photoTools';

const initialInput: AnalysisInput = {
  iso: 800,
  shutterSpeed: 1 / 125,
  aperture: 4,
  colorTemperature: 5600,
  noiseLevel: 35,
  highlightsClipping: 12,
  shadowsClipping: 18,
};

type InputKey = keyof AnalysisInput;

export function App() {
  const [input, setInput] = useState<AnalysisInput>(initialInput);
  const result = useMemo(() => analyzePhoto(input), [input]);
  const prompt = useMemo(() => generatePrompt(input, result), [input, result]);

  const setNumericValue = (key: InputKey, raw: string) => {
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setInput((prev) => ({...prev, [key]: value}));
  };

  const thermalTone =
    result.thermalStatus === 'ok' ? 'good' : result.thermalStatus === 'warning' ? 'warn' : 'critical';

  const clippingTone = result.clippingRisk === 'high' ? 'critical' : result.clippingRisk === 'medium' ? 'warn' : 'good';

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-slate-100 md:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">ProLight Studio 2026</p>
        <h1 className="text-3xl font-bold md:text-4xl">Suite profesional de diagnóstico fotográfico</h1>
        <p className="max-w-3xl text-slate-300">
          Corrección de exposición, control térmico, riesgo de clipping y flujo de edición profesional listo para usar.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Exposure score" value={`${result.exposureScore}/100`} tone={result.exposureScore > 75 ? 'good' : 'warn'} />
        <MetricCard label="Dynamic range" value={`${result.dynamicRangeScore}/100`} tone={result.dynamicRangeScore > 65 ? 'good' : 'warn'} />
        <MetricCard label="Thermal guard" value={result.thermalStatus.toUpperCase()} tone={thermalTone} />
        <MetricCard label="Clipping risk" value={result.clippingRisk.toUpperCase()} tone={clippingTone} />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h2 className="text-xl font-semibold">Controles de captura</h2>
          <SliderField label="ISO" value={input.iso} min={100} max={6400} step={100} onChange={(value) => setNumericValue('iso', value)} />
          <SliderField
            label="Velocidad (segundos)"
            value={input.shutterSpeed}
            min={0.001}
            max={0.2}
            step={0.001}
            onChange={(value) => setNumericValue('shutterSpeed', value)}
          />
          <SliderField label="Apertura (f)" value={input.aperture} min={1.4} max={16} step={0.1} onChange={(value) => setNumericValue('aperture', value)} />
          <SliderField
            label="Temperatura (K)"
            value={input.colorTemperature}
            min={2000}
            max={8500}
            step={50}
            onChange={(value) => setNumericValue('colorTemperature', value)}
          />
          <SliderField
            label="Ruido estimado"
            value={input.noiseLevel}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setNumericValue('noiseLevel', value)}
          />
          <SliderField
            label="Clipping altas luces %"
            value={input.highlightsClipping}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setNumericValue('highlightsClipping', value)}
          />
          <SliderField
            label="Clipping sombras %"
            value={input.shadowsClipping}
            min={0}
            max={100}
            step={1}
            onChange={(value) => setNumericValue('shadowsClipping', value)}
          />
        </form>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-xl font-semibold">Recomendaciones automáticas</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
              {result.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-xl font-semibold">Workflow profesional (5 pasos)</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-200">
              {result.workflow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
            <h2 className="text-xl font-semibold">Prompt listo para IA</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{prompt}</p>
          </article>
        </aside>
      </section>
    </main>
  );
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
};

function SliderField({label, value, min, max, step, onChange}: SliderFieldProps) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{Number.isInteger(value) ? value : value.toFixed(3)}</span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-500"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
