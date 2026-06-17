import { Router } from 'express';
import { recursoController } from '../controllers/recursos/recursos.controller.js';

const router = Router();

router.head('/descargar/:id', recursoController.verificarArchivo);
router.get('/descargar/:id', recursoController.descargarArchivo);

export default router;