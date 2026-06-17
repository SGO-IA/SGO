import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecursoService {
  private http = inject(HttpClient);
  
  private baseUrl = `${environment.apiUrl}/recursos`;
  descargarRecurso(id: number): Observable<Blob> {
    const url = `${this.baseUrl}/descargar/${id}`;
    
    // Es vital configurar el responseType como 'blob' para recibir archivos binarios
    return this.http.get(url, { responseType: 'blob' });
  }

  obtenerUrlDescargaDirecta(id: number): string {
    return `${this.baseUrl}/descargar/${id}`;
  }
}