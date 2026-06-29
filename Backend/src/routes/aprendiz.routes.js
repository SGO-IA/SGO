import { Router } from 'express';
import { aprendizController } from '../controllers/aprendiz/aprendiz.controller.js';

const router = Router();

router.get('/mis-fichas', aprendizController.getMisFichas);
router.get('/entorno/:fichaId', aprendizController.getEntornoFicha);

export default router;