import db from '../../config/dbConfig.js';

export const expertoModel = {
    async obtenerSemillasPorExperto(expertoId) {
        const query = `
            SELECT 
                s.id, 
                s.nombre_semilla, 
                s.estado,
                p.nombre AS programa_nombre,
                p.codigo AS programa_codigo,
                es.fecha_asignacion
            FROM expertos_semillas es
            JOIN semillas s ON es.semilla_id = s.id
            JOIN programas p ON s.programa_id = p.programa_id
            WHERE es.experto_id = ?
            ORDER BY es.fecha_asignacion DESC
        `;
        const [rows] = await db.execute(query, [expertoId]);
        return rows;
    },

async verificarRelacionSemillaCiclo(semillaId, cicloId) {
    const query = `
        SELECT COUNT(*) AS coincidencia
        FROM ciclos_didacticos cd
        INNER JOIN ovas o ON cd.ova_id = o.id
        WHERE cd.id = ? AND o.semilla_id = ?
    `;
    
    console.log(`🚩 [Model] Ejecutando SQL con params: [${cicloId}, ${semillaId}]`);
    
    try {
        const [rows] = await db.execute(query, [cicloId, semillaId]);
        console.log(`🚩 [Model] Resultado SQL:`, rows[0]);
        return rows[0].coincidencia > 0;
    } catch (err) {
        console.error(`🚩 [Model] Error en SQL:`, err.message);
        throw err;
    }
}
};