import db from '../../config/dbConfig.js';

export class RecursoModel {
    static async obtenerPorId(id) {
        const query = 'SELECT id, key_r2, nombre_archivo FROM recursos_r2 WHERE id = ? LIMIT 1';
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    }
    
    static async obtenerPorId(id) {
        console.log(`🗄️ [Model] Buscando recurso con ID: ${id}`);
        
        // Consultamos directamente la columna real: key_r2
        const query = 'SELECT id, key_r2, nombre_archivo FROM recursos_r2 WHERE id = ? LIMIT 1';
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    }
}