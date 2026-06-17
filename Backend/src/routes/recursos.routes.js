import { Router } from 'express';
import { recursoController } from '../controllers/recursos/recursos.controller.js';

const router = Router();

// Endpoint público o protegido (puedes añadirle tus middlewares de sesión aquí en medio)
router.get('/descargar/:id', recursoController.descargarArchivo);

export default router;