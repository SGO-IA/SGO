import db from '../../config/dbConfig.js';

export const RAPModel = {
  getContextoCompleto: async (rapId) => {
    const query = `
      SELECT 
        ra.denominacion as rap_nombre,
        GROUP_CONCAT(DISTINCT cp.descripcion SEPARATOR '; ') as conocimientos_proceso,
        GROUP_CONCAT(DISTINCT cs.descripcion SEPARATOR '; ') as conocimientos_saber,
        GROUP_CONCAT(DISTINCT ce.descripcion SEPARATOR '; ') as criterios_evaluacion
      FROM resultados_aprendizaje ra
      LEFT JOIN conocimientos_proceso cp ON ra.id = cp.rap_id
      LEFT JOIN conocimientos_saber cs ON ra.id = cs.rap_id
      LEFT JOIN criterios_evaluacion ce ON ra.id = ce.rap_id
      WHERE ra.id = ?
      GROUP BY ra.id
    `;
    const [rows] = await db.execute(query, [rapId]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }
};