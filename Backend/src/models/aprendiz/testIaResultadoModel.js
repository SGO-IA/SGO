import db from '../../config/dbConfig.js';

export const testIaResultadoModel = {
    async obtenerTestPorId(testId) {
        const query = `SELECT id, seccion_id, nombre_test, preguntas_json FROM tests_ia WHERE id = ?`;
        const [rows] = await db.execute(query, [testId]);
        return rows[0];
    },

    async guardarResultado(testId, aprendizId, puntaje, aprobado, analisisIA) {
        const query = `
            INSERT INTO resultados_tests_ia 
                (test_id, aprendiz_id, puntaje, aprobado, analisis_ia) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const analisisParaGuardar = (analisisIA !== undefined && analisisIA !== null)
            ? JSON.stringify(analisisIA)
            : null;

        const [result] = await db.execute(query, [
            testId,
            aprendizId,
            puntaje,
            aprobado ? 1 : 0,
            analisisParaGuardar
        ]);

        return { id: result.insertId, testId, aprendizId, puntaje, aprobado };
    }
};