import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponseR2 {
  status: boolean;
  message: string;
  data: {
    id: number;
    seccionId: number;
    nombreArchivo: string;
    urlR2: string;
    tipoArchivo: string;
    keyR2: string;
  };
}

@Injectable({
  providedIn: 'root',
  })
export class R2Cloudflare {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expertoTematico`;

  private getUrlSubirRecurso(seccionId: number): string {
    return `${this.apiUrl}/secciones/${seccionId}/recursos`;
  } 

  subirArchivoACiclo(cicloId: number, tipoEtapa: string, file: File): Observable<ApiResponseR2> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('tipo_etapa', tipoEtapa);

    // Nueva ruta semántica sugerida: /api/expertoTematico/ciclos/:cicloId/recursos
    const url = `${this.apiUrl}/ciclos/${cicloId}/recursos`;

    return this.http.post<ApiResponseR2>(url, formData);
  }
}