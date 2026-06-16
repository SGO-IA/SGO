import { Router } from 'express';
import { semillaRectorController } from '../controllers/rector/semillas.controller.js';

const router = Router();

// GET /api/rector/semillas/pendientes
router.get('/semillas/pendientes', semillaRectorController.listarPendientes);

export default router;