-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: sgo
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `centros_formacion`
--

DROP TABLE IF EXISTS `centros_formacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centros_formacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_centro` varchar(10) NOT NULL,
  `nombre_centro` varchar(255) NOT NULL,
  `regional` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_centro` (`codigo_centro`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ciclo_secciones`
--

DROP TABLE IF EXISTS `ciclo_secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciclo_secciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ciclo_id` int NOT NULL,
  `tipo_seccion` enum('Reflexion','Contextualizacion','Apropiacion','Transferencia') NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `contenido_html` text,
  `orden` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_seccion_ciclo` (`ciclo_id`),
  CONSTRAINT `fk_seccion_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_didacticos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ciclos_didacticos`
--

DROP TABLE IF EXISTS `ciclos_didacticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciclos_didacticos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ova_id` int NOT NULL,
  `fase_proyecto_id` int NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion_general` text,
  `orden` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_cd_ova` (`ova_id`),
  KEY `fk_cd_fase_proy` (`fase_proyecto_id`),
  CONSTRAINT `fk_cd_fase_proy` FOREIGN KEY (`fase_proyecto_id`) REFERENCES `fases_proyecto` (`id`),
  CONSTRAINT `fk_cd_ova` FOREIGN KEY (`ova_id`) REFERENCES `ovas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competencias`
--

DROP TABLE IF EXISTS `competencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programa_id` int NOT NULL,
  `codigo_norma` varchar(50) NOT NULL,
  `nombre` text NOT NULL,
  `horas` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_comp_programa` (`programa_id`),
  CONSTRAINT `fk_comp_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `clave` varchar(50) NOT NULL,
  `valor` text NOT NULL,
  `ultima_edicion_por` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`),
  KEY `fk_config_admin` (`ultima_edicion_por`),
  CONSTRAINT `fk_config_admin` FOREIGN KEY (`ultima_edicion_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conocimientos_proceso`
--

DROP TABLE IF EXISTS `conocimientos_proceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conocimientos_proceso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rap_id` int NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`),
  KEY `fk_proc_rap` (`rap_id`),
  CONSTRAINT `fk_proc_rap` FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conocimientos_saber`
--

DROP TABLE IF EXISTS `conocimientos_saber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conocimientos_saber` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rap_id` int NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`),
  KEY `fk_saber_rap` (`rap_id`),
  CONSTRAINT `fk_saber_rap` FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `criterios_evaluacion`
--

DROP TABLE IF EXISTS `criterios_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criterios_evaluacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rap_id` int NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`),
  KEY `fk_crit_rap` (`rap_id`),
  CONSTRAINT `fk_crit_rap` FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enlaces_seccion`
--

DROP TABLE IF EXISTS `enlaces_seccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enlaces_seccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seccion_id` int NOT NULL,
  `url` text NOT NULL,
  `etiqueta` varchar(255) DEFAULT 'Recurso externo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_enlace_seccion` (`seccion_id`),
  CONSTRAINT `fk_enlace_seccion` FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expertos_raps_trabajo`
--

DROP TABLE IF EXISTS `expertos_raps_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertos_raps_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `experto_id` int NOT NULL,
  `semilla_id` int NOT NULL,
  `rap_id` int NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `experto_id` (`experto_id`,`semilla_id`,`rap_id`),
  KEY `fk_exp_rap_semilla` (`semilla_id`),
  KEY `fk_exp_rap_item` (`rap_id`),
  CONSTRAINT `fk_exp_rap_item` FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exp_rap_semilla` FOREIGN KEY (`semilla_id`) REFERENCES `semillas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exp_rap_usuario` FOREIGN KEY (`experto_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expertos_semillas`
--

DROP TABLE IF EXISTS `expertos_semillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertos_semillas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `experto_id` int NOT NULL,
  `semilla_id` int NOT NULL,
  `competencia_id` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `experto_id` (`experto_id`,`semilla_id`,`competencia_id`),
  KEY `fk_rel_semilla` (`semilla_id`),
  KEY `fk_rel_competencia` (`competencia_id`),
  CONSTRAINT `fk_rel_competencia` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rel_experto` FOREIGN KEY (`experto_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rel_semilla` FOREIGN KEY (`semilla_id`) REFERENCES `semillas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fases_proyecto`
--

DROP TABLE IF EXISTS `fases_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fases_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sigla` varchar(5) NOT NULL,
  `nombre_fase` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sigla` (`sigla`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fichas`
--

DROP TABLE IF EXISTS `fichas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fichas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_ficha` varchar(20) NOT NULL,
  `ficha_caracterizacion` varchar(20) NOT NULL,
  `programa_id` int NOT NULL,
  `centro_id` int NOT NULL,
  `semilla_id` int DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `modalidad` varchar(50) NOT NULL,
  `estado_caracterizacion` varchar(100) DEFAULT NULL,
  `estado` enum('lectiva','productiva','finalizada') DEFAULT 'lectiva',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_ficha` (`codigo_ficha`),
  UNIQUE KEY `ficha_caracterizacion` (`ficha_caracterizacion`),
  KEY `fk_ficha_programa` (`programa_id`),
  KEY `fk_ficha_centro` (`centro_id`),
  KEY `fk_ficha_semilla` (`semilla_id`),
  CONSTRAINT `fk_ficha_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros_formacion` (`id`),
  CONSTRAINT `fk_ficha_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`),
  CONSTRAINT `fk_ficha_semilla` FOREIGN KEY (`semilla_id`) REFERENCES `semillas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invitaciones`
--

DROP TABLE IF EXISTS `invitaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitaciones` (
  `invitacion_id` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invitacion_id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_inv_rol_fk` (`rol_id`),
  CONSTRAINT `fk_inv_rol_fk` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `matriculas_aprendices`
--

DROP TABLE IF EXISTS `matriculas_aprendices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matriculas_aprendices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aprendiz_id` int NOT NULL,
  `ficha_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aprendiz_id` (`aprendiz_id`,`ficha_id`),
  KEY `fk_mat_ficha` (`ficha_id`),
  CONSTRAINT `fk_mat_ficha` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mat_user` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ovas`
--

DROP TABLE IF EXISTS `ovas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ovas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semilla_id` int NOT NULL,
  `competencia_id` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ova_semilla` (`semilla_id`),
  KEY `fk_ova_competencia` (`competencia_id`),
  CONSTRAINT `fk_ova_competencia` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ova_semilla` FOREIGN KEY (`semilla_id`) REFERENCES `semillas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `programas`
--

DROP TABLE IF EXISTS `programas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programas` (
  `programa_id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `denominacion` text NOT NULL,
  `version` varchar(10) NOT NULL,
  `nivel_formacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`programa_id`),
  UNIQUE KEY `codigo` (`codigo`,`version`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recursos_r2`
--

DROP TABLE IF EXISTS `recursos_r2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recursos_r2` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seccion_id` int NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `url_r2` text NOT NULL,
  `tipo_archivo` varchar(150) DEFAULT NULL,
  `keyR2` varchar(255) DEFAULT NULL,
  `key_r2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recurso_seccion` (`seccion_id`),
  CONSTRAINT `fk_recurso_seccion` FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resultados_aprendizaje`
--

DROP TABLE IF EXISTS `resultados_aprendizaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_aprendizaje` (
  `id` int NOT NULL AUTO_INCREMENT,
  `competencia_id` int NOT NULL,
  `ciclo_id` int DEFAULT NULL,
  `codigo_rap` varchar(20) DEFAULT NULL,
  `denominacion` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comp_rap` (`competencia_id`),
  KEY `fk_rap_ciclo` (`ciclo_id`),
  CONSTRAINT `fk_comp_rap` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rap_ciclo` FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_didacticos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resultados_diagnosticos`
--

DROP TABLE IF EXISTS `resultados_diagnosticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_diagnosticos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_diagnostico_id` int NOT NULL,
  `aprendiz_id` int NOT NULL,
  `puntaje` decimal(5,2) DEFAULT NULL,
  `nivel_sugerido` enum('bajo','medio','alto') DEFAULT 'bajo',
  `fecha_presentacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_res_diag_test` (`test_diagnostico_id`),
  KEY `fk_res_diag_aprendiz` (`aprendiz_id`),
  CONSTRAINT `fk_res_diag_aprendiz` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_diag_test` FOREIGN KEY (`test_diagnostico_id`) REFERENCES `tests_diagnosticos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `rol_id` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`rol_id`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semillas`
--

DROP TABLE IF EXISTS `semillas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semillas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programa_id` int NOT NULL,
  `nombre_semilla` varchar(255) DEFAULT NULL,
  `estado` enum('en_construccion','pendiente_rector','aprobada','rechazada') DEFAULT 'en_construccion',
  PRIMARY KEY (`id`),
  KEY `fk_semilla_prog` (`programa_id`),
  CONSTRAINT `fk_semilla_prog` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tests_diagnosticos`
--

DROP TABLE IF EXISTS `tests_diagnosticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests_diagnosticos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `competencia_id` int NOT NULL,
  `nombre_test` varchar(255) NOT NULL,
  `descripcion` text,
  `preguntas_json` json NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_test_diag_competencia` (`competencia_id`),
  CONSTRAINT `fk_test_diag_competencia` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tests_ia`
--

DROP TABLE IF EXISTS `tests_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests_ia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seccion_id` int NOT NULL,
  `nombre_test` varchar(255) DEFAULT NULL,
  `ponderacion` decimal(5,2) DEFAULT NULL,
  `preguntas_json` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_test_seccion` (`seccion_id`),
  CONSTRAINT `fk_test_seccion` FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol_id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `google_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `fk_usuario_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vinculacion_instructores`
--

DROP TABLE IF EXISTS `vinculacion_instructores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vinculacion_instructores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_id` int NOT NULL,
  `ficha_id` int NOT NULL,
  `competencia_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vinc_inst` (`instructor_id`),
  KEY `fk_vinc_ficha` (`ficha_id`),
  KEY `fk_vinc_comp` (`competencia_id`),
  CONSTRAINT `fk_vinc_comp` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`),
  CONSTRAINT `fk_vinc_ficha` FOREIGN KEY (`ficha_id`) REFERENCES `fichas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vinc_inst` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-09 19:43:48
