import { Router } from 'express';
import { programaController } from '../controllers/coordinador/programa.controller.js';
import { expertoController } from '../controllers/coordinador/expertos.controller.js';
import { semillaController } from '../controllers/coordinador/semillas.controller.js';

const router = Router();

// Endpoint para el selector inicial del coordinador
router.get('/selector', programaController.listar);

// Endpoint para traer competencias/raps al seleccionar un programa
router.get('/:id/estructura', programaController.detalleEstructura);

router.get('/expertos', expertoController.listarExpertos);

router.post('/crear-semillas', semillaController.crearSemillaCompleta);
router.get('/listar-semillas', semillaController.obtenerTodasLasSemillas);

export default router;