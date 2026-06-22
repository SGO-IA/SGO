import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface SemillaPendiente {
  semilla_id: number;
  nombre_semilla: string;
  estado: string;
  programa_id: number;
  programa_nombre: string;
  programa_codigo: string;
  programa_version: string;
  nivel_formacion: string;
  total_ovas: number;
  etiqueta_programa: string;
}

export interface ApiResponse {
  ok: boolean;
  message: string;
  data: SemillaPendiente[];
}

export interface ExpertoDetalle {
  experto_id: number;
  experto_nombre: string;
  experto_correo: string;
}

export interface OvaDetalle {
  ova_id: number;
  ova_titulo: string;
  ova_estado: string;
  codigo_norma: string;
  competencia_nombre: string;
}

export interface SemillaRadiografia {
  semilla_id: number;
  nombre_semilla: string;
  estado: string;
  programa_nombre: string;
  programa_codigo: string;
  programa_version: string;
  nivel_formacion: string;
  etiqueta_programa: string;
  total_expertos: number;
  expertos: ExpertoDetalle[];
  total_ovas: number;
  ovas: OvaDetalle[];
}

export interface SemillaDetalleResponse {
  ok: boolean;
  message: string;
  data: SemillaRadiografia;
}

export interface OvaDrillDown {
  ova_id: number;
  ova_titulo: string;
  ova_estado: string;
  codigo_norma: string;
  competencia_nombre: string;
  total_ciclos: number;
}

export interface CicloDrillDown {
  ciclo_id: number;
  ciclo_titulo: string;
  estado: string;
  descripcion_general: string;
  nombre_fase: string;
  sigla: string;
}

export interface TestLectura {
  nombre: string;
  ponderacion: number;
  preguntas: any;
}

export interface EnlaceLectura {
  id: number;
  url: string;
  etiqueta: string;
}

export interface RecursoLectura {
  id: number;
  nombre_archivo: string;
  url_r2: string;
  tipo_archivo: string;
}

export interface SeccionLectura {
  seccion_id: number;
  tipo_seccion: string;
  titulo: string;
  contenido_html: string | null;
  test: TestLectura | null;
  enlaces: EnlaceLectura[];
  recursos: RecursoLectura[];
}

export interface CicloLectura {
  ciclo_id: number;
  ciclo_titulo: string;
  descripcion_general: string;
  nombre_fase: string;
  ova_titulo: string;
  secciones: SeccionLectura[];
}

export interface OvasResponse {
  ok: boolean;
  data: OvaDrillDown[];
}

export interface CiclosResponse {
  ok: boolean;
  data: CicloDrillDown[];
}

export interface LecturaResponse {
  ok: boolean;
  data: CicloLectura;
}

@Injectable({
  providedIn: 'root'
})
export class Semillasrector {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rector`;
  
  getSemillasPendientes(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/semillas/pendientes`);
  }

  getDetalleSemilla(id: number): Observable<SemillaDetalleResponse> {
    return this.http.get<SemillaDetalleResponse>(`${this.apiUrl}/semillas/${id}/detalle`);
  }

  getOvasPorSemilla(semillaId: number): Observable<OvasResponse> {
    return this.http.get<OvasResponse>(`${this.apiUrl}/semillas/${semillaId}/ovas`);
  }

  getCiclosPorOva(ovaId: number): Observable<CiclosResponse> {
    return this.http.get<CiclosResponse>(`${this.apiUrl}/ovas/${ovaId}/ciclos`);
  }

  getModoLecturaCiclo(cicloId: number): Observable<LecturaResponse> {
    return this.http.get<LecturaResponse>(`${this.apiUrl}/ciclos/${cicloId}/lectura`);
  }

  actualizarEstado(id: number, estado: string, comentario?: string): Observable<any> {
    // Cambia "/recursos/" por "/rector/"
    return this.http.put(`${environment.apiUrl}/rector/semillas/${id}/estado`, { 
      estado, 
      comentario 
    });
  }
}