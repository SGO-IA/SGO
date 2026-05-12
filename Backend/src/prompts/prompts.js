export const IA_PROMPTS = {
    GENERAR_TEST: {
        system: "You are a high-level technical assessment generator. Your sole source of truth is the provided 'Curricular Structure'. You must rotate the evaluated topics to ensure every test is unique. You must respond in Spanish, but your output must be strictly valid JSON.",
        
        user: (estructura, config) => {
            const datosCurriculares = estructura.estructura;
            
            // Convertimos el array de preguntas previas en un texto para el prompt
            const historialExclusiones = config.excluded_questions && config.excluded_questions.length > 0 
                ? config.excluded_questions.join('\n- ') 
                : 'None';

            return `
            CURRICULAR STRUCTURE (REAL DATA):
            ${JSON.stringify(datosCurriculares)}

            ❌ STRICT EXCLUSION RULE (DO NOT REPEAT THESE QUESTIONS):
            The following questions (or very similar ones) have already been asked. 
            YOU ARE FORBIDDEN from generating them again:
            - ${historialExclusiones}

            VARIABILITY INSTRUCTIONS:
            1. RANDOMNESS RULE: Do not focus only on the first topics. Randomly select from technical knowledge points (e.g., W3C, JS Frameworks, Testing Tools, Coding Standards, NoSQL, etc.).
            2. ROTATION: For a ${config.cantidad_preguntas}-question test, each question MUST belong to a different sub-topic from the curricular structure. Do not repeat topics if others are available.
            3. DIFFICULTY: The level is ${config.dificultad}. Adjust the technical complexity of the distractors accordingly.
            4. LANGUAGE: The 'enunciado', 'opciones', and 'justificacion' MUST BE IN SPANISH.

            TECHNICAL RULES:
            - Strictly forbidden to mention SENA, RAPs, or pedagogical methodology. Evaluate pure technical knowledge.
            - Incorrect options must be 'plausible distractors' (technically related but incorrect).
            - Avoid repetitive questions.

            ADDITIONAL CONTEXT: ${config.instrucciones_adicionales || 'None'}

            OBLIGATORY JSON SCHEMA:
            {
              "nombre_test": "${config.nombre_test}",
              "descripcion": "${config.descripcion}",
              "preguntas": [
                {
                  "enunciado": "...",
                  "opciones": [
                    { "texto": "...", "es_correcta": false },
                    { "texto": "...", "es_correcta": true },
                    { "texto": "...", "es_correcta": false },
                    { "texto": "...", "es_correcta": false }
                  ],
                }
              ]
            }
            `;
        }
    }
};