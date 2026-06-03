import { Router } from 'express';
import { expertoController } from '../controllers/expertoTematico/semillas.controller.js';
import { testController } from '../controllers/expertoTematico/testinicial.controller.js';
import { RapsController } from '../controllers/expertoTematico/raps.controller.js';
import { cicloController } from '../controllers/expertoTematico/cicloDidactico.controller.js';

const router = Router();

// Ruta para que el experto vea sus semillas vinculadas
router.get('/mis-semillas', expertoController.listarMisSemillas);

router.post('/guardar-test', testController.crearTest);

router.get('/ver-test/:id', testController.obtenerTest);

router.put('/editar-test/:id', testController.editarTest);

router.get('/semilla/:semillaId/verificar-estado', RapsController.verificarYObtenerRaps);

// Guardar la selección manual de RAPs del experto
router.post('/semilla/:semillaId/asignar', RapsController.guardarAsignacionRaps);

router.get('/dashboard-experto', cicloController.getDashboard);

export default router;