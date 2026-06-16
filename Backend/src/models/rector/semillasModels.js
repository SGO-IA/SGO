import db from '../../config/dbConfig.js';

export const semillaRectorModel = {
    async obtenerSemillasPendientes() {
        const query = `
            SELECT 
                s.id AS semilla_id,
                s.nombre_semilla,
                s.estado,
                s.programa_id,
                p.nombre AS programa_nombre,
                p.codigo AS programa_codigo,
                p.version AS programa_version,
                p.nivel_formacion,
                (SELECT COUNT(*) FROM ovas WHERE ovas.semilla_id = s.id) AS total_ovas
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            WHERE s.estado = 'pendiente_rector'
            ORDER BY s.id DESC;
        `;
        
        console.log(`🗄️ [Model] Consultando semillas pendientes de revisión`);
        const [rows] = await db.execute(query);
        return rows;
    }
};