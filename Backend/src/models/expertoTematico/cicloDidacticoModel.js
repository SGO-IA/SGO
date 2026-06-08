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

    async verificarCicloExistente(ova_id) {
        const query = `
            SELECT id, fase_proyecto_id 
            FROM ciclos_didacticos 
            WHERE ova_id = ? 
            LIMIT 1
        `;
        // Solo enviamos ova_id como parámetro
        const [rows] = await db.execute(query, [ova_id]);
        return rows.length > 0 ? rows[0] : null; // Retornamos el objeto completo o null
    },

    async obtenerCiclosConExpertoPorOva(ovaId) {
        const query = `
            SELECT 
                c.id AS ciclo_id,
                c.titulo AS titulo_ciclo,
                IF(CHAR_LENGTH(c.descripcion_general) > 100, CONCAT(LEFT(c.descripcion_general, 100), '...'), c.descripcion_general) AS descripcion_general,
                f.nombre_fase,
                GROUP_CONCAT(DISTINCT u.nombre SEPARATOR ', ') AS experto_nombre,
                GROUP_CONCAT(DISTINCT u.correo SEPARATOR ', ') AS experto_correo
            FROM ciclos_didacticos c
            INNER JOIN fases_proyecto f ON c.fase_proyecto_id = f.id
            LEFT JOIN resultados_aprendizaje rap ON rap.ciclo_id = c.id
            LEFT JOIN expertos_raps_trabajo ert ON ert.rap_id = rap.id
            LEFT JOIN usuarios u ON ert.experto_id = u.id
            WHERE c.ova_id = ?
            GROUP BY 
                c.id, 
                c.titulo, 
                c.descripcion_general,
                f.nombre_fase;
        `;
        const [rows] = await db.execute(query, [ovaId]);
        return rows;
    },

    async obtenerSeccionPorCicloYTipo(cicloId, tipoSeccion) {
        const query = `
            SELECT id, contenido_html 
            FROM ciclo_secciones 
            WHERE ciclo_id = ? AND tipo_seccion = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [cicloId, tipoSeccion]);
        return rows.length > 0 ? rows[0] : null;
    },

    async crearSeccion(cicloId, tipoSeccion, contenidoHtml) {
        const query = `
            INSERT INTO ciclo_secciones (ciclo_id, tipo_seccion, contenido_html, titulo)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [cicloId, tipoSeccion, contenidoHtml]);
        return { id: result.insertId };
    },

    async actualizarSeccion(seccionId, contenidoHtml, titulo) {
        console.log('DEBUG SQL UPDATE:', { seccionId, contenidoHtml, titulo });
        
        const query = `
            UPDATE ciclo_secciones 
            SET contenido_html = ?, titulo = ?
            WHERE id = ?
        `;
        
        if (!seccionId) throw new Error('El ID de la sección es requerido para actualizar');
        
        await db.execute(query, [contenidoHtml, titulo, seccionId]); 
        return true;
    },

    async guardarRecursoR2(seccionId, nombreArchivo, urlR2, tipoArchivo = null) {
        const query = `
            INSERT INTO recursos_r2 (seccion_id, nombre_archivo, url_r2, tipo_archivo)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [seccionId, nombreArchivo, urlR2, tipoArchivo]);
        return { id: result.insertId };
    },

    async borrarEnlacesPorSeccion(seccionId) {
        const query = `DELETE FROM enlaces_seccion WHERE seccion_id = ?`;
        await db.execute(query, [seccionId]);
        return true;
    },

    async insertarEnlace(seccionId, url) {
        const query = `
            INSERT INTO enlaces_seccion (seccion_id, url) 
            VALUES (?, ?)
        `;
        const [result] = await db.execute(query, [seccionId, url]);
        return { id: result.insertId };
    },

    async obtenerEnlacesPorSeccion(seccionId) {
        const query = `SELECT id, url, etiqueta FROM enlaces_seccion WHERE seccion_id = ?`;
        const [rows] = await db.execute(query, [seccionId]);
        return rows;
    }
};