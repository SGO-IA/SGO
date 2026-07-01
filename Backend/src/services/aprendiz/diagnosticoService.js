import { diagnosticoModel } from '../../models/aprendiz/diagnosticoModel.js';
import { anthropic, anthropicConfig } from '../../config/claude.js';
import { generarPromptAnalisisDiagnostico } from '../../prompts/aprendiz/generarPromptAnalisisDiagnostico.js';

export const diagnosticoService = {
    async verificarAccesoOva(aprendizId, ovaId) {
        const ova = await diagnosticoModel.obtenerCompetenciaDeOva(ovaId);
        if (!ova) {
            throw new Error('OVA_NO_ENCONTRADA');
        }

        const testDiagnostico = await diagnosticoModel.obtenerTestDiagnosticoPorCompetencia(ova.competencia_id);

        if (!testDiagnostico) {
            return { accesoPermitido: true, testDiagnostico: null };
        }

        const resultado = await diagnosticoModel.obtenerResultadoDiagnostico(aprendizId, testDiagnostico.id);

        if (resultado) {
            return { 
                accesoPermitido: true, 
                testDiagnostico: null,
                resultadoPrevio: resultado 
            };
        }

        const jsonParseado = typeof testDiagnostico.preguntas_json === 'string'
            ? JSON.parse(testDiagnostico.preguntas_json)
            : testDiagnostico.preguntas_json;

        return { 
            accesoPermitido: false, 
            testDiagnostico: {
                id: testDiagnostico.id,
                nombre_test: testDiagnostico.nombre_test,
                descripcion: testDiagnostico.descripcion,
                preguntas: jsonParseado.preguntas || []
            }
        };
    },

    // ✅ ÚNICA declaración, con análisis IA incluido
    async registrarResultadoDiagnostico(aprendizId, testDiagnosticoId, respuestasUsuario) {
        const testDiagnostico = await this._obtenerTestPorId(testDiagnosticoId);

        if (!testDiagnostico) {
            throw new Error('TEST_DIAGNOSTICO_NO_ENCONTRADO');
        }

        const jsonParseado = typeof testDiagnostico.preguntas_json === 'string'
            ? JSON.parse(testDiagnostico.preguntas_json)
            : testDiagnostico.preguntas_json;

        const preguntas = jsonParseado.preguntas || [];

        let correctas = 0;
        preguntas.forEach((pregunta, index) => {
            const respuestaUsuario = respuestasUsuario.find(r => r.preguntaIndex === index);
            if (!respuestaUsuario || respuestaUsuario.opcionSeleccionada === null || respuestaUsuario.opcionSeleccionada === undefined) {
                return;
            }
            const opcionElegida = pregunta.opciones[respuestaUsuario.opcionSeleccionada];
            if (opcionElegida && opcionElegida.es_correcta === true) {
                correctas++;
            }
        });

        const puntaje = parseFloat(((correctas / preguntas.length) * 100).toFixed(2));

        let nivelSugerido = 'bajo';
        if (puntaje >= 80) nivelSugerido = 'alto';
        else if (puntaje >= 50) nivelSugerido = 'medio';

        const analisisIA = await this._generarAnalisisIA(
            testDiagnostico.nombre_test,
            preguntas,
            respuestasUsuario,
            puntaje
        );

        console.log('🔍 analisisIA generado:', analisisIA);

        const resultado = await diagnosticoModel.guardarResultadoDiagnostico(
            testDiagnosticoId, aprendizId, puntaje, nivelSugerido, analisisIA
        );

        return { ...resultado, correctas, totalPreguntas: preguntas.length, analisisIA };
    },

    async _generarAnalisisIA(nombreTest, preguntas, respuestasUsuario, puntaje) {
        try {
            const prompt = generarPromptAnalisisDiagnostico(nombreTest, preguntas, respuestasUsuario, puntaje);

            const respuesta = await anthropic.messages.create({
                model: anthropicConfig.model,
                max_tokens: anthropicConfig.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            });

            const textoRespuesta = respuesta.content[0]?.text?.trim();
            const analisis = JSON.parse(textoRespuesta);

            return analisis;
        } catch (error) {
            console.error('⚠️ Error generando análisis IA (usando fallback):', error.message);
            return {
                nivel_detectado: puntaje >= 80 ? 'alto' : puntaje >= 50 ? 'medio' : 'bajo',
                resumen: `Obtuviste un puntaje de ${puntaje}% en este test diagnóstico.`,
                fortalezas: [],
                areas_mejora: [],
                recomendacion: 'Revisa el contenido de la lección con atención antes de avanzar.',
                mensaje_motivacional: '¡Sigue adelante con tu proceso de formación!'
            };
        }
    },

    // ✅ ÚNICA declaración, incluye nombre_test (la segunda que tenías la omitía)
    async _obtenerTestPorId(testDiagnosticoId) {
        const db = (await import('../../config/dbConfig.js')).default;
        const [rows] = await db.execute(
            `SELECT id, competencia_id, nombre_test, preguntas_json FROM tests_diagnosticos WHERE id = ?`,
            [testDiagnosticoId]
        );
        return rows[0];
    }
};