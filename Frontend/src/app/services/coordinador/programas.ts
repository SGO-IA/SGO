import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearSemillaPayload {
  programa_id: number;
  nombre_semilla: string;
  expertos: { [key: number]: number[] };
}

export interface SemillaLista {
  semilla_id: number;
  nombre_semilla: string;
  estado: 'en_construccion' | 'pendiente_rector' | 'aprobada' | 'rechazada';
  programa_id: number;
  programa_nombre: string;
  programa_codigo: string;
  programa_version: number;
}

export interface SemillaBanco {
  id: number;
  nombre_semilla: string;
  estado: string;
  programa_nombre: string;
  programa_codigo: string;
  programa_id: number;
}

export interface InstructorVinculacion {
  instructorId: number;
  competenciaId: number;
}

export interface DuplicarSemillaPayload {
  semillaOrigenId: number;
  fichaId: number;
  instructores: InstructorVinculacion[];
  correosAprendices: string[];
}

export interface DuplicarSemillaResponse {
  ok: boolean;
  message: string;
  data: {
    nuevaSemillaId: number;
    fichaId: number;
    resumenAprendices: {
      total: number;
      creados: number;
      matriculados: number;
    };
  };
}

export interface FichaSelector {
  id: number;
  codigo_ficha: string;
  ficha_caracterizacion: string;
  programa_id: number;
  estado: string;
  semilla_id: number | null;
}

export interface InstructorSelector {
  id: number;
  nombre: string;
  correo: string;
}

export interface CompetenciaSelector {
  id: number;
  nombre: string;
  codigo_norma: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProgramasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coordinador`;

  // ─── Existentes ────────────────────────────────────────────────────────────

  getProgramasSelector(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/selector`, { withCredentials: true });
  }

  getEstructuraPrograma(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/estructura`, { withCredentials: true });
  }

  crearSemillaCompleta(payload: CrearSemillaPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear-semillas`, payload, { withCredentials: true });
  }

  getListaSemillas(): Observable<SemillaLista[]> {
    return this.http.get<SemillaLista[]>(`${this.apiUrl}/listar-semillas`, { withCredentials: true });
  }

  getDetalleCompletoSemilla(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/semillas/${id}/detalle-completo`, { withCredentials: true });
  }
  
  /** GET /api/coordinador/semillas/banco — semillas aprobadas disponibles */
  getBancoSemillas(): Observable<SemillaBanco[]> {
    return this.http.get<SemillaBanco[]>(`${this.apiUrl}/semillas/banco`, { withCredentials: true });
  }

  /** POST /api/coordinador/semillas/duplicar */
  duplicarSemilla(payload: DuplicarSemillaPayload): Observable<DuplicarSemillaResponse> {
    return this.http.post<DuplicarSemillaResponse>(
      `${this.apiUrl}/semillas/duplicar`,
      payload,
      { withCredentials: true }
    );
  }

  // ─── Selectores para el modal ──────────────────────────────────────────────

  /** Fichas disponibles (sin semilla vinculada) del mismo programa */
  getFichasPorPrograma(programaId: number): Observable<FichaSelector[]> {
    return this.http.get<FichaSelector[]>(
      `${this.apiUrl}/fichas?programaId=${programaId}&sinSemilla=true`,
      { withCredentials: true }
    );
  }

  /** Instructores disponibles para asignar */
  getInstructores(): Observable<InstructorSelector[]> {
    return this.http.get<InstructorSelector[]>(
      `${this.apiUrl}/instructores`,
      { withCredentials: true }
    );
  }

  /** Competencias de un programa */
  getCompetenciasPorPrograma(programaId: number): Observable<CompetenciaSelector[]> {
    return this.http.get<CompetenciaSelector[]>(
      `${this.apiUrl}/programas/${programaId}/competencias`,
      { withCredentials: true }
    );
  }
}