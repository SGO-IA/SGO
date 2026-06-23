import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Ajusta la ruta a tu env

// ─── INTERFACES (Ayudan al tipado estricto) ─────────────────────────────────
export interface AprendizListado {
  id: number;
  nombre: string;
  correo: string;
  activo: number;
}

export interface FichaListado {
  fichaId: number;
  codigoFicha: string;
  programaNombre: string;
  totalAprendices: number;
  aprendices: AprendizListado[];
}

export interface FichasResponse {
  ok: boolean;
  message: string;
  data: FichaListado[];
}

export interface FichaPayload {
  codigo_ficha: string;
  ficha_caracterizacion: string;
  programa_id: number;
  centro_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  modalidad: string;
  correosAprendices: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FichasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coordinador`; // Ajusta el prefijo según tu env

  // Llamada al backend
  getFichasConAprendices(): Observable<FichasResponse> {
    return this.http.get<FichasResponse>(`${this.apiUrl}/fichas-aprendices`, { 
      withCredentials: true 
    });
  }

  crearFicha(payload: FichaPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/fichas`, payload, { withCredentials: true });
  }

  // Métodos para cargar los selectores del modal (Ajusta las rutas según tu backend)
  getProgramas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/programas`, { withCredentials: true });
  }

  getCentros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/centros`, { withCredentials: true });
  }
}