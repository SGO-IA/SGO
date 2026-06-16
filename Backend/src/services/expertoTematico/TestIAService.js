// Protocolo SGO-Layered: Service
import { anthropic, anthropicConfig } from '../../config/claude.js';
import { TestIAModel } from '../../models/expertoTematico/testIAModel.js';
import { generarPromptEvaluacionJSON } from '../../prompts/expertoTematico/testia.js';
import redis from '../../config/redis.js';

const REDIS_TTL = 60 * 60 * 24; // 24 horas

export const TestIAService = {
    generarTestConClaude: async (contextoIA, instruccion, duracion, seccionId) => {

        // ─── 1. RECUPERAR HISTORIAL (memoria, no caché) ──────────────────────
        // Redis solo guarda LOS ENUNCIADOS ANTERIORES para dárselos a Claude
        // como contexto. NO guarda el test completo para devolverlo al usuario.
        let preguntasPrevias = [];
        if (seccionId) {
            try {
                const historialKey = `historial_preguntas:${seccionId}`;
                const historialRaw = await redis.get(historialKey);
                if (historialRaw) {
                    preguntasPrevias = JSON.parse(historialRaw);
                    console.log(`📋 Redis: ${preguntasPrevias.length} preguntas previas cargadas como contexto para Claude`);
                }
            } catch (e) {
                console.warn('⚠️ No se pudo recuperar historial:', e.message);
            }
        } else {
            console.warn('⚠️ seccionId no definido, el historial no se podrá asociar');
        }

        // ─── 2. CONSTRUIR PROMPT CON MEMORIA ────────────────────────────────
        // Las preguntasPrevias van dentro del prompt para que Claude las evite
        const promptCompleto = generarPromptEvaluacionJSON(
            contextoIA,
            instruccion,
            duracion,
            preguntasPrevias
        );

        // ─── 3. LLAMAR A CLAUDE (siempre, sin caché) ────────────────────────
        try {
            const response = await anthropic.messages.create({
                model: anthropicConfig.model,
                max_tokens: anthropicConfig.maxTokens,
                system: promptCompleto,
                messages: [
                    {
                        role: "user",
                        content: "Procede a generar la evaluación en formato JSON estrictamente como se te indicó. Tu respuesta DEBE comenzar con '{' y terminar con '}'. No incluyas saludos ni bloques markdown."
                    }
                ]
            });

            const rawOutput = response.content[0].text;

            const firstBrace = rawOutput.indexOf('{');
            const lastBrace = rawOutput.lastIndexOf('}');

            if (firstBrace === -1 || lastBrace === -1) {
                console.error("Texto devuelto por Claude:", rawOutput);
                throw new Error("Claude no devolvió una estructura JSON reconocible.");
            }

            const cleanJsonString = rawOutput.substring(firstBrace, lastBrace + 1);
            const dataTest = JSON.parse(cleanJsonString);

            // ─── 4. ACTUALIZAR HISTORIAL EN REDIS ───────────────────────────
            // Guardamos solo los enunciados nuevos acumulados con los anteriores
            // Esto es la "memoria" que Claude recibirá en la próxima generación
            if (seccionId) {
                try {
                    const historialKey = `historial_preguntas:${seccionId}`;
                    const nuevosEnunciados = dataTest.preguntas.map(p => p.enunciado);
                    const historialActualizado = [...preguntasPrevias, ...nuevosEnunciados];
                    await redis.set(historialKey, JSON.stringify(historialActualizado), 'EX', REDIS_TTL);
                    console.log(`📝 Redis: Historial actualizado — total acumulado: ${historialActualizado.length} preguntas`);
                } catch (redisErr) {
                    console.warn('⚠️ No se pudo actualizar el historial en Redis:', redisErr.message);
                }
            }

            return dataTest;

        } catch (error) {
            console.error("❌ Error en Anthropic Service:", error);
            throw new Error('No se pudo generar la evaluación estructurada con IA.');
        }
    },

    procesarGuardadoTest: async (seccionId, payloadTest) => {
        const { nombre_test, ponderacion, preguntas } = payloadTest;
        return await TestIAModel.guardarTest(seccionId, nombre_test, ponderacion, preguntas);
    },

    // ─── UTILIDAD: Limpiar historial de una sección ─────────────────────────
    // Úsalo cuando el experto quiera que Claude "olvide" lo que generó antes
    invalidarCacheSeccion: async (seccionId) => {
        try {
            const historialKey = `historial_preguntas:${seccionId}`;
            await redis.del(historialKey);
            console.log(`🗑️ Redis: Historial eliminado para sección ${seccionId}`);
        } catch (e) {
            console.warn('⚠️ No se pudo limpiar historial:', e.message);
        }
    }
};