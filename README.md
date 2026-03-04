# ProLight Studio 2026

Suite web para diagnóstico técnico fotográfico y generación de flujo profesional de edición asistida por IA.

## Herramientas profesionales incluidas

- **Exposure Score** en tiempo real (ISO, obturación, apertura).
- **Dynamic Range Score** para estimar pérdida por ISO/ruido.
- **Thermal Guard** para validar estabilidad de temperatura de color.
- **Clipping Risk** en altas luces y sombras.
- **Motor de recomendaciones** automáticas con reglas de captura y post.
- **Workflow profesional de 5 pasos** listo para ejecutar en Lightroom/Capture One.
- **Prompt técnico para IA** con contexto cuantificado.

## Ejecutar localmente

```bash
npm install
npm run dev
```

La app queda disponible en:

- `http://localhost:3000`

## Build de producción

```bash
npm run build
```

## Estructura

- `src/App.tsx`: interfaz + panel de herramientas.
- `src/lib/photoTools.ts`: núcleo de análisis profesional.
- `src/components/MetricCard.tsx`: tarjetas de métricas.

## Siguiente nivel recomendado

1. Subida de imagen real con lectura EXIF.
2. Histograma real por canal (RGB) en canvas.
3. Persistencia de proyectos/ajustes.
4. Integración backend IA para ejecutar el prompt y devolver ajustes estructurados.
