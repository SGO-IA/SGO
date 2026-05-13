import db from '../../config/dbConfig.js';

export const iaModel = {
    getProgramasWithCompetencias: async () => {
        const query = `
            SELECT 
                p.programa_id, p.nombre as programa_nombre, p.codigo as programa_codigo,
                COALESCE(
                    (SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', c.id,
                            'nombre', c.nombre,
                            'codigo_norma', c.codigo_norma
                        )
                    ) FROM competencias c WHERE c.programa_id = p.programa_id),
                    JSON_ARRAY()
                ) as competencias
            FROM programas p;
        `;
        const [rows] = await db.execute(query);
        
        // IMPORTANTE: Si rows.competencias llega como string, hay que parsearlo
        return rows.map(row => ({
            ...row,
            competencias: typeof row.competencias === 'string' 
                ? JSON.parse(row.competencias) 
                : (row.competencias || [])
        }));
    },

// C:/Users/Julian/Desktop/SGO/Backend/src/models/admin/testInicialModel.js

getEstructuraPedagogica: async (competenciaId) => {
    const query = `
        SELECT 
            r.id as rap_id, r.codigo_rap, r.denominacion as rap_nombre,
            COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM conocimientos_saber WHERE rap_id = r.id), JSON_ARRAY()) as saberes,
            COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM conocimientos_proceso WHERE rap_id = r.id), JSON_ARRAY()) as procesos,
            COALESCE((SELECT JSON_ARRAYAGG(descripcion) FROM criterios_evaluacion WHERE rap_id = r.id), JSON_ARRAY()) as criterios
        FROM resultados_aprendizaje r
        WHERE r.competencia_id = ?;
    `;

    // 1. Aquí desestructuras [rows]
    const [rows] = await db.execute(query, [competenciaId]);
    
    // 2. Aquí mapeas sobre 'rows' (antes quizás tenías 'raps' aquí y por eso fallaba)
    return rows.map(row => ({
        ...row,
        // MySQL devuelve el JSON como string a veces, lo parseamos con seguridad
        saberes: typeof row.saberes === 'string' ? JSON.parse(row.saberes) : row.saberes,
        procesos: typeof row.procesos === 'string' ? JSON.parse(row.procesos) : row.procesos,
        criterios: typeof row.criterios === 'string' ? JSON.parse(row.criterios) : row.criterios
    }));
},

obtenerTestPorCompetencia: async (competenciaId) => {
    const consulta = `
        SELECT 
            id AS test_id,
            nombre_test,
            preguntas_json,
            -- Como esta tabla no tiene ponderación, ponemos 100 por defecto o el campo que prefieras
            100 AS ponderacion, 
            'General' AS tipo_seccion,
            'Test Diagnóstico' AS ciclo_nombre
        FROM tests_diagnosticos
        WHERE competencia_id = ? AND activo = 1
        LIMIT 1;
    `;
    const [filas] = await db.execute(consulta, [competenciaId]);
    return filas[0] || null;
}
};