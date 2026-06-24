import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FichaAprendiz {
  ficha_id: number;
  codigo_ficha: string;
  estado_ficha: string;
  fecha_inicio: string;
  fecha_fin: string;
  modalidad: string;
  nombre_programa: string;
  nivel_formacion: string;
}

export interface FichasAprendizResponse {
  ok: boolean;
  message: string;
  data: FichaAprendiz[];
}

// ────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class AprendizGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aprendiz`;

  getMisFichas(): Observable<FichasAprendizResponse> {
    return this.http.get<FichasAprendizResponse>(`${this.apiUrl}/mis-fichas`, { 
      withCredentials: true 
    });
  }
}