import { Router } from 'express';
import { aprendizController } from '../controllers/aprendiz/aprendiz.controller.js';
import { diagnosticoController } from '../controllers/aprendiz/diagnostico.controller.js';
import { testIaResultadoController } from '../controllers/aprendiz/testIaResultado.controller.js';
import { cicloProgresoController } from '../controllers/aprendiz/cicloProgreso.controller.js';

const router = Router();

router.get('/mis-fichas', aprendizController.getMisFichas);
router.get('/entorno/:fichaId', aprendizController.getEntornoFicha);
router.get('/ova/:ovaId/acceso', diagnosticoController.verificarAcceso);
router.get('/recursos/:recursoId/descargar', aprendizController.descargarRecurso);
router.post('/diagnostico/:testDiagnosticoId/resultado', diagnosticoController.enviarResultado);
router.post('/test/:testId/resultado', testIaResultadoController.enviarResultado);
router.post('/ciclo/:cicloId/finalizar', cicloProgresoController.finalizarCiclo);


export default router;