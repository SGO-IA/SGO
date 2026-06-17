import { Router } from 'express';
import { semillaRectorController } from '../controllers/rector/semillas.controller.js';

const router = Router();

// GET /api/rector/semillas/pendientes
router.get('/semillas/pendientes', semillaRectorController.listarPendientes);
router.get('/semillas/:id/detalle', semillaRectorController.detalleParaRevision);
router.get('/semillas/:semillaId/ovas', semillaRectorController.getOvasPorSemilla);
router.get('/ovas/:ovaId/ciclos', semillaRectorController.getCiclosPorOva);
router.get('/ciclos/:cicloId/lectura', semillaRectorController.getModoLecturaCiclo);

export default router;