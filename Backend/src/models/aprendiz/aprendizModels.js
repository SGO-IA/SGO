import db from '../../config/dbConfig.js';

export const aprendizModel = {
    async obtenerFichasPorAprendiz(aprendizId) {
        const query = `
            SELECT 
                f.id AS ficha_id,
                f.codigo_ficha,
                f.estado AS estado_ficha,
                f.fecha_inicio,
                f.fecha_fin,
                f.modalidad,
                p.nombre AS nombre_programa,
                p.nivel_formacion
            FROM matriculas_aprendices ma
            INNER JOIN fichas f ON ma.ficha_id = f.id
            INNER JOIN programas p ON f.programa_id = p.programa_id
            WHERE ma.aprendiz_id = ?
            ORDER BY f.estado ASC, f.fecha_inicio DESC;
        `;
        // El ordenamiento prioriza las activas ('lectiva'/'productiva' suelen ir antes alfabéticamente o según tu enum)
        
        const [rows] = await db.execute(query, [aprendizId]);
        return rows;
    }
};