import { expertoService } from '../../services/expertoTematico/semillasService.js';

export const expertoController = {
    async listarMisSemillas(req, res) {
        try {
            const expertoId = req.user.id; 
            const semillas = await expertoService.obtenerSemillasVinculadas(expertoId);
            
            return res.status(200).json(semillas);
        } catch (error) {
            console.error("Error en expertoController.listarMisSemillas:", error);
            return res.status(500).json({ 
                message: "Error al obtener tus semillas vinculadas",
                error: error.message 
            });
        }
    },

async verificarAccesoCiclo(req, res) {
    try {
        const { semillaId, cicloId } = req.params;
        const { step } = req.query;
        
        console.log(`🚩 [Controller] Petición recibida: Semilla=${semillaId}, Ciclo=${cicloId}, Step=${step}`);

        const idSemillaNum = Number(semillaId);
        const idCicloNum = Number(cicloId);

        if (isNaN(idSemillaNum) || isNaN(idCicloNum) || idSemillaNum <= 0 || idCicloNum <= 0) {
            console.log('🚩 [Controller] Error: IDs no válidos');
            return res.status(400).json({ status: 'error', message: 'IDs no válidos.' });
        }

        const accesoAutorizado = await expertoService.validarIntegridadParametros(idSemillaNum, idCicloNum);
        console.log(`🚩 [Controller] Resultado de validación DB: ${accesoAutorizado}`);

        if (!accesoAutorizado) {
            console.log('🚩 [Controller] Acceso denegado, enviando 403');
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        console.log('🚩 [Controller] Acceso permitido, enviando 200');
        return res.status(200).json({ status: 'success', message: 'Verificado.' });

    } catch (error) {
        console.error('🚩 [Controller] ERROR CRÍTICO:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno.' });
    }
}
};