import { Router } from 'express';
import { instructorController } from '../controllers/instructor/instructor.controller.js';

const router = Router();

router.get('/mis-fichas', instructorController.getMisFichas);
router.get('/ficha/:fichaId/competencia/:competenciaId/ova/:ovaId/estadisticas', instructorController.getEstadisticas);
router.get('/ficha/:fichaId/competencia/:competenciaId/ova/:ovaId/analisis-ia', instructorController.getAnalisisGrupalIA);


export default router;