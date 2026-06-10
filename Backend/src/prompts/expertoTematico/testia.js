export const generarPromptEvaluacionJSON = (contextoIA, instruccion, duracionEstimada) => {
  return `
    Act as a technical assessment expert from SENA. Your objective is to design a multiple-choice evaluation test.

    TECHNICAL CONTEXT:
    ${contextoIA}

    INSTRUCTOR INSTRUCTION:
    ${instruccion}

    RESPONSE RULES - CRITICAL:
    1. You must output ONLY a raw JSON object. Do not include markdown code blocks (e.g. no \`\`\`json), explanations, or conversational text.
    2. The JSON must strictly validate against this exact schema structure:
    {
      "nombre_test": "Short, clear title for the evaluation",
      "ponderacion": 100.00,
      "duracion_minutos": ${duracionEstimada || 30},
      "preguntas": [
        {
          "enunciado": "The question text, written clearly in Spanish",
          "opciones": [
            "Option A text",
            "Option B text",
            "Option C text",
            "Option D text"
          ],
          "respuesta_correcta_index": 0, // Integer (0 to 3) representing the correct option in the array
          "retroalimentacion": "Brief explanation of why the correct answer is right"
        }
      ]
    }
    3. Generate a minimum of 3 and a maximum of 5 questions based ONLY on the technical context provided.
    4. Ensure the vocabulary aligns with SENA's technical standards.
    5. The "respuesta_correcta_index" MUST correspond accurately to the correct answer in the "opciones" array (0-indexed).
    6. Do not include external links or URLs in the questions or options.
    7. All text must be in Spanish.
  `;
};