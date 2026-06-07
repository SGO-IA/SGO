import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CicloDidacticoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expertoTematico`;

  getDashboardExperto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard-experto`);
  }

  getFasesProyecto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fases-proyecto`);
  }

  crearCiclo(data: { ova_id: number, fase_proyecto_id: number, titulo: string, descripcion_general: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ciclos/crear`, data);
  }

  verificarCiclo(ova_id: number, fase_id: number): Observable<{existe: boolean}> {
    return this.http.get<{existe: boolean}>(`${this.apiUrl}/ciclos/verificar?ova_id=${ova_id}&fase_proyecto_id=${fase_id}`);
  }
}