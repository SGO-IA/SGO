import { diagnosticoModel } from '../../models/aprendiz/diagnosticoModel.js';

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

        // 🔧 Parseamos preguntas_json y extraemos el array real de preguntas
        const jsonParseado = typeof testDiagnostico.preguntas_json === 'string'
            ? JSON.parse(testDiagnostico.preguntas_json)
            : testDiagnostico.preguntas_json;

        return { 
            accesoPermitido: false, 
            testDiagnostico: {
                id: testDiagnostico.id,
                nombre_test: testDiagnostico.nombre_test, // columna de la tabla, no del JSON
                descripcion: testDiagnostico.descripcion,
                preguntas: jsonParseado.preguntas || [] // 🔧 extraído del objeto envolvente
            }
        };
    },

    /**
     * respuestasUsuario: [{ preguntaIndex: 0, opcionSeleccionada: 2 }, ...]
     * donde opcionSeleccionada es el ÍNDICE del array 'opciones' que eligió el aprendiz
     */
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
                return; // pregunta sin responder, no cuenta como correcta
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

        const resultado = await diagnosticoModel.guardarResultadoDiagnostico(
            testDiagnosticoId, aprendizId, puntaje, nivelSugerido
        );

        return { ...resultado, correctas, totalPreguntas: preguntas.length };
    },

    async _obtenerTestPorId(testDiagnosticoId) {
        const db = (await import('../../config/dbConfig.js')).default;
        const [rows] = await db.execute(
            `SELECT id, competencia_id, preguntas_json FROM tests_diagnosticos WHERE id = ?`,
            [testDiagnosticoId]
        );
        return rows[0];
    }
};