import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IAService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/expertoTematico`;

  // Tu método actual para generar contenido pedagógico
  sugerir(prompt: string, etapa: string, rapId: number | null) {
    return this.http.post<{sugerencia: string}>(
      `${this.baseUrl}/sugerir-contenido`, 
      { prompt, etapa, rapId }
    );
  }

  // NUEVO: Generar evaluación (Test)
  generarTest(contexto: string, instruccion: string, duracion: number) {
    return this.http.post<{status: string, data: any}>(
      `${this.baseUrl}/secciones/evaluacion/generar`, 
      { contexto, instruccion, duracion }
    );
  }

  // NUEVO: Guardar test en BD
  guardarTest(seccionId: number, payloadTest: any) {
    return this.http.post<{status: string, data: any}>(
      `${this.baseUrl}/secciones/${seccionId}/evaluacion`, 
      payloadTest
    );
  }
}