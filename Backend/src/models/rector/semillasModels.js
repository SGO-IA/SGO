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
    },

    async getDetalleBasico(semillaId) {
        const query = `
            SELECT 
                s.id AS semilla_id,
                s.nombre_semilla,
                s.estado,
                p.nombre AS programa_nombre,
                p.codigo AS programa_codigo,
                p.version AS programa_version,
                p.nivel_formacion
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            WHERE s.id = ?;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows[0] || null;
    },

    async getExpertosAsignados(semillaId) {
        const query = `
            SELECT DISTINCT 
                u.id AS experto_id,
                u.nombre AS experto_nombre,
                u.correo AS experto_correo
            FROM expertos_semillas es
            INNER JOIN usuarios u ON es.experto_id = u.id
            WHERE es.semilla_id = ?;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    },

    async getOvasDetalle(semillaId) {
        const query = `
            SELECT 
                o.id AS ova_id,
                o.titulo AS ova_titulo,
                o.estado AS ova_estado,
                c.codigo_norma,
                c.nombre AS competencia_nombre
            FROM ovas o
            INNER JOIN competencias c ON o.competencia_id = c.id
            WHERE o.semilla_id = ?;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    }
};