import { RapsModel } from '../../models/expertoTematico/rapsModels.js';

export const RapsService = {
  chequearEstructuraTrabajo: async (expertoId, semillaId) => {
    // 1. Validar si ya tiene RAPs registrados en nuestra tabla de trabajo
    const rapsAsignados = await RapsModel.obtenerRapsAsignados(expertoId, semillaId);

    if (rapsAsignados.length > 0) {
      return {
        tieneAsignacion: true,
        raps: rapsAsignados
      };
    }

    // 2. Si no tiene, extraemos los RAPs de la competencia asociados al programa de esta semilla
    const rapsDisponibles = await RapsModel.obtenerRapsDisponiblesPorSemilla(semillaId);

    return {
      tieneAsignacion: false,
      rapsDisponibles
    };
  },

  registrarRapsDeTrabajo: async (expertoId, semillaId, rapIds) => {
    // Orquesta la inserción masiva parametrizada
    return await RapsModel.guardarSeleccionMasiva(expertoId, semillaId, rapIds);
  }
};