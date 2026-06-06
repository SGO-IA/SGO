import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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
  // Traemos directamente la URL base de tu archivo de entornos
  private apiUrl = `${environment.apiUrl}/expertoTematico`;

  /**
   * Genera de forma unificada la URL semántica exacta para los recursos de una sección
   * @param seccionId ID de la sección del ciclo didáctico
   * @private Mantenlo privado si solo se usa dentro de este servicio, o público si lo necesitas en componentes.
   */
  private getUrlSubirRecurso(seccionId: number): string {
    return `${this.apiUrl}/secciones/${seccionId}/recursos`;
  } 

  /**
   * Sube un único archivo binario a la sección del ciclo didáctico actual
   * @param seccionId ID de la sección (Reflexión, Contextualización, etc.)
   * @param file Archivo obtenido del input nativo
   */
  subirArchivoASeccion(seccionId: number, file: File): Observable<ApiResponseR2> {
    const formData = new FormData();
    
    // 'archivo' hace match exacto con upload.single('archivo') de tu Node.JS
    formData.append('archivo', file);

    // Consumimos el método unificado internamente
    const url = this.getUrlSubirRecurso(seccionId);

    return this.http.post<ApiResponseR2>(url, formData);
  }
}