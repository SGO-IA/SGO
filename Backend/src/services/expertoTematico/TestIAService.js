// Protocolo SGO-Layered: Service
import { anthropic, anthropicConfig } from '../../config/claude.js';
import { TestIAModel } from '../../models/expertoTematico/testIAModel.js';
import { generarPromptEvaluacionJSON } from '../../prompts/expertoTematico/testia.js';

export const TestIAService = {
    generarTestConClaude: async (contextoIA, instruccion, duracion) => {
        
        const promptCompleto = generarPromptEvaluacionJSON(contextoIA, instruccion, duracion);

        try {
            const response = await anthropic.messages.create({
                model: anthropicConfig.model,
                max_tokens: anthropicConfig.maxTokens,
                system: promptCompleto, 
                messages: [
                    { 
                        role: "user", 
                        content: "Procede a generar la evaluación en formato JSON estrictamente como se te indicó en las reglas del sistema. Tu respuesta DEBE comenzar con '{' y terminar con '}'. No incluyas saludos ni bloques markdown." 
                    }
                ]
            });

            // Obtenemos la respuesta cruda de Claude
            const rawOutput = response.content[0].text;
            
            // EXTRACCIÓN ROBUSTA: Buscamos la primera llave de apertura y la última de cierre
            const firstBrace = rawOutput.indexOf('{');
            const lastBrace = rawOutput.lastIndexOf('}');

            if (firstBrace === -1 || lastBrace === -1) {
                console.error("Texto devuelto por Claude:", rawOutput);
                throw new Error("Claude no devolvió una estructura JSON reconocible.");
            }

            // Recortamos todo lo que esté fuera de las llaves del JSON
            const cleanJsonString = rawOutput.substring(firstBrace, lastBrace + 1);
            
            // Parseamos a un objeto de JavaScript
            const dataTest = JSON.parse(cleanJsonString);

            return dataTest;

        } catch (error) {
            console.error("❌ Error en Anthropic Service:", error);
            throw new Error('No se pudo generar la evaluación estructurada con IA.');
        }
    },

    procesarGuardadoTest: async (seccionId, payloadTest) => {
        const { nombre_test, ponderacion, preguntas } = payloadTest;
        return await TestIAModel.guardarTest(seccionId, nombre_test, ponderacion, preguntas);
    }
};