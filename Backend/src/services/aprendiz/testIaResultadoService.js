import { testIaResultadoModel } from '../../models/aprendiz/testIaResultadoModel.js';
import { anthropic, anthropicConfig } from '../../config/claude.js'; // 🔧 ajusta el path real
import { generarPromptAnalisisTestFase } from '../../prompts/aprendiz/generarPromptAnalisisTestFase.js';

export const testIaResultadoService = {
    /**
     * respuestasUsuario: [{ preguntaIndex: 0, opcionSeleccionada: 2 }, ...]
     */
    async registrarResultado(aprendizId, testId, respuestasUsuario) {
        const test = await testIaResultadoModel.obtenerTestPorId(testId);

        if (!test) {
            throw new Error('TEST_NO_ENCONTRADO');
        }

        const preguntas = typeof test.preguntas_json === 'string'
            ? JSON.parse(test.preguntas_json)
            : test.preguntas_json;

        let correctas = 0;
        preguntas.forEach((pregunta, index) => {
            const respuestaUsuario = respuestasUsuario.find(r => r.preguntaIndex === index);
            if (!respuestaUsuario || respuestaUsuario.opcionSeleccionada === null || respuestaUsuario.opcionSeleccionada === undefined) {
                return;
            }
            if (respuestaUsuario.opcionSeleccionada === pregunta.respuesta_correcta_index) {
                correctas++;
            }
        });

        const puntaje = parseFloat(((correctas / preguntas.length) * 100).toFixed(2));
        const aprobado = puntaje >= 70; // 🔧 Ajusta tu umbral real de aprobación

        const analisisIA = await this._generarAnalisisIA(
            test.nombre_test,
            preguntas,
            respuestasUsuario,
            puntaje
        );

        const resultado = await testIaResultadoModel.guardarResultado(
            testId, aprendizId, puntaje, aprobado, analisisIA
        );

        return { ...resultado, correctas, totalPreguntas: preguntas.length, analisisIA };
    },

    async _generarAnalisisIA(nombreTest, preguntas, respuestasUsuario, puntaje) {
        try {
            const prompt = generarPromptAnalisisTestFase(nombreTest, preguntas, respuestasUsuario, puntaje);

            const respuesta = await anthropic.messages.create({
                model: anthropicConfig.model,
                max_tokens: anthropicConfig.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            });

            const textoRespuesta = respuesta.content[0]?.text?.trim();
            return JSON.parse(textoRespuesta);
        } catch (error) {
            console.error('⚠️ Error generando análisis IA de test de fase (usando fallback):', error.message);
            return {
                resumen: `Obtuviste un puntaje de ${puntaje}% en este test.`,
                fortalezas: [],
                areas_mejora: [],
                recomendacion: 'Revisa el contenido de la fase con atención.',
                mensaje_motivacional: '¡Sigue adelante con tu proceso de formación!'
            };
        }
    }
};