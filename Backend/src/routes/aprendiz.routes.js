import { Router } from 'express';
import { aprendizController } from '../controllers/aprendiz/aprendiz.controller.js';
import { diagnosticoController } from '../controllers/aprendiz/diagnostico.controller.js';

const router = Router();

router.get('/mis-fichas', aprendizController.getMisFichas);
router.get('/entorno/:fichaId', aprendizController.getEntornoFicha);
router.get('/ova/:ovaId/acceso', diagnosticoController.verificarAcceso);
router.post('/diagnostico/:testDiagnosticoId/resultado', diagnosticoController.enviarResultado);

export default router;