import db from '../../config/dbConfig.js';

export const semillaModel = {
    // Inserta la nueva semilla (Programa de formación)
    async insertarSemilla(connection, { programa_id, nombre_semilla }) {
        const query = `
            INSERT INTO semillas (programa_id, nombre_semilla, estado) 
            VALUES (?, ?, 'en_construccion');
        `;
        const [result] = await connection.execute(query, [programa_id, nombre_semilla]);
        return result.insertId;
    },

    // Vincula a los expertos con sus respectivas competencias dentro de la semilla
    async vincularExpertoACompetencia(connection, { experto_id, semilla_id, competencia_id }) {
        const query = `
            INSERT INTO expertos_semillas (experto_id, semilla_id, competencia_id) 
            VALUES (?, ?, ?);
        `;
        const [result] = await connection.execute(query, [experto_id, semilla_id, competencia_id]);
        return result;
    },

    // Registra el OVA asociado a la semilla y a la competencia específica
    async insertarOvaEstructura(connection, { semilla_id, competencia_id, titulo }) {
        const query = `
            INSERT INTO ovas (semilla_id, competencia_id, titulo, descripcion, activo)
            VALUES (?, ?, ?, 'Objeto Virtual de Aprendizaje listo para configuración del experto', 1);
        `;
        const [result] = await connection.execute(query, [semilla_id, competencia_id, titulo]);
        return result.insertId;
    },

    async obtenerListaSemillas() {
        const query = `
            SELECT 
                s.id AS semilla_id,
                s.nombre_semilla,
                s.estado,
                p.programa_id,
                p.nombre AS programa_nombre,
                p.codigo AS programa_codigo,
                p.version AS programa_version
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            -- ✅ AQUÍ ESTÁ LA MAGIA: Solo traemos las semillas originales
            WHERE s.semilla_origen_id IS NULL 
            ORDER BY s.id DESC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    async obtenerBasePorId(id) {
        const query = `
            SELECT s.id AS semilla_id, s.nombre_semilla, s.estado,
                   p.programa_id, p.codigo AS programa_codigo, p.nombre AS programa_nombre, 
                   p.denominacion AS program_denominacion, p.version AS programa_version, p.nivel_formacion
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            WHERE s.id = ?;
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    },

    async obtenerExpertosPorSemilla(semillaId) {
        const query = `
            SELECT u.id AS experto_id, u.nombre, u.correo
            FROM expertos_semillas es
            INNER JOIN usuarios u ON es.experto_id = u.id
            WHERE es.semilla_id = ?;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    },

    async obtenerOvasPorSemilla(semillaId) {
        const query = `
            SELECT o.id AS ova_id, o.titulo AS ova_titulo, o.descripcion AS ova_descripcion, o.activo AS ova_activo,
                   c.id AS competencia_id, c.codigo_norma, c.nombre AS competencia_nombre
            FROM ovas o
            INNER JOIN competencias c ON o.competencia_id = c.id
            WHERE o.semilla_id = ?;
        `;
        const [rows] = await db.execute(query, [semillaId]);
        return rows;
    },

    async obtenerCiclosPorOva(ovaId) {
        const query = `
            SELECT cd.id AS ciclo_id, cd.titulo AS ciclo_titulo, cd.descripcion_general, cd.orden,
                   fp.sigla AS fase_sigla, fp.nombre_fase
            FROM ciclos_didacticos cd
            INNER JOIN fases_proyecto fp ON cd.fase_proyecto_id = fp.id
            WHERE cd.ova_id = ?
            ORDER BY cd.orden ASC;
        `;
        const [rows] = await db.execute(query, [ovaId]);
        return rows;
    },

    async obtenerRapsPorCiclo(cicloId) {
        const query = `
            SELECT r.id AS rap_id, r.codigo_rap, r.denominacion
            FROM resultados_aprendizaje r
            WHERE r.ciclo_id = ?;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    async obtenerSeccionesPorCiclo(cicloId) {
        const query = `
            SELECT id AS seccion_id, tipo_seccion, titulo, contenido_html, orden
            FROM ciclo_secciones
            WHERE ciclo_id = ?
            ORDER BY orden ASC;
        `;
        const [rows] = await db.execute(query, [cicloId]);
        return rows;
    },

    async obtenerComponentesRap(rapId) {
        const [saberes] = await db.execute('SELECT id, descripcion FROM conocimientos_saber WHERE rap_id = ?', [rapId]);
        const [procesos] = await db.execute('SELECT id, descripcion FROM conocimientos_proceso WHERE rap_id = ?', [rapId]);
        const [criterios] = await db.execute('SELECT id, descripcion FROM criterios_evaluacion WHERE rap_id = ?', [rapId]);
        
        return { saberes, procesos, criterios };
    },
    // ─── Consultas de lectura ────────────────────────────────────────────────

    async obtenerBanco() {
        const [rows] = await db.query(`
            SELECT 
                s.id,
                s.nombre_semilla,
                s.estado,
                p.nombre        AS programa_nombre,
                p.codigo        AS programa_codigo,
                p.programa_id
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            WHERE s.semilla_origen_id IS NULL
              AND s.estado = 'aprobada'
            ORDER BY p.nombre, s.nombre_semilla
        `);
        return rows;
    },

    async obtenerPorId(id) {
        const [rows] = await db.query(
            `SELECT * FROM semillas WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    async fichaYaTieneSemilla(fichaId) {
        const [rows] = await db.query(
            `SELECT id FROM fichas WHERE id = ? AND semilla_id IS NOT NULL`,
            [fichaId]
        );
        return rows.length > 0;
    },

    async obtenerFicha(fichaId) {
        const [rows] = await db.query(
            `SELECT f.*, p.programa_id FROM fichas f 
             INNER JOIN programas p ON f.programa_id = p.programa_id
             WHERE f.id = ?`,
            [fichaId]
        );
        return rows[0] || null;
    },

    async obtenerOvasDeSemilla(semillaId) {
        const [rows] = await db.query(
            `SELECT * FROM ovas WHERE semilla_id = ?`,
            [semillaId]
        );
        return rows;
    },

    async obtenerCiclosDeOva(ovaId) {
        const [rows] = await db.query(
            `SELECT * FROM ciclos_didacticos WHERE ova_id = ?`,
            [ovaId]
        );
        return rows;
    },

    async obtenerSeccionesDeCiclo(cicloId) {
        const [rows] = await db.query(
            `SELECT * FROM ciclo_secciones WHERE ciclo_id = ?`,
            [cicloId]
        );
        return rows;
    },

    async obtenerRecursosDeSeccion(seccionId) {
        const [rows] = await db.query(
            `SELECT * FROM recursos_r2 WHERE seccion_id = ?`,
            [seccionId]
        );
        return rows;
    },

    async obtenerEnlacesDeSeccion(seccionId) {
        const [rows] = await db.query(
            `SELECT * FROM enlaces_seccion WHERE seccion_id = ?`,
            [seccionId]
        );
        return rows;
    },

    async obtenerTestsDeSeccion(seccionId) {
        const [rows] = await db.query(
            `SELECT * FROM tests_ia WHERE seccion_id = ?`,
            [seccionId]
        );
        return rows;
    },

    async obtenerUsuarioPorCorreo(correo) {
        const [rows] = await db.query(
            `SELECT id, nombre, correo, activo FROM usuarios WHERE correo = ?`,
            [correo]
        );
        return rows[0] || null;
    },

    // ─── Inserts de la duplicación (reciben conexión para la transacción) ────

    async insertarSemillaCopia(conn, { programaId, nombreSemilla, semillaOrigenId, fichaId }) {
        const [result] = await conn.query(
            `INSERT INTO semillas 
                (programa_id, nombre_semilla, estado, semilla_origen_id, ficha_id)
             VALUES (?, ?, 'aprobada', ?, ?)`,
            [programaId, nombreSemilla, semillaOrigenId, fichaId]
        );
        return result.insertId;
    },

    async insertarOva(conn, { semillaId, competenciaId, titulo, descripcion, activo, estado }) {
        const [result] = await conn.query(
            `INSERT INTO ovas 
                (semilla_id, competencia_id, titulo, descripcion, activo, estado)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [semillaId, competenciaId, titulo, descripcion, activo, estado]
        );
        return result.insertId;
    },

    async insertarCiclo(conn, { ovaId, faseProyectoId, titulo, descripcionGeneral, orden, estado }) {
        const [result] = await conn.query(
            `INSERT INTO ciclos_didacticos 
                (ova_id, fase_proyecto_id, titulo, descripcion_general, orden, estado)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ovaId, faseProyectoId, titulo, descripcionGeneral, orden, estado]
        );
        return result.insertId;
    },

    async insertarSeccion(conn, { cicloId, tipoSeccion, titulo, contenidoHtml, orden }) {
        const [result] = await conn.query(
            `INSERT INTO ciclo_secciones 
                (ciclo_id, tipo_seccion, titulo, contenido_html, orden)
             VALUES (?, ?, ?, ?, ?)`,
            [cicloId, tipoSeccion, titulo, contenidoHtml, orden]
        );
        return result.insertId;
    },

    async insertarRecurso(conn, { seccionId, nombreArchivo, urlR2, tipoArchivo, keyR2, key_r2 }) {
        const [result] = await conn.query(
            `INSERT INTO recursos_r2 
                (seccion_id, nombre_archivo, url_r2, tipo_archivo, keyR2, key_r2)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [seccionId, nombreArchivo, urlR2, tipoArchivo, keyR2, key_r2]
        );
        return result.insertId;
    },

    async insertarEnlace(conn, { seccionId, url, etiqueta }) {
        const [result] = await conn.query(
            `INSERT INTO enlaces_seccion (seccion_id, url, etiqueta)
             VALUES (?, ?, ?)`,
            [seccionId, url, etiqueta]
        );
        return result.insertId;
    },

    async insertarTest(conn, { seccionId, nombreTest, ponderacion, preguntasJson }) {
        const [result] = await conn.query(
            `INSERT INTO tests_ia (seccion_id, nombre_test, ponderacion, preguntas_json)
             VALUES (?, ?, ?, ?)`,
            [seccionId, nombreTest, ponderacion, JSON.stringify(preguntasJson)]
        );
        return result.insertId;
    },

    // ─── Vinculación de instructores y aprendices ────────────────────────────

    async vincularInstructor(conn, { instructorId, fichaId, competenciaId }) {
        await conn.query(
            `INSERT IGNORE INTO vinculacion_instructores 
                (instructor_id, ficha_id, competencia_id)
             VALUES (?, ?, ?)`,
            [instructorId, fichaId, competenciaId]
        );
    },

    async crearUsuarioAprendiz(conn, { nombre, correo, contrasena }) {
        const [result] = await conn.query(
            `INSERT INTO usuarios (rol_id, nombre, correo, contrasena, activo)
             VALUES (
                 (SELECT rol_id FROM roles WHERE nombre_rol = 'Aprendiz' LIMIT 1),
                 ?, ?, ?, 1
             )`,
            [nombre, correo, contrasena]
        );
        return result.insertId;
    },

    async matricularAprendiz(conn, { aprendizId, fichaId }) {
        await conn.query(
            `INSERT IGNORE INTO matriculas_aprendices (aprendiz_id, ficha_id)
             VALUES (?, ?)`,
            [aprendizId, fichaId]
        );
    },

    async actualizarSemillaEnFicha(conn, { fichaId, semillaId }) {
        await conn.query(
            `UPDATE fichas SET semilla_id = ? WHERE id = ?`,
            [semillaId, fichaId]
        );
    },
};