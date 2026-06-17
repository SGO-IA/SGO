import { Router } from 'express';
import { semillaRectorController } from '../controllers/rector/semillas.controller.js';

const router = Router();

// GET /api/rector/semillas/pendientes
router.get('/semillas/pendientes', semillaRectorController.listarPendientes);
router.get('/semillas/:id/detalle', semillaRectorController.detalleParaRevision);

export default router;