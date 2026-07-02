import { diagnosticoService } from '../../services/aprendiz/diagnosticoService.js';

export const diagnosticoController = {
async verificarAcceso(req, res) {
    try {
        const aprendizId = req.user.id; // 🔧 antes: req.usuario.id
        const { ovaId } = req.params;

        const resultado = await diagnosticoService.verificarAccesoOva(aprendizId, ovaId);

        return res.status(200).json({
            ok: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error verificando acceso a OVA:', error);

        if (error.message === 'OVA_NO_ENCONTRADA') {
            return res.status(404).json({ ok: false, error: 'La OVA solicitada no existe.' });
        }

        return res.status(500).json({ ok: false, error: 'Error interno al verificar el acceso.' });
    }
},

async enviarResultado(req, res) {
    try {
        const aprendizId = req.user.id; // 🔧 antes: req.usuario.id
        const { testDiagnosticoId } = req.params;
        const { respuestas } = req.body;

        if (!Array.isArray(respuestas) || respuestas.length === 0) {
            return res.status(400).json({ ok: false, error: 'Debes enviar las respuestas del test.' });
        }

        const resultado = await diagnosticoService.registrarResultadoDiagnostico(
            aprendizId, testDiagnosticoId, respuestas
        );

        return res.status(201).json({
            ok: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error registrando resultado diagnóstico:', error);

        if (error.message === 'TEST_DIAGNOSTICO_NO_ENCONTRADO') {
            return res.status(404).json({ ok: false, error: 'El test diagnóstico no existe.' });
        }

        return res.status(500).json({ ok: false, error: 'Error interno al registrar el resultado.' });
    }
}
};