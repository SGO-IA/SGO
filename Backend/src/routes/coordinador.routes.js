import { Router } from 'express';
import { programaController } from '../controllers/coordinador/programa.controller.js';
import { expertoController } from '../controllers/coordinador/expertos.controller.js';
import { semillaController } from '../controllers/coordinador/semillas.controller.js';
import { selectoresController } from '../controllers/coordinador/selectores.controller.js';

const router = Router();

// Endpoint para el selector inicial del coordinador
router.get('/selector', programaController.listar);

// Endpoint para traer competencias/raps al seleccionar un programa
router.get('/:id/estructura', programaController.detalleEstructura);

router.get('/expertos', expertoController.listarExpertos);

router.post('/crear-semillas', semillaController.crearSemillaCompleta);
router.get('/listar-semillas', semillaController.obtenerTodasLasSemillas);
router.get('/semillas/:id/detalle-completo', semillaController.obtenerDetalleSemilla);

router.get('/banco', semillaController.obtenerBanco);
router.post('/semillas/duplicar', semillaController.duplicarSemilla);

router.get('/fichas', selectoresController.getFichas);
router.get('/instructores', selectoresController.getInstructores);
router.get('/programas/:programaId/competencias', selectoresController.getCompetencias);


export default router;