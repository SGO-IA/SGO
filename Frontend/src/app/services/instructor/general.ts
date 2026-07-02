// services/instructor/instructor-general.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OvaResumen {
  id: number;
  titulo: string;
  estado: 'en_construccion' | 'finalizado';
  activo: boolean;
}

export interface CompetenciaInstructor {
  id: number;
  codigo_norma: string;
  nombre: string;
  horas: number;
  ova: OvaResumen | null;
}

export interface SemillaResumen {
  id: number;
  nombre_semilla: string;
  estado: string;
}

export interface FichaInstructor {
  ficha_id: number;
  codigo_ficha: string;
  ficha_caracterizacion: string;
  estado_ficha: string;
  fecha_inicio: string;
  fecha_fin: string;
  modalidad: string;
  programa: { id: number; codigo: string; nombre: string; version: string; nivel_formacion: string };
  centro: { id: number; nombre_centro: string; regional: string };
  semilla: SemillaResumen | null;
  competencias: CompetenciaInstructor[];
}

export interface PanelInstructorResponse {
  ok: boolean;
  message: string;
  data: FichaInstructor[];
}

export interface TestResultadoAprendiz {
  test_id: number;
  nombre_test: string;
  fase: string;
  intentado: boolean;
  puntaje: number | null;
  aprobado: boolean;
}

export interface CicloEstadoAprendiz {
  ciclo_id: number;
  titulo: string;
  completado: boolean;
  fecha_completado: string | null;
  tests: TestResultadoAprendiz[];
}

export interface AprendizEstadistica {
  id: number;
  nombre: string;
  correo: string;
  activo: boolean;
  estado: 'completado' | 'en_progreso' | 'sin_iniciar';
  porcentajeAvance: number;
  ciclosCompletados: number;
  totalCiclos: number;
  promedioPuntaje: number | null;
  diagnostico: { puntaje: number; nivel_sugerido: string } | null;
  ciclos: CicloEstadoAprendiz[];
}

export interface EstadisticasResponse {
  ok: boolean;
  data: {
    resumen: {
      totalAprendices: number;
      completados: number;
      enProgreso: number;
      sinIniciar: number;
      promedioGeneral: number | null;
    };
    ciclos: { id: number; titulo: string; tests: any[] }[];
    aprendices: AprendizEstadistica[];
  };
}

export interface AprendizPrioritarioIA {
  nombre: string;
  motivo: string;
}

export interface AnalisisGrupalIA {
  resumen_general: string;
  patrones_comunes: string[];
  aprendices_prioritarios: AprendizPrioritarioIA[];
  recomendacion_pedagogica: string;
}

export interface AnalisisGrupalResponse {
  ok: boolean;
  data: AnalisisGrupalIA;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class InstructorGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instructor`;

  getMisFichas(): Observable<PanelInstructorResponse> {
    return this.http.get<PanelInstructorResponse>(`${this.apiUrl}/mis-fichas`, {
      withCredentials: true
    });
  }

  getEstadisticas(fichaId: number, competenciaId: number, ovaId: number): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(
      `${this.apiUrl}/ficha/${fichaId}/competencia/${competenciaId}/ova/${ovaId}/estadisticas`,
      { withCredentials: true }
    );
  }

  getAnalisisGrupalIA(fichaId: number, competenciaId: number, ovaId: number): Observable<AnalisisGrupalResponse> {
    return this.http.get<AnalisisGrupalResponse>(
      `${this.apiUrl}/ficha/${fichaId}/competencia/${competenciaId}/ova/${ovaId}/analisis-ia`
    );
  }
}