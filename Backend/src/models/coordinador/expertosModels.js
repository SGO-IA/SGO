import db from '../../config/dbConfig.js';

export const expertoModel = {
    async obtenerExpertos() {
        const query = `
            SELECT 
                u.id, 
                u.nombre, 
                u.correo, 
                r.nombre_rol as rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.rol_id
            WHERE r.nombre_rol = 'experto tematico' AND u.activo = TRUE
            ORDER BY u.nombre ASC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};