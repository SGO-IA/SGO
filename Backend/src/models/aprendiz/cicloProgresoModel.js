import db from '../../config/dbConfig.js';

export const cicloProgresoModel = {
    // Trae las fases Apropiación/Transferencia del ciclo que SÍ tienen un test configurado
    async obtenerTestsObligatoriosDelCiclo(cicloId) {
        const query = `
            SELECT cs.id AS seccion_id, cs.tipo_seccion, t.id AS test_id, t.nombre_test
            FROM ciclo_secciones cs
            INNER JOIN tests_ia t ON t.seccion_id = cs.id
            WHERE cs.ciclo_id = ? AND cs.tipo_seccion IN ('Apropiacion', 'Transferencia')
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    // Último resultado del aprendiz para un test específico
    async obtenerUltimoResultadoTest(aprendizId, testId) {
        const query = `
            SELECT id, puntaje, aprobado 
            FROM resultados_tests_ia 
            WHERE aprendiz_id = ? AND test_id = ?
            ORDER BY fecha_presentacion DESC
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [aprendizId, testId]);
        return rows[0];
    },

    // Marca el ciclo como completado (upsert: si ya existía, actualiza la fecha)
    async marcarCicloCompletado(aprendizId, cicloId) {
        const query = `
            INSERT INTO progreso_ciclos (aprendiz_id, ciclo_id, completado, fecha_completado)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE completado = 1, fecha_completado = NOW()
        `;
        await db.execute(query, [aprendizId, cicloId]);
        return { aprendizId, cicloId, completado: true };
    },

    async obtenerProgresoCiclo(aprendizId, cicloId) {
        const query = `
            SELECT completado, fecha_completado 
            FROM progreso_ciclos 
            WHERE aprendiz_id = ? AND ciclo_id = ?
        `;
        const [rows] = await db.execute(query, [aprendizId, cicloId]);
        return rows[0] || null;
    }
};