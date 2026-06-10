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
            SELECT id, titulo, contenido_html 
            FROM ciclo_secciones 
            WHERE ciclo_id = ? AND tipo_seccion = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [cicloId, tipoSeccion]);
        return rows.length > 0 ? rows[0] : null;
    },

    async obtenerEnlacesPorSeccion(seccionId) {
        const query = `SELECT url FROM enlaces_seccion WHERE seccion_id = ?`;
        const [rows] = await db.execute(query, [seccionId]);
        return rows;
    },

    // Obtener los recursos físicos de Cloudflare R2
    async obtenerRecursosPorSeccion(seccionId) {
        // Agregamos key_r2 (asegúrate que el nombre de la columna en BD sea correcto)
        const query = `SELECT id, nombre_archivo, url_r2, tipo_archivo, key_r2 FROM recursos_r2 WHERE seccion_id = ?`;
        const [rows] = await db.execute(query, [seccionId]);
        return rows;
    },

    obtenerTestPorSeccion: async (seccionId) => {
        const query = `
            SELECT id, nombre_test, ponderacion, preguntas_json 
            FROM tests_ia 
            WHERE seccion_id = ? 
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [seccionId]);
        return rows.length > 0 ? rows[0] : null;
    },

    // Agrega 'titulo' a los argumentos de la función
    async crearSeccion(cicloId, tipoSeccion, contenidoHtml, titulo) {
        const query = `
            INSERT INTO ciclo_secciones (ciclo_id, tipo_seccion, contenido_html, titulo)
            VALUES (?, ?, ?, ?)
        `;
        
        // Asegúrate de que el array tenga exactamente los 4 elementos
        const [result] = await db.execute(query, [cicloId, tipoSeccion, contenidoHtml, titulo]);
        
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

    async guardarRecursoR2(seccionId, nombre, url, tipo, key) {
        // Si algún valor es undefined, lo convertimos a null explícitamente
        const query = `
            INSERT INTO recursos_r2 (seccion_id, nombre_archivo, url_r2, tipo_archivo, key_r2)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(query, [
            seccionId, 
            nombre || null, 
            url || null, 
            tipo || null, 
            key || null
        ]);
    },

    async borrarRecursosPorSeccion(seccionId) {
        const query = `DELETE FROM recursos_r2 WHERE seccion_id = ?`;
        await db.execute(query, [seccionId]);
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
    },

    async obtenerRecursoPorId(recursoId) {
        // Si tu columna se llama 'key_r2', asegúrate de que esté en el SELECT
        const query = 'SELECT id, nombre_archivo, url_r2, tipo_archivo, key_r2 FROM recursos_r2 WHERE id = ?';
        const [rows] = await db.execute(query, [recursoId]);
        return rows[0]; // Esto devuelve el objeto con { id, nombre_archivo, url_r2, tipo_archivo, key_r2 }
    },

    // 2. Eliminar registro del recurso en BD
    async eliminarRecurso(recursoId) {
        const query = 'DELETE FROM recursos_r2 WHERE id = ?';
        await db.execute(query, [recursoId]);
    },

    // 3. Eliminar enlace en BD
    async eliminarEnlace(enlaceId) {
        const query = 'DELETE FROM enlaces_seccion WHERE id = ?';
        await db.execute(query, [enlaceId]);
    }
};