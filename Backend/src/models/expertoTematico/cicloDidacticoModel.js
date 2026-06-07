import db from '../../config/dbConfig.js';

export const cicloModel = {
    async obtenerDashboardPorExperto(expertoId) {
        const query = `
            SELECT 
                s.id AS semilla_id, 
                s.nombre_semilla,
                u.id AS experto_id, 
                u.nombre AS nombre_experto,
                rap.id AS rap_id, 
                rap.codigo_rap, 
                rap.denominacion AS nombre_rap,
                cd.id AS ciclo_didactico_id, 
                cd.titulo AS titulo_ciclo,
                CASE WHEN cd.id IS NULL THEN 'Pendiente' ELSE 'Creado' END AS estado_ciclo
            FROM semillas s
            JOIN expertos_semillas es ON s.id = es.semilla_id
            JOIN usuarios u ON es.experto_id = u.id
            JOIN competencias c ON es.competencia_id = c.id
            JOIN resultados_aprendizaje rap ON c.id = rap.competencia_id
            LEFT JOIN ciclos_didacticos cd ON rap.ciclo_id = cd.id
            WHERE u.id = ?
            ORDER BY s.nombre_semilla, rap.codigo_rap;
        `;
        const [rows] = await db.execute(query, [expertoId]);
        return rows;
    },

    async obtenerFases() {
        const query = `SELECT id, sigla, nombre_fase FROM fases_proyecto ORDER BY id ASC`;
        const [rows] = await db.execute(query);
        return rows;
    },

    async crearCiclo(data) {
        const query = `
            INSERT INTO ciclos_didacticos (ova_id, fase_proyecto_id, titulo, descripcion_general)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            data.ova_id, 
            data.fase_proyecto_id, 
            data.titulo, 
            data.descripcion_general
        ]);
        return { id: result.insertId };
    },

    async verificarCicloExistente(ova_id, fase_proyecto_id) {
        const query = `
            SELECT id, fase_proyecto_id 
            FROM ciclos_didacticos 
            WHERE ova_id = ? 
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [ova_id, fase_proyecto_id]);
        return rows.length > 0;
    }
};