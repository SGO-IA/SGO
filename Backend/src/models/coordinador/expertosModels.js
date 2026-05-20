import db from '../../config/dbConfig.js';

export const expertoModel = {
    async obtenerExpertos() {
        const query = `
            SELECT 
                u.id AS experto_id, 
                u.nombre AS nombre_experto, 
                u.correo AS correo_experto, 
                r.nombre_rol AS rol,
                s.id AS semilla_id,
                s.nombre_semilla,
                s.estado AS estado_semilla,
                p.nombre AS nombre_programa,
                p.codigo AS codigo_programa,
                es.fecha_asignacion
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.rol_id
            LEFT JOIN expertos_semillas es ON u.id = es.experto_id
            LEFT JOIN semillas s ON es.semilla_id = s.id
            LEFT JOIN programas p ON s.programa_id = p.programa_id
            WHERE r.nombre_rol = 'experto tematico' AND u.activo = TRUE
            ORDER BY u.nombre ASC, es.fecha_asignacion DESC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};