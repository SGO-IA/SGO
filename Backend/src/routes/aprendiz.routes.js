import { Router } from 'express';
import { aprendizController } from '../controllers/aprendiz/aprendiz.controller.js';

const router = Router();

router.get('/mis-fichas', aprendizController.getMisFichas);

export default router;