import db from '../../config/dbConfig.js';

export const diagnosticoModel = {
    // Obtiene la competencia asociada a una OVA
    async obtenerCompetenciaDeOva(ovaId) {
        const query = `SELECT id, competencia_id, titulo FROM ovas WHERE id = ?`;
        const [rows] = await db.execute(query, [ovaId]);
        return rows[0];
    },

    // Busca si existe un test diagnóstico ACTIVO para esa competencia
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

    // Verifica si el aprendiz ya presentó ese test diagnóstico
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

    // Guarda el resultado del intento del aprendiz
    async guardarResultadoDiagnostico(testDiagnosticoId, aprendizId, puntaje, nivelSugerido) {
        const query = `
            INSERT INTO resultados_diagnosticos 
                (test_diagnostico_id, aprendiz_id, puntaje, nivel_sugerido) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [testDiagnosticoId, aprendizId, puntaje, nivelSugerido]);
        return { id: result.insertId, testDiagnosticoId, aprendizId, puntaje, nivelSugerido };
    }
};