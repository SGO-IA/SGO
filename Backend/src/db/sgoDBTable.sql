-- ============================================================
--  SGO — Script de creación de tablas
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- roles
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `rol_id`     INT         NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`rol_id`),
  UNIQUE KEY `uq_nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- usuarios
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `rol_id`     INT          NOT NULL,
  `nombre`     VARCHAR(100) NOT NULL,
  `correo`     VARCHAR(150) NOT NULL,
  `contrasena` VARCHAR(255)          DEFAULT NULL,
  `activo`     TINYINT(1)            DEFAULT '1',
  `google_id`  VARCHAR(255)          DEFAULT NULL,
  `created_at` TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_correo`    (`correo`),
  UNIQUE KEY `uq_google_id` (`google_id`),
  KEY `fk_usuario_rol` (`rol_id`),
  CONSTRAINT `fk_usuario_rol`
    FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- configuracion_sistema
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `configuracion_sistema`;
CREATE TABLE `configuracion_sistema` (
  `clave`              VARCHAR(50) NOT NULL,
  `valor`              TEXT        NOT NULL,
  `ultima_edicion_por` INT                  DEFAULT NULL,
  `updated_at`         TIMESTAMP            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`),
  KEY `fk_config_admin` (`ultima_edicion_por`),
  CONSTRAINT `fk_config_admin`
    FOREIGN KEY (`ultima_edicion_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- invitaciones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `invitaciones`;
CREATE TABLE `invitaciones` (
  `invitacion_id` INT          NOT NULL AUTO_INCREMENT,
  `correo`        VARCHAR(255) NOT NULL,
  `rol_id`        INT          NOT NULL,
  `token`         VARCHAR(255) NOT NULL,
  `expiracion`    DATETIME     NOT NULL,
  `usado`         TINYINT(1)            DEFAULT '0',
  `created_at`    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invitacion_id`),
  UNIQUE KEY `uq_inv_correo` (`correo`),
  KEY `fk_inv_rol_fk` (`rol_id`),
  CONSTRAINT `fk_inv_rol_fk`
    FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- centros_formacion
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `centros_formacion`;
CREATE TABLE `centros_formacion` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `codigo_centro` VARCHAR(10)  NOT NULL,
  `nombre_centro` VARCHAR(255) NOT NULL,
  `regional`      VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo_centro` (`codigo_centro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- programas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `programas`;
CREATE TABLE `programas` (
  `programa_id`     INT          NOT NULL AUTO_INCREMENT,
  `codigo`          VARCHAR(20)  NOT NULL,
  `nombre`          VARCHAR(255) NOT NULL,
  `denominacion`    TEXT         NOT NULL,
  `version`         VARCHAR(10)  NOT NULL,
  `nivel_formacion` VARCHAR(100)          DEFAULT NULL,
  PRIMARY KEY (`programa_id`),
  UNIQUE KEY `uq_codigo_version` (`codigo`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- semillas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `semillas`;
CREATE TABLE `semillas` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `programa_id`   INT          NOT NULL,
  `nombre_semilla` VARCHAR(255)          DEFAULT NULL,
  `estado`        ENUM('en_construccion','pendiente_rector','aprobada','rechazada')
                               DEFAULT 'en_construccion',
  PRIMARY KEY (`id`),
  KEY `fk_semilla_prog` (`programa_id`),
  CONSTRAINT `fk_semilla_prog`
    FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- fichas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `fichas`;
CREATE TABLE `fichas` (
  `id`                     INT         NOT NULL AUTO_INCREMENT,
  `codigo_ficha`           VARCHAR(20) NOT NULL,
  `ficha_caracterizacion`  VARCHAR(20) NOT NULL,
  `programa_id`            INT         NOT NULL,
  `centro_id`              INT         NOT NULL,
  `semilla_id`             INT                  DEFAULT NULL,
  `fecha_inicio`           DATE        NOT NULL,
  `fecha_fin`              DATE        NOT NULL,
  `modalidad`              VARCHAR(50) NOT NULL,
  `estado_caracterizacion` VARCHAR(100)         DEFAULT NULL,
  `estado`                 ENUM('lectiva','productiva','finalizada')
                                               DEFAULT 'lectiva',
  `created_at`             TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo_ficha`          (`codigo_ficha`),
  UNIQUE KEY `uq_ficha_caracterizacion` (`ficha_caracterizacion`),
  KEY `fk_ficha_programa` (`programa_id`),
  KEY `fk_ficha_centro`   (`centro_id`),
  KEY `fk_ficha_semilla`  (`semilla_id`),
  CONSTRAINT `fk_ficha_programa`
    FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`),
  CONSTRAINT `fk_ficha_centro`
    FOREIGN KEY (`centro_id`)   REFERENCES `centros_formacion` (`id`),
  CONSTRAINT `fk_ficha_semilla`
    FOREIGN KEY (`semilla_id`)  REFERENCES `semillas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- competencias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `competencias`;
CREATE TABLE `competencias` (
  `id`           INT         NOT NULL AUTO_INCREMENT,
  `programa_id`  INT         NOT NULL,
  `codigo_norma` VARCHAR(50) NOT NULL,
  `nombre`       TEXT        NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comp_programa` (`programa_id`),
  CONSTRAINT `fk_comp_programa`
    FOREIGN KEY (`programa_id`) REFERENCES `programas` (`programa_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- expertos_semillas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `expertos_semillas`;
CREATE TABLE `expertos_semillas` (
  `id`               INT       NOT NULL AUTO_INCREMENT,
  `experto_id`       INT       NOT NULL,
  `semilla_id`       INT       NOT NULL,
  `competencia_id`   INT       NOT NULL,
  `fecha_asignacion` TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_experto_semilla_comp` (`experto_id`, `semilla_id`, `competencia_id`),
  KEY `fk_rel_semilla`    (`semilla_id`),
  KEY `fk_rel_competencia`(`competencia_id`),
  CONSTRAINT `fk_rel_experto`
    FOREIGN KEY (`experto_id`)     REFERENCES `usuarios`     (`id`)     ON DELETE CASCADE,
  CONSTRAINT `fk_rel_semilla`
    FOREIGN KEY (`semilla_id`)     REFERENCES `semillas`     (`id`)     ON DELETE CASCADE,
  CONSTRAINT `fk_rel_competencia`
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- matriculas_aprendices
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `matriculas_aprendices`;
CREATE TABLE `matriculas_aprendices` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `aprendiz_id` INT NOT NULL,
  `ficha_id`    INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_aprendiz_ficha` (`aprendiz_id`, `ficha_id`),
  KEY `fk_mat_ficha` (`ficha_id`),
  CONSTRAINT `fk_mat_user`
    FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_mat_ficha`
    FOREIGN KEY (`ficha_id`)    REFERENCES `fichas`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- vinculacion_instructores
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `vinculacion_instructores`;
CREATE TABLE `vinculacion_instructores` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `instructor_id`  INT NOT NULL,
  `ficha_id`       INT NOT NULL,
  `competencia_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_vinc_inst` (`instructor_id`),
  KEY `fk_vinc_ficha`(`ficha_id`),
  KEY `fk_vinc_comp` (`competencia_id`),
  CONSTRAINT `fk_vinc_inst`
    FOREIGN KEY (`instructor_id`)  REFERENCES `usuarios`     (`id`),
  CONSTRAINT `fk_vinc_ficha`
    FOREIGN KEY (`ficha_id`)       REFERENCES `fichas`       (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vinc_comp`
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- fases_proyecto
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `fases_proyecto`;
CREATE TABLE `fases_proyecto` (
  `id`          INT         NOT NULL AUTO_INCREMENT,
  `sigla`       VARCHAR(5)  NOT NULL,
  `nombre_fase` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sigla` (`sigla`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO fases_proyecto (sigla, nombre_fase) VALUES 
('AN', 'Análisis'),
('PL', 'Planeación'),
('EJ', 'Ejecución'),
('EV', 'Evaluación');

-- ------------------------------------------------------------
-- ovas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `ovas`;
CREATE TABLE `ovas` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `semilla_id`     INT          NOT NULL,
  `competencia_id` INT          NOT NULL,
  `titulo`         VARCHAR(255) NOT NULL,
  `descripcion`    TEXT                  DEFAULT NULL,
  `activo`         TINYINT(1)            DEFAULT '1',
  `created_at`     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ova_semilla`    (`semilla_id`),
  KEY `fk_ova_competencia`(`competencia_id`),
  CONSTRAINT `fk_ova_semilla`
    FOREIGN KEY (`semilla_id`)     REFERENCES `semillas`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ova_competencia`
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- ciclos_didacticos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `ciclos_didacticos`;
CREATE TABLE `ciclos_didacticos` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `ova_id`           INT          NOT NULL,
  `fase_proyecto_id` INT          NOT NULL,
  `titulo`           VARCHAR(255)          DEFAULT NULL,
  `descripcion_general` TEXT               DEFAULT NULL,
  `orden`            INT                   DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_cd_ova`       (`ova_id`),
  KEY `fk_cd_fase_proy` (`fase_proyecto_id`),
  CONSTRAINT `fk_cd_ova`
    FOREIGN KEY (`ova_id`)           REFERENCES `ovas`           (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cd_fase_proy`
    FOREIGN KEY (`fase_proyecto_id`) REFERENCES `fases_proyecto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- ciclo_secciones
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `ciclo_secciones`;
CREATE TABLE `ciclo_secciones` (
  `id`            INT  NOT NULL AUTO_INCREMENT,
  `ciclo_id`      INT  NOT NULL,
  `tipo_seccion`  ENUM('Reflexion','Contextualizacion','Apropiacion','Transferencia') NOT NULL,
  `titulo`        VARCHAR(255) DEFAULT NULL,
  `contenido_html` TEXT        DEFAULT NULL,
  `orden`         INT          DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_seccion_ciclo` (`ciclo_id`),
  CONSTRAINT `fk_seccion_ciclo`
    FOREIGN KEY (`ciclo_id`) REFERENCES `ciclos_didacticos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `enlaces_seccion` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `seccion_id` INT NOT NULL,
  `url`        TEXT NOT NULL,
  `etiqueta`   VARCHAR(255) DEFAULT 'Recurso externo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_enlace_seccion` (`seccion_id`),
  CONSTRAINT `fk_enlace_seccion`
    FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- recursos_r2
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `recursos_r2`;
CREATE TABLE `recursos_r2` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `seccion_id`     INT          NOT NULL,
  `nombre_archivo` VARCHAR(255)          DEFAULT NULL,
  `url_r2`         TEXT         NOT NULL,
  `tipo_archivo`   VARCHAR(50)           DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recurso_seccion` (`seccion_id`),
  CONSTRAINT `fk_recurso_seccion`
    FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- tests_ia
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tests_ia`;
CREATE TABLE `tests_ia` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `seccion_id`   INT           NOT NULL,
  `nombre_test`  VARCHAR(255)           DEFAULT NULL,
  `ponderacion`  DECIMAL(5,2)           DEFAULT NULL,
  `preguntas_json` JSON                 DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_test_seccion` (`seccion_id`),
  CONSTRAINT `fk_test_seccion`
    FOREIGN KEY (`seccion_id`) REFERENCES `ciclo_secciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- resultados_aprendizaje
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `resultados_aprendizaje`;
CREATE TABLE `resultados_aprendizaje` (
  `id`             INT         NOT NULL AUTO_INCREMENT,
  `competencia_id` INT         NOT NULL,
  `ciclo_id`       INT                  DEFAULT NULL,
  `codigo_rap`     VARCHAR(20)          DEFAULT NULL,
  `denominacion`   TEXT        NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comp_rap` (`competencia_id`),
  KEY `fk_rap_ciclo`(`ciclo_id`),
  CONSTRAINT `fk_comp_rap`
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rap_ciclo`
    FOREIGN KEY (`ciclo_id`)       REFERENCES `ciclos_didacticos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- conocimientos_proceso
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `conocimientos_proceso`;
CREATE TABLE `conocimientos_proceso` (
  `id`          INT  NOT NULL AUTO_INCREMENT,
  `rap_id`      INT  NOT NULL,
  `descripcion` TEXT          DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_proc_rap` (`rap_id`),
  CONSTRAINT `fk_proc_rap`
    FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- conocimientos_saber
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `conocimientos_saber`;
CREATE TABLE `conocimientos_saber` (
  `id`          INT  NOT NULL AUTO_INCREMENT,
  `rap_id`      INT  NOT NULL,
  `descripcion` TEXT          DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_saber_rap` (`rap_id`),
  CONSTRAINT `fk_saber_rap`
    FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- criterios_evaluacion
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `criterios_evaluacion`;
CREATE TABLE `criterios_evaluacion` (
  `id`          INT  NOT NULL AUTO_INCREMENT,
  `rap_id`      INT  NOT NULL,
  `descripcion` TEXT          DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_crit_rap` (`rap_id`),
  CONSTRAINT `fk_crit_rap`
    FOREIGN KEY (`rap_id`) REFERENCES `resultados_aprendizaje` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- tests_diagnosticos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `tests_diagnosticos`;
CREATE TABLE `tests_diagnosticos` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `competencia_id` INT          NOT NULL,
  `nombre_test`    VARCHAR(255) NOT NULL,
  `descripcion`    TEXT                  DEFAULT NULL,
  `preguntas_json` JSON         NOT NULL,
  `activo`         TINYINT(1)            DEFAULT '1',
  `created_at`     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_test_diag_competencia` (`competencia_id`),
  CONSTRAINT `fk_test_diag_competencia`
    FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- resultados_diagnosticos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `resultados_diagnosticos`;
CREATE TABLE `resultados_diagnosticos` (
  `id`                  INT            NOT NULL AUTO_INCREMENT,
  `test_diagnostico_id` INT            NOT NULL,
  `aprendiz_id`         INT            NOT NULL,
  `puntaje`             DECIMAL(5,2)            DEFAULT NULL,
  `nivel_sugerido`      ENUM('bajo','medio','alto') DEFAULT 'bajo',
  `fecha_presentacion`  TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_res_diag_test`     (`test_diagnostico_id`),
  KEY `fk_res_diag_aprendiz` (`aprendiz_id`),
  CONSTRAINT `fk_res_diag_test`
    FOREIGN KEY (`test_diagnostico_id`) REFERENCES `tests_diagnosticos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_diag_aprendiz`
    FOREIGN KEY (`aprendiz_id`)         REFERENCES `usuarios`           (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
--  Fin del script
-- ============================================================