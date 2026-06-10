// Protocolo SGO-Layered: Controller
import { TestIAService } from '../../services/expertoTematico/TestIAService.js';

export const TestIAController = {
    // Endpoint 1: Pide a la IA que genere el JSON (No lo guarda, solo lo devuelve al Frontend)
    generarTest: async (req, res) => {
        try {
            const { contexto, instruccion, duracion } = req.body;

            if (!contexto) {
                return res.status(400).json({ status: 'error', message: 'Falta el contexto técnico.' });
            }

            const testGenerado = await TestIAService.generarTestConClaude(contexto, instruccion, duracion);
            
            return res.status(200).json({
                status: 'success',
                message: 'Evaluación generada correctamente.',
                data: testGenerado
            });
        } catch (error) {
            console.error('❌ Error en generarTest Controller:', error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // Endpoint 2: Guarda el JSON validado y revisado por el instructor en la base de datos
    guardarTest: async (req, res) => {
        try {
            const seccionId = Number(req.params.seccionId);
            const payloadTest = req.body;

            if (isNaN(seccionId) || seccionId <= 0) {
                return res.status(400).json({ status: 'error', message: 'ID de sección inválido.' });
            }

            if (!payloadTest.preguntas || !Array.isArray(payloadTest.preguntas)) {
                return res.status(400).json({ status: 'error', message: 'Estructura de test inválida.' });
            }

            const resultado = await TestIAService.procesarGuardadoTest(seccionId, payloadTest);

            return res.status(200).json({
                status: 'success',
                message: 'Evaluación persistida exitosamente.',
                data: resultado
            });
        } catch (error) {
            console.error('❌ Error en guardarTest Controller:', error);
            return res.status(500).json({ status: 'error', message: 'Error interno en base de datos.' });
        }
    }
};