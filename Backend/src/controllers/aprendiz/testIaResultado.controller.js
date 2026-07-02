import { testIaResultadoService } from '../../services/aprendiz/testIaResultadoService.js';

export const testIaResultadoController = {
    async enviarResultado(req, res) {
        try {
            const aprendizId = req.user.id;
            const { testId } = req.params;
            const { respuestas } = req.body;

            if (!Array.isArray(respuestas) || respuestas.length === 0) {
                return res.status(400).json({ ok: false, error: 'Debes enviar las respuestas del test.' });
            }

            const resultado = await testIaResultadoService.registrarResultado(aprendizId, testId, respuestas);

            return res.status(201).json({ ok: true, data: resultado });
        } catch (error) {
            console.error('Error registrando resultado de test:', error);

            if (error.message === 'TEST_NO_ENCONTRADO') {
                return res.status(404).json({ ok: false, error: 'El test no existe.' });
            }

            return res.status(500).json({ ok: false, error: 'Error interno al registrar el resultado.' });
        }
    }
};