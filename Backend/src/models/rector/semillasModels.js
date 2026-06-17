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
    },

    async getOvasPorSemilla(semillaId) {
        const query = `
            SELECT 
                o.id AS ova_id, 
                o.titulo AS ova_titulo, 
                o.estado AS ova_estado,
                c.codigo_norma, 
                c.nombre AS competencia_nombre,
                (SELECT COUNT(*) FROM ciclos_didacticos cd WHERE cd.ova_id = o.id) AS total_ciclos
            FROM ovas o
            INNER JOIN competencias c ON o.competencia_id = c.id
            WHERE o.semilla_id = ?
            ORDER BY o.id ASC;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    },

    // 2. Obtener los Ciclos de un OVA
    async getCiclosPorOva(ovaId) {
        const query = `
            SELECT 
                cd.id AS ciclo_id, 
                cd.titulo AS ciclo_titulo, 
                cd.estado, 
                cd.descripcion_general,
                fp.nombre_fase,
                fp.sigla
            FROM ciclos_didacticos cd
            INNER JOIN fases_proyecto fp ON cd.fase_proyecto_id = fp.id
            WHERE cd.ova_id = ?
            ORDER BY fp.id ASC;
        `;
        const [rows] = await db.execute(query, [ovaId]);
        return rows;
    },

    // 3A. Cabecera del Modo Lectura del Ciclo
    async getCabeceraCicloLectura(cicloId) {
        const query = `
            SELECT 
                cd.id AS ciclo_id, 
                cd.titulo AS ciclo_titulo, 
                cd.descripcion_general, 
                fp.nombre_fase, 
                o.titulo AS ova_titulo
            FROM ciclos_didacticos cd
            INNER JOIN fases_proyecto fp ON cd.fase_proyecto_id = fp.id
            INNER JOIN ovas o ON cd.ova_id = o.id
            WHERE cd.id = ?;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows[0] || null;
    },

    // 3B. Secciones, Tests y Recursos para el Modo Lectura
    async getSeccionesCicloLectura(cicloId) {
        const query = `
            SELECT 
                cs.id AS seccion_id, 
                cs.tipo_seccion, 
                cs.titulo AS seccion_titulo, 
                cs.contenido_html,
                ti.nombre_test,
                ti.ponderacion,
                ti.preguntas_json
            FROM ciclo_secciones cs
            LEFT JOIN tests_ia ti ON ti.seccion_id = cs.id
            WHERE cs.ciclo_id = ?
            ORDER BY cs.orden ASC;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    async getEnlacesCiclo (cicloId) {
        const query = `
            SELECT e.id, e.seccion_id, e.url, e.etiqueta 
            FROM enlaces_seccion e
            INNER JOIN ciclo_secciones cs ON e.seccion_id = cs.id
            WHERE cs.ciclo_id = ?;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    async getRecursosR2Ciclo (cicloId) {
        const query = `
            SELECT r.id, r.seccion_id, r.nombre_archivo, r.url_r2, r.tipo_archivo 
            FROM recursos_r2 r
            INNER JOIN ciclo_secciones cs ON r.seccion_id = cs.id
            WHERE cs.ciclo_id = ?;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    }
};