import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  verificarCiclo(ova_id: number, fase_id: number): Observable<{ existe: boolean; ciclo_id?: number }> {
      return this.http.get<{ existe: boolean; ciclo_id?: number }>(
          `${this.apiUrl}/ciclos/verificar?ova_id=${ova_id}&fase_proyecto_id=${fase_id}`
      );
  }

  getCiclosPorOva(ova_id: number): Observable<{ status: string; data: any[] }> {
      return this.http.get<{ status: string; data: any[] }>(
          `${this.apiUrl}/ciclos/ova/${ova_id}`
      );
  }

  guardarEtapa(cicloId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ciclos/${cicloId}/secciones`, payload);
  }

  subirRecurso(identificador: number | string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<any>(`${this.apiUrl}/secciones/${identificador}/recursos`, formData);
  }

  cargarEtapa(cicloId: number, tipoEtapa: string): Observable<any> {
    // Ejemplo de uso: cargarEtapa(7, 'Reflexión Inicial')
    return this.http.get<any>(`${this.apiUrl}/ciclos/${cicloId}/secciones?tipo_etapa=${tipoEtapa}`);
  }

  eliminarRecurso(seccionId: number, recursoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/secciones/${seccionId}/recursos/${recursoId}`);
  }

  eliminarEnlace(seccionId: number, enlaceId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/secciones/${seccionId}/enlaces/${enlaceId}`);
  }

    getEstadoCiclo(cicloId: number): Observable<{
    ok: boolean;
    data: {
      cicloId: number;
      listo_para_finalizar: boolean;
      tiene_todas_las_etapas: boolean;
      secciones: {
        seccion_id: number;
        tipo_seccion: string;
        titulo: string;
        necesita_test: boolean;
        tiene_test: boolean;
        completa: boolean;
      }[];
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/ciclos/${cicloId}/estado`);
  }

  // Finaliza el ciclo didáctico (el experto presiona "Terminar")
  // POST /expertoTematico/ciclos/:cicloId/finalizar
  finalizarCiclo(cicloId: number): Observable<{
    ok: boolean;
    mensaje: string;
    data: { cicloId: number; finalizado: boolean };
  }> {
    return this.http.post<any>(`${this.apiUrl}/ciclos/${cicloId}/finalizar`, {});
  }
}