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
    },

    async getEntornoFicha(req, res) {
        try {
            const aprendizId = req.user.id;
            const { fichaId } = req.params;

            console.log(`🎮 [Controller] Construyendo entorno de ficha ${fichaId} para aprendiz ID: ${aprendizId}`);
            
            const entornoData = await aprendizService.obtenerEntornoFicha(aprendizId, fichaId);

            return res.status(200).json({
                ok: true,
                message: 'Entorno de aprendizaje cargado',
                data: entornoData
            });

        } catch (error) {
            console.error('❌ [Controller] Error en getEntornoFicha:', error);
            
            if (error.message === 'ACCESO_DENEGADO') {
                return res.status(403).json({
                    ok: false,
                    message: 'No tienes autorización para acceder al entorno de esta ficha.'
                });
            }

            return res.status(500).json({
                ok: false,
                message: 'Error interno al construir el entorno.'
            });
        }
    }
};