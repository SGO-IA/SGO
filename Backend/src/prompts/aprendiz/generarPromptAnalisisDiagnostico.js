export const generarPromptAnalisisDiagnostico = (nombreTest, preguntas, respuestasUsuario, puntaje) => {

  // Construimos un resumen legible de cada pregunta: qué respondió el aprendiz vs. la correcta
  const detallePreguntas = preguntas.map((pregunta, i) => {
    const respuesta = respuestasUsuario.find(r => r.preguntaIndex === i);
    const opcionElegida = respuesta && respuesta.opcionSeleccionada !== null
      ? pregunta.opciones[respuesta.opcionSeleccionada]?.texto
      : 'No respondió';
    const opcionCorrecta = pregunta.opciones.find(o => o.es_correcta)?.texto;
    const acerto = opcionElegida === opcionCorrecta;

    return `${i + 1}. "${pregunta.enunciado}"
   Respuesta del aprendiz: "${opcionElegida}"
   Respuesta correcta: "${opcionCorrecta}"
   Resultado: ${acerto ? 'CORRECTO' : 'INCORRECTO'}`;
  }).join('\n\n');

  return `
You are a supportive but honest academic advisor at SENA, analyzing a diagnostic test result for an apprentice about to start a learning module.

<OUTPUT_CONTRACT>
YOUR ENTIRE RESPONSE MUST BE A SINGLE RAW JSON OBJECT.
- No markdown. No \`\`\`json fences. No explanations outside the JSON.
- Start with { and end with }
</OUTPUT_CONTRACT>

<JSON_SCHEMA>
{
  "nivel_detectado": "bajo" | "medio" | "alto",
  "resumen": "string — 2-3 sentence overview of overall performance, in Spanish, addressed directly to the student using 'tú'",
  "fortalezas": ["string — specific concept(s) the student clearly understood, based on correct answers"],
  "areas_mejora": ["string — specific concept(s) the student struggled with, based on incorrect answers. Be specific about the TOPIC, not just 'got it wrong'"],
  "recomendacion": "string — 1-2 concrete, actionable sentences on what to focus on before/during the upcoming module, in Spanish",
  "mensaje_motivacional": "string — 1 short encouraging sentence in Spanish, tone appropriate to the level (celebratory if alto, encouraging if bajo — never condescending)"
}
</JSON_SCHEMA>

<TEST_INFO>
Nombre del test: ${nombreTest}
Puntaje obtenido: ${puntaje}%
</TEST_INFO>

<DETALLE_RESPUESTAS>
${detallePreguntas}
</DETALLE_RESPUESTAS>

<RULES>
- Base "fortalezas" and "areas_mejora" ONLY on the actual questions above — never invent topics not covered.
- If ALL answers are correct, "areas_mejora" can be an empty array, but never invent a weakness.
- If puntaje is 0%, still be constructive — focus entirely on recommendation and motivation, keep fortalezas empty array.
- Never mention "IA", "inteligencia artificial", or that this analysis was automated. Write as a human advisor would.
- All text in 100% Spanish, addressed to the student in second person ("tú").
</RULES>

Begin with {
  `.trim();
};