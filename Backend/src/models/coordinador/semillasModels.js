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
    }
};