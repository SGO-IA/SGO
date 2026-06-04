import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class IAService {
  private http = inject(HttpClient);

  // Agregamos rapId como tercer parámetro opcional
  sugerir(prompt: string, etapa: string, rapId: number | null) {
    return this.http.post<{sugerencia: string}>(
      `${environment.apiUrl}/expertoTematico/sugerir-contenido`, 
      { prompt, etapa, rapId }
    );
  }
}