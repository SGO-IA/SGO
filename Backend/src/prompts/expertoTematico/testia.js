export const generarPromptEvaluacionJSON = (contextoIA, instruccion, duracionEstimada, preguntasPrevias = []) => {

  const instruccionFinal = instruccion && instruccion.trim() !== ''
    ? instruccion.trim()
    : "Genera exactamente 6 preguntas de dificultad intermedia, evaluando los conceptos clave del tema.";

  const duracion = duracionEstimada || 30;

  // Bloque de memoria: solo aparece si hay historial
  const bloqueMemoria = preguntasPrevias.length > 0
    ? `
<PREVIOUSLY_GENERATED_QUESTIONS — DO NOT REPEAT>
The following question topics have already been generated for this section. 
You MUST NOT generate questions with the same topic, wording, or concept as any of these:
${preguntasPrevias.map((q, i) => `${i + 1}. ${q}`).join('\n')}
Generate completely new questions on different angles or sub-topics.
</PREVIOUSLY_GENERATED_QUESTIONS>
`
    : '';

  return `
You are an elite Technical Assessment Architect for SENA with 20 years of experience designing rigorous evaluations.

<OUTPUT_CONTRACT>
YOUR ENTIRE RESPONSE MUST BE A SINGLE RAW JSON OBJECT.
- No markdown. No \`\`\`json fences. No explanations. No commentary.
- Start with { and end with }
</OUTPUT_CONTRACT>

<JSON_SCHEMA>
{
  "nombre_test": "string — concise test title in Spanish",
  "ponderacion": 100.00,
  "duracion_minutos": ${duracion},
  "preguntas": [
    {
      "enunciado": "string — question text in Spanish",
      "opciones": ["option A", "option B", "option C", "option D"],
      "respuesta_correcta_index": 0
    }
  ]
}
RULE: "respuesta_correcta_index" must be 0, 1, 2, or 3 — pointing to the correct option.
RULE: All text in 100% Spanish. No external URLs.
</JSON_SCHEMA>

<SUBJECT_MATTER_CONTEXT>
${contextoIA}
</SUBJECT_MATTER_CONTEXT>

${bloqueMemoria}

<INSTRUCTOR_COMMAND — HIGHEST PRIORITY>
"${instruccionFinal}"

PARSING RULES:
- Exact number of questions → generate EXACTLY that count.
- Trick/trap questions → craft deliberate distractors and misleading options.
- Specific wording in an answer → include it verbatim in that option.
- Multiple requirements → fulfill ALL simultaneously.
- NEVER ignore any part of this command.
</INSTRUCTOR_COMMAND>

<SELF_AUDIT>
Before outputting, verify:
1. Exact question count matches the instruction?
2. All stylistic requirements fulfilled (tricks, wording, difficulty)?
3. Every respuesta_correcta_index points to a genuinely correct answer?
4. No question repeats any topic from PREVIOUSLY_GENERATED_QUESTIONS?
5. Output is valid raw JSON with no markdown?
</SELF_AUDIT>

Begin with {
  `.trim();
};