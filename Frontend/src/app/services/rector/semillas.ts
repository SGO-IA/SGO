import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- INTERFACES EXISTENTES ---
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

// --- ✅ NUEVAS INTERFACES PARA EL DETALLE ---
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

@Injectable({
  providedIn: 'root'
})
export class Semillasrector {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rector`;

  getSemillasPendientes(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/semillas/pendientes`);
  }

  // ✅ NUEVA RUTA PARA EL MODAL
  getDetalleSemilla(id: number): Observable<SemillaDetalleResponse> {
    return this.http.get<SemillaDetalleResponse>(`${this.apiUrl}/semillas/${id}/detalle`);
  }
}