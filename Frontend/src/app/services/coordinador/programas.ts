import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ProgramasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coordinador`;

  // Para el dropdown del coordinador
  getProgramasSelector(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/selector`, { withCredentials: true });
  }

  // Para ver la "columna vertebral" antes de crear la semilla
  getEstructuraPrograma(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/estructura`, { withCredentials: true });
  }

  crearSemillaCompleta(payload: CrearSemillaPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear-semillas`, payload, { withCredentials: true });
  }

  getListaSemillas(): Observable<SemillaLista[]> {
    return this.http.get<SemillaLista[]>(`${this.apiUrl}/listar-semillas`, { withCredentials: true });
  }
}