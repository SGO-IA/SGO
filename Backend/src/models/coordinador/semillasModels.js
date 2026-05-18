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
    }
};