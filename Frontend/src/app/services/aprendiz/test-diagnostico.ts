import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OpcionDiagnostico {
  texto: string;
  es_correcta: boolean;
}

export interface PreguntaDiagnostico {
  enunciado: string;
  opciones: OpcionDiagnostico[];
}

export interface TestDiagnostico {
  id: number;
  nombre_test: string;
  descripcion: string;
  preguntas: PreguntaDiagnostico[];
}

export interface ResultadoDiagnosticoPrevio {
  id: number;
  puntaje: number;
  nivel_sugerido: 'bajo' | 'medio' | 'alto';
  fecha_presentacion: string;
}

export interface AccesoOvaResponse {
  ok: boolean;
  data: {
    accesoPermitido: boolean;
    testDiagnostico: TestDiagnostico | null;
    resultadoPrevio?: ResultadoDiagnosticoPrevio;
  };
}

export interface EnviarRespuestaDiagnostico {
  preguntaIndex: number;
  opcionSeleccionada: number | null;
}

export interface AnalisisIA {
  nivel_detectado: 'bajo' | 'medio' | 'alto';
  resumen: string;
  fortalezas: string[];
  areas_mejora: string[];
  recomendacion: string;
  mensaje_motivacional: string;
}

export interface ResultadoDiagnosticoResponse {
  ok: boolean;
  data: {
    id: number;
    testDiagnosticoId: number;
    aprendizId: number;
    puntaje: number;
    nivelSugerido: 'bajo' | 'medio' | 'alto';
    correctas: number;
    totalPreguntas: number;
    analisisIA: AnalisisIA; // 🚀 NUEVO
  };
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aprendiz`;

  // Verifica si el aprendiz puede entrar a la OVA o necesita presentar el diagnóstico
  verificarAccesoOva(ovaId: number | string): Observable<AccesoOvaResponse> {
    return this.http.get<AccesoOvaResponse>(`${this.apiUrl}/ova/${ovaId}/acceso`, {
      withCredentials: true
    });
  }

  // Envía las respuestas del test diagnóstico y recibe el puntaje calculado en el servidor
  enviarResultadoDiagnostico(
    testDiagnosticoId: number,
    respuestas: EnviarRespuestaDiagnostico[]
  ): Observable<ResultadoDiagnosticoResponse> {
    return this.http.post<ResultadoDiagnosticoResponse>(
      `${this.apiUrl}/diagnostico/${testDiagnosticoId}/resultado`,
      { respuestas },
      { withCredentials: true }
    );
  }
}