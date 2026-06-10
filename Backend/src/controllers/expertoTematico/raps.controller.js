// Protocolo SGO-Layered: Controller
import { RapsService } from '../../services/expertoTematico/rapsService.js';

export const RapsController = {
  verificarYObtenerRaps: async (req, res) => {
    try {
      const { semillaId } = req.params;
      const expertoId = req.user.id; 

      const resultado = await RapsService.chequearEstructuraTrabajo(expertoId, semillaId);
      
      return res.status(200).json({
        status: 'success',
        ...resultado
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno al verificar asignación de RAPs'
      });
    }
  },

  guardarAsignacionRaps: async (req, res) => {
    try {
      const { semillaId } = req.params;
      const { rapIds } = req.body; 
      const expertoId = req.user.id;

      // Validación defensiva del cuerpo de la petición
      if (!rapIds || !Array.isArray(rapIds) || rapIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe seleccionar al menos un Resultado de Aprendizaje (RAP).'
        });
      }

      await RapsService.registrarRapsDeTrabajo(expertoId, semillaId, rapIds);

      return res.status(201).json({
        status: 'success',
        message: 'Resultados de aprendizaje vinculados exitosamente para su desarrollo.'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al guardar la asignación'
      });
    }
  }
};