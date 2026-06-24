import { aprendizService } from '../../services/aprendiz/aprendizServices.js';

export const aprendizController = {
    async getMisFichas(req, res) {
        try {
            // Extraemos el ID directamente de la sesión de Passport
            const aprendizId = req.user.id;

            console.log(`🎮 [Controller] Solicitando listado de fichas para el aprendiz ID: ${aprendizId}`);
            
            const misFichas = await aprendizService.listarMisFichas(aprendizId);

            return res.status(200).json({
                ok: true,
                message: 'Fichas recuperadas exitosamente',
                data: misFichas
            });

        } catch (error) {
            console.error('❌ [Controller] Error en getMisFichas:', error);
            return res.status(500).json({
                ok: false,
                message: 'Error interno al obtener las fichas del aprendiz.'
            });
        }
    }
};