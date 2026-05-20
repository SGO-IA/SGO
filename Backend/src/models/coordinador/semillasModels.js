import db from '../../config/dbConfig.js';

export const semillaModel = {
    // Inserta la nueva semilla en la tabla maestra
    async insertarSemilla(connection, { programa_id, nombre_semilla }) {
        const query = `
            INSERT INTO semillas (programa_id, nombre_semilla, estado) 
            VALUES (?, ?, 'en_construccion');
        `;
        const [result] = await connection.execute(query, [programa_id, nombre_semilla]);
        return result.insertId; // Retorna el ID autogenerado
    },

    // Inserta las vinculaciones detalladas en la nueva estructura relacional de la DB
    async vincularExpertoACompetencia(connection, { experto_id, semilla_id, competencia_id }) {
        const query = `
            INSERT INTO expertos_semillas (experto_id, semilla_id, competencia_id) 
            VALUES (?, ?, ?);
        `;
        const [result] = await connection.execute(query, [experto_id, semilla_id, competencia_id]);
        return result;
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
                   p.denominacion AS programa_denominacion, p.version AS programa_version, p.nivel_formacion
            FROM semillas s
            INNER JOIN programas p ON s.programa_id = p.programa_id
            WHERE s.id = ?;
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    },

    // 2. Expertos temáticos asignados a la semilla
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

    // 3. Obtiene los OVAs junto con sus competencias asociadas
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

    // 4. Obtiene los ciclos didácticos de un OVA específico junto a su fase del proyecto
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

    // 5. Resultados de Aprendizaje (RAP) mapeados al ciclo
    async obtenerRapsPorCiclo(cicloId) {
        const query = `
            SELECT r.id AS rap_id, r.codigo_rap, r.denominacion
            FROM resultados_aprendizaje r
            WHERE r.cycle_id = ? OR r.ciclo_id = ?;
        `;
        // Pasamos doble por compatibilidad con el nombre del campo en tu estructura
        const [rows] = await db.execute(query, [cicloId, cicloId]);
        return rows;
    },

    // 6. Contenidos atómicos del RAP: Saberes, Procesos y Criterios
    async obtenerComponentesRap(rapId) {
        const [saberes] = await db.execute('SELECT id, descripcion FROM conocimientos_saber WHERE rap_id = ?', [rapId]);
        const [procesos] = await db.execute('SELECT id, descripcion FROM conocimientos_proceso WHERE rap_id = ?', [rapId]);
        const [criterios] = await db.execute('SELECT id, descripcion FROM criterios_evaluacion WHERE rap_id = ?', [rapId]);
        
        return { saberes, procesos, criterios };
    }
};