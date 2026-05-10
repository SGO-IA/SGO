CREATE DATABASE IF NOT EXISTS sgo;
USE sgo;

-- ==========================================
-- 1. TABLAS MAESTRAS (Nivel 0 - No dependen de nadie)
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
    rol_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL 
) ENGINE=InnoDB;

INSERT INTO roles (nombre_rol) VALUES 
('aprendiz'),
('instructor'),
('experto tematico'),
('coordinador academico'),
('admin'),
('rector');

CREATE TABLE IF NOT EXISTS centros_formacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_centro VARCHAR(10) UNIQUE NOT NULL, 
    nombre_centro VARCHAR(255) NOT NULL,      
    regional VARCHAR(100) NOT NULL            
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programas (
    programa_id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL, 
    nombre VARCHAR(255) NOT NULL, 
    denominacion TEXT NOT NULL,      
    version VARCHAR(10) NOT NULL,      
    nivel_formacion VARCHAR(100),      
    UNIQUE(codigo, version) 
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fases_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sigla VARCHAR(5) UNIQUE NOT NULL, 
    nombre_fase VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

INSERT INTO fases_proyecto (sigla, nombre_fase) VALUES 
('A', 'Análisis'),
('P', 'Planeación'),
('E', 'Ejecución'),
('EV', 'Evaluación');

-- ==========================================
-- 2. SEGURIDAD Y USUARIOS (Nivel 1)
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NULL,
    activo BOOLEAN DEFAULT TRUE, 
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(rol_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invitaciones (
    invitacion_id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255) UNIQUE NOT NULL,
    rol_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiracion DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_rol_fk FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    clave VARCHAR(50) PRIMARY KEY,
    valor TEXT NOT NULL,
    ultima_edicion_por INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_config_admin FOREIGN KEY (ultima_edicion_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ==========================================
-- 3. ESTRUCTURA PEDAGÓGICA (Nivel 2)
-- ==========================================

CREATE TABLE IF NOT EXISTS competencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programa_id INT NOT NULL, 
    codigo_norma VARCHAR(50) NOT NULL, 
    nombre TEXT NOT NULL,
    CONSTRAINT fk_comp_programa FOREIGN KEY (programa_id) REFERENCES programas(programa_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semillas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    programa_id INT NOT NULL,
    nombre_semilla VARCHAR(255),
    estado ENUM('en_construccion', 'pendiente_rector', 'aprobada', 'rechazada') DEFAULT 'en_construccion',
    CONSTRAINT fk_semilla_prog FOREIGN KEY (programa_id) REFERENCES programas(programa_id)
) ENGINE=InnoDB;

-- ==========================================
-- 4. CICLOS Y RESULTADOS (Nivel 3)
-- ==========================================

CREATE TABLE IF NOT EXISTS ovas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semilla_id INT NOT NULL,
    competencia_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Un OVA pertenece a una semilla y cubre una competencia específica
    CONSTRAINT fk_ova_semilla FOREIGN KEY (semilla_id) REFERENCES semillas(id) ON DELETE CASCADE,
    CONSTRAINT fk_ova_competencia FOREIGN KEY (competencia_id) REFERENCES competencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ciclos_didacticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ova_id INT NOT NULL, -- Ahora depende del OVA
    fase_proyecto_id INT NOT NULL,
    titulo VARCHAR(255),
    descripcion_general TEXT,
    orden INT DEFAULT 1, -- Para saber en qué orden se ven los ciclos dentro del OVA
    CONSTRAINT fk_cd_ova FOREIGN KEY (ova_id) REFERENCES ovas(id) ON DELETE CASCADE,
    CONSTRAINT fk_cd_fase_proy FOREIGN KEY (fase_proyecto_id) REFERENCES fases_proyecto(id)
) ENGINE=InnoDB;

-- Resultados de Aprendizaje (Apunta a Ciclo y Competencia)
CREATE TABLE IF NOT EXISTS resultados_aprendizaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    competencia_id INT NOT NULL, 
    ciclo_id INT DEFAULT NULL, 
    codigo_rap VARCHAR(20),      
    denominacion TEXT NOT NULL,            
    CONSTRAINT fk_comp_rap FOREIGN KEY (competencia_id) REFERENCES competencias(id) ON DELETE CASCADE,
    CONSTRAINT fk_rap_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos_didacticos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================
-- 5. COMPONENTES DEL RAP (Nivel 4)
-- ==========================================

CREATE TABLE IF NOT EXISTS conocimientos_proceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rap_id INT NOT NULL,
    descripcion TEXT, 
    CONSTRAINT fk_proc_rap FOREIGN KEY (rap_id) REFERENCES resultados_aprendizaje(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conocimientos_saber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rap_id INT NOT NULL,
    descripcion TEXT, 
    CONSTRAINT fk_saber_rap FOREIGN KEY (rap_id) REFERENCES resultados_aprendizaje(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS criterios_evaluacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rap_id INT NOT NULL,
    descripcion TEXT, 
    CONSTRAINT fk_crit_rap FOREIGN KEY (rap_id) REFERENCES resultados_aprendizaje(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- 6. EJECUCIÓN: FICHAS Y MATRÍCULAS
-- ==========================================

CREATE TABLE IF NOT EXISTS fichas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ficha VARCHAR(20) UNIQUE NOT NULL,
    ficha_caracterizacion VARCHAR(20) UNIQUE NOT NULL,
    programa_id INT NOT NULL,
    centro_id INT NOT NULL,           
    semilla_id INT DEFAULT NULL,
    fecha_inicio DATE NOT NULL,         
    fecha_fin DATE NOT NULL,         
    modalidad VARCHAR(50) NOT NULL,    
    estado_caracterizacion VARCHAR(100),
    estado ENUM('lectiva', 'productiva', 'finalizada') DEFAULT 'lectiva',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ficha_programa FOREIGN KEY (programa_id) REFERENCES programas(programa_id),
    CONSTRAINT fk_ficha_centro FOREIGN KEY (centro_id) REFERENCES centros_formacion(id),
    CONSTRAINT fk_ficha_semilla FOREIGN KEY (semilla_id) REFERENCES semillas(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expertos_semillas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experto_id INT NOT NULL,
    semilla_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rel_experto FOREIGN KEY (experto_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_semilla FOREIGN KEY (semilla_id) REFERENCES semillas(id) ON DELETE CASCADE,
    UNIQUE(experto_id, semilla_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS matriculas_aprendices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aprendiz_id INT NOT NULL,
    ficha_id INT NOT NULL,
    CONSTRAINT fk_mat_user FOREIGN KEY (aprendiz_id) REFERENCES usuarios(id),
    CONSTRAINT fk_mat_ficha FOREIGN KEY (ficha_id) REFERENCES fichas(id) ON DELETE CASCADE,
    UNIQUE(aprendiz_id, ficha_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vinculacion_instructores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    ficha_id INT NOT NULL,
    competencia_id INT NOT NULL,
    CONSTRAINT fk_vinc_inst FOREIGN KEY (instructor_id) REFERENCES usuarios(id),
    CONSTRAINT fk_vinc_ficha FOREIGN KEY (ficha_id) REFERENCES fichas(id) ON DELETE CASCADE,
    CONSTRAINT fk_vinc_comp FOREIGN KEY (competencia_id) REFERENCES competencias(id)
) ENGINE=InnoDB;

-- ==========================================
-- 7. CONTENIDOS DETALLADOS (Hijos del Ciclo)
-- ==========================================

CREATE TABLE IF NOT EXISTS ciclo_secciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciclo_id INT NOT NULL,
    tipo_seccion ENUM('Reflexion', 'Contextualizacion', 'Apropiacion', 'Transferencia') NOT NULL,
    titulo VARCHAR(255),
    contenido_html TEXT, 
    orden INT DEFAULT 1,
    CONSTRAINT fk_seccion_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclos_didacticos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recursos_r2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seccion_id INT NOT NULL,
    nombre_archivo VARCHAR(255),
    url_r2 TEXT NOT NULL, 
    tipo_archivo VARCHAR(50),
    CONSTRAINT fk_recurso_seccion FOREIGN KEY (seccion_id) REFERENCES ciclo_secciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tests_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seccion_id INT NOT NULL, 
    nombre_test VARCHAR(255),
    ponderacion DECIMAL(5,2), 
    preguntas_json JSON, 
    CONSTRAINT fk_test_seccion FOREIGN KEY (seccion_id) REFERENCES ciclo_secciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tests_diagnosticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    competencia_id INT NOT NULL,
    nombre_test VARCHAR(255) NOT NULL,
    descripcion TEXT,
    preguntas_json JSON NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_test_diag_competencia FOREIGN KEY (competencia_id) 
        REFERENCES competencias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resultados_diagnosticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_diagnostico_id INT NOT NULL,
    aprendiz_id INT NOT NULL,
    puntaje DECIMAL(5,2),
    nivel_sugerido ENUM('bajo', 'medio', 'alto') DEFAULT 'bajo',
    fecha_presentacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_diag_test FOREIGN KEY (test_diagnostico_id) 
        REFERENCES tests_diagnosticos(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_diag_aprendiz FOREIGN KEY (aprendiz_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;