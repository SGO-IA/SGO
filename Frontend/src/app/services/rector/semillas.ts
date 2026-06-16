import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Definimos la interfaz basada en lo que devuelve el backend
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

interface ApiResponse {
  ok: boolean;
  message: string;
  data: SemillaPendiente[];
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
}