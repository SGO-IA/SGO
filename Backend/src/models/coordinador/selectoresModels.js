import db from '../../config/dbConfig.js';

export const coordinadorSelectoresModel = {
    // 1. Fichas de un programa específico que NO tengan semilla asignada
    async getFichasDisponibles(programaId) {
        const query = `
            SELECT id, codigo_ficha, ficha_caracterizacion 
            FROM fichas 
            WHERE programa_id = ? AND semilla_id IS NULL;
        `;
        const [rows] = await db.execute(query, [programaId]);
        return rows;
    },

    // 2. Todos los instructores activos (Asumiendo que rol_id = 3 es Instructor, cámbialo si tu rol es otro)
    async getInstructoresActivos() {
        const query = `
            SELECT id, nombre, correo 
            FROM usuarios 
            WHERE rol_id = 2 AND activo = 1
            ORDER BY nombre ASC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // 3. Las competencias asociadas a un programa
    async getCompetenciasPorPrograma(programaId) {
        const query = `
            SELECT id, codigo_norma, nombre 
            FROM competencias 
            WHERE programa_id = ?;
        `;
        const [rows] = await db.execute(query, [programaId]);
        return rows;
    }
};