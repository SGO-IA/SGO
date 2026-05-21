import db from '../../config/dbConfig.js';

export const RapsModel = {
  obtenerRapsAsignados: async (expertoId, semillaId) => {
    const query = `
      SELECT r.id, r.codigo_rap, r.denominacion, r.competencia_id
      FROM expertos_raps_trabajo ert
      INNER JOIN resultados_aprendizaje r ON ert.rap_id = r.id
      WHERE ert.experto_id = ? AND ert.semilla_id = ?
    `;
    const [rows] = await db.execute(query, [expertoId, semillaId]);
    return rows;
  },

  obtenerRapsDisponiblesPorSemilla: async (semillaId) => {
    const query = `
      SELECT 
        r.id, 
        r.codigo_rap, 
        r.denominacion, 
        c.nombre AS competencia_nombre,
        u.id AS asignado_experto_id,
        u.nombre AS asignado_experto_nombre
      FROM semillas s
      INNER JOIN competencias c ON s.programa_id = c.programa_id
      INNER JOIN resultados_aprendizaje r ON c.id = r.competencia_id
      LEFT JOIN expertos_raps_trabajo ert ON r.id = ert.rap_id AND ert.semilla_id = s.id
      LEFT JOIN usuarios u ON ert.experto_id = u.id
      WHERE s.id = ?
    `;
    const [rows] = await db.execute(query, [semillaId]);
    return rows;
  },

  guardarSeleccionMasiva: async (expertoId, semillaId, rapIds) => {
    const valuesStatement = rapIds.map(() => '(?, ?, ?)').join(', ');
    const query = `
      INSERT IGNORE INTO expertos_raps_trabajo (experto_id, semilla_id, rap_id)
      VALUES ${valuesStatement}
    `;

    const params = [];
    rapIds.forEach(rapId => {
      params.push(expertoId, semillaId, rapId);
    });

    const [result] = await db.execute(query, params);
    return result;
  }
};