import { Router } from 'express';
import multer from 'multer';

import { expertoController } from '../controllers/expertoTematico/semillas.controller.js';
import { testController } from '../controllers/expertoTematico/testinicial.controller.js';
import { RapsController } from '../controllers/expertoTematico/raps.controller.js';
import { cicloController } from '../controllers/expertoTematico/cicloDidactico.controller.js';
import { IAController } from '../controllers/expertoTematico/ia.controller.js';
import { materialController } from '../controllers/expertoTematico/r2.controller.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Ruta para que el experto vea sus semillas vinculadas
router.get('/mis-semillas', expertoController.listarMisSemillas);

router.post('/guardar-test', testController.crearTest);

router.get('/ver-test/:id', testController.obtenerTest);

router.put('/editar-test/:id', testController.editarTest);

router.get('/semilla/:semillaId/verificar-estado', RapsController.verificarYObtenerRaps);

router.post('/semilla/:semillaId/asignar', RapsController.guardarAsignacionRaps);

router.get('/dashboard-experto', cicloController.getDashboard);

router.get('/fases-proyecto', cicloController.getFases);

router.post('/sugerir-contenido', IAController.generarSugerencia);

router.get('/semillas/:semillaId/ciclos-didacticos/:cicloId/verificar-acceso', expertoController.verificarAccesoCiclo);

router.get('/ciclos/verificar', cicloController.verificar);

router.post('/ciclos/crear', cicloController.crear);

router.get('/ciclos/ova/:ova_id', cicloController.getCiclosPorOva);

router.post('/ciclos/:cicloId/secciones', cicloController.guardarEtapa);

router.get('/ciclos/:cicloId/secciones', cicloController.obtenerEtapa);

router.post('/secciones/:seccionId/recursos', upload.single('archivo'), materialController.uploadRecurso);

router.delete('/secciones/:seccionId/recursos/:recursoId', materialController.deleteRecurso);

router.delete('/secciones/:seccionId/enlaces/:enlaceId', cicloController.deleteEnlace);

export default router;