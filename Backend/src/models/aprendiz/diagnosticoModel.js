import db from '../../config/dbConfig.js';

export const diagnosticoModel = {
    async obtenerCompetenciaDeOva(ovaId) {
        const query = `SELECT id, competencia_id, titulo FROM ovas WHERE id = ?`;
        const [rows] = await db.execute(query, [ovaId]);
        return rows[0];
    },

    async obtenerTestDiagnosticoPorCompetencia(competenciaId) {
        const query = `
            SELECT id, competencia_id, nombre_test, descripcion, preguntas_json 
            FROM tests_diagnosticos 
            WHERE competencia_id = ? AND activo = 1 
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [competenciaId]);
        return rows[0];
    },

    async obtenerResultadoDiagnostico(aprendizId, testDiagnosticoId) {
        const query = `
            SELECT id, puntaje, nivel_sugerido, fecha_presentacion 
            FROM resultados_diagnosticos 
            WHERE aprendiz_id = ? AND test_diagnostico_id = ?
            ORDER BY fecha_presentacion DESC
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [aprendizId, testDiagnosticoId]);
        return rows[0];
    },

    async guardarResultadoDiagnostico(testDiagnosticoId, aprendizId, puntaje, nivelSugerido, analisisIA) {
        const query = `
            INSERT INTO resultados_diagnosticos 
                (test_diagnostico_id, aprendiz_id, puntaje, nivel_sugerido, analisis_ia) 
            VALUES (?, ?, ?, ?, ?)
        `;

        // JSON.stringify(undefined) devuelve undefined, no un string — por eso el guard explícito
        const analisisParaGuardar = (analisisIA !== undefined && analisisIA !== null)
            ? JSON.stringify(analisisIA)
            : null;

        const [result] = await db.execute(query, [
            testDiagnosticoId,
            aprendizId,
            puntaje,
            nivelSugerido,
            analisisParaGuardar
        ]);

        return { id: result.insertId, testDiagnosticoId, aprendizId, puntaje, nivelSugerido };
    }
};