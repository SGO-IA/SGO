import db from '../../config/dbConfig.js';

export const programaModel = {
    // Obtener lista simple para el selector del Coordinador
async listarProgramas() {
    const query = `
        SELECT 
            p.programa_id,
            p.codigo,
            p.nombre,
            p.version,
            -- Total de RAPs esperados
            (SELECT COUNT(*) 
             FROM resultados_aprendizaje ra
             JOIN competencias c ON ra.competencia_id = c.id
             WHERE c.programa_id = p.programa_id) AS total_raps_esperados,
            -- RAPs que tienen la trinidad completa
            (SELECT COUNT(DISTINCT ra.id)
             FROM resultados_aprendizaje ra
             JOIN competencias c ON ra.competencia_id = c.id
             JOIN conocimientos_proceso cp ON cp.rap_id = ra.id
             JOIN conocimientos_saber cs ON cs.rap_id = ra.id
             JOIN criterios_evaluacion ce ON ce.rap_id = ra.id
             WHERE c.programa_id = p.programa_id
               AND TRIM(cp.descripcion) <> ''
               AND TRIM(cs.descripcion) <> ''
               AND TRIM(ce.descripcion) <> '') AS raps_completados
        FROM programas p
        ORDER BY p.nombre ASC;
    `;
    const [rows] = await db.execute(query);
    return rows;
},

    // Obtener el programa con TODA su estructura pedagógica
async obtenerEstructuraCompleta(programaId) {
    const query = `
        SELECT 
            c.id,
            c.programa_id,
            c.codigo_norma,
            c.nombre,
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', r.id,
                            'codigo_rap', r.codigo_rap,
                            'denominacion', r.denominacion,
                            'saberes', COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT('descripcion', s.descripcion)) FROM conocimientos_saber s WHERE s.rap_id = r.id), JSON_ARRAY()),
                            'criterios', COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT('descripcion', ce.descripcion)) FROM criterios_evaluacion ce WHERE ce.rap_id = r.id), JSON_ARRAY())
                        )
                    )
                    FROM resultados_aprendizaje r
                    WHERE r.competencia_id = c.id
                ), 
                JSON_ARRAY()
            ) AS raps
        FROM competencias c
        WHERE c.programa_id = ?;
    `;

    const [rows] = await db.execute(query, [programaId]);
    
    // MySQL devuelve las columnas JSON como strings, las parseamos automáticamente
    return rows.map(row => ({
        ...row,
        raps: typeof row.raps === 'string' ? JSON.parse(row.raps) : row.raps
    }));
}
};