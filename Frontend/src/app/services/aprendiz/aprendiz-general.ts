import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── INTERFACES DE MIS FICHAS ───────────────────────────────────────────────

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

// ─── INTERFACES DEL ENTORNO DE APRENDIZAJE ──────────────────────────────────

export interface RecursoR2 {
  id: number;
  nombre_archivo: string;
  url_r2: string;
  tipo_archivo: string;
}

export interface TestIA {
  id: number;
  nombre_test: string;
  preguntas_json: any; // O puedes tiparlo más estricto si tienes una interfaz para las preguntas
}

export interface SeccionDidactica {
  id: number;
  titulo: string;
  contenido_html: string;
  recursos: {
    id: number;
    nombre_archivo: string;
    url_r2: string;
    tipo_archivo: string;
    key_r2?: string;
  }[];
  tests: any[];
  enlaces: EnlaceRecurso[];
}

export interface CicloDidactico {
  id: number;
  titulo: string;
  descripcion_general: string;
  orden: number;
  // El backend agrupa las secciones en un diccionario por tipo
  secciones: {
    Reflexion?: SeccionDidactica;
    Contextualizacion?: SeccionDidactica;
    Apropiacion?: SeccionDidactica;
    Transferencia?: SeccionDidactica;
    [key: string]: SeccionDidactica | undefined;
  };
  completado: boolean;
}

export interface Ova {
  id: number;
  titulo: string;
  descripcion: string;
  ciclos: CicloDidactico[];
  completado: boolean;
}

export interface SemillaEntorno {
  id: number;
  nombre_semilla: string;
  programa_nombre: string;
}

export interface EntornoData {
  semilla: SemillaEntorno | null;
  ovas: Ova[];
}

export interface EntornoResponse {
  ok: boolean;
  message: string;
  data: EntornoData;
}

export interface EnlaceRecurso {
  id: number;
  url: string;
  etiqueta: string;
}

export interface AnalisisTestFase {
  resumen: string;
  fortalezas: string[];
  areas_mejora: string[];
  recomendacion: string;
  mensaje_motivacional: string;
}

export interface RespuestaTestFase {
  preguntaIndex: number;
  opcionSeleccionada: number | null;
}

export interface ResultadoTestFaseResponse {
  ok: boolean;
  data: {
    id: number;
    testId: number;
    aprendizId: number;
    puntaje: number;
    aprobado: boolean;
    correctas: number;
    totalPreguntas: number;
    analisisIA: AnalisisTestFase;
  };
}

export interface TestPendiente {
  fase: string;
  nombre_test: string;
  intentado: boolean;
  puntaje: number | null;
}

export interface FinalizarCicloErrorResponse {
  ok: false;
  error: string;
  message: string;
  pendientes: TestPendiente[];
}

export interface FinalizarCicloResponse {
  ok: true;
  data: { completado: boolean; pendientes: TestPendiente[] };
}


@Injectable({
  providedIn: 'root',
})
export class AprendizGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aprendiz`;

  entornoActualOvas = signal<Ova[]>([]);

  // 1. Obtener listado inicial de fichas
  getMisFichas(): Observable<FichasAprendizResponse> {
    return this.http.get<FichasAprendizResponse>(`${this.apiUrl}/mis-fichas`, { 
      withCredentials: true 
    });
  }

  // 2. Obtener todo el árbol de contenido de una ficha específica
  getEntornoFicha(fichaId: string | number): Observable<EntornoResponse> {
    return this.http.get<EntornoResponse>(`${this.apiUrl}/entorno/${fichaId}`, {
      withCredentials: true
    });
  }

  obtenerUrlDescargaRecurso(recursoId: number): string {
    return `${this.apiUrl}/recursos/${recursoId}/descargar`;
  }

  enviarResultadoTestFase(testId: number, respuestas: RespuestaTestFase[]): Observable<ResultadoTestFaseResponse> {
    return this.http.post<ResultadoTestFaseResponse>(
      `${this.apiUrl}/test/${testId}/resultado`,
      { respuestas },
      { withCredentials: true }
    );
  }

  finalizarCiclo(cicloId: number): Observable<FinalizarCicloResponse> {
    return this.http.post<FinalizarCicloResponse>(
      `${this.apiUrl}/ciclo/${cicloId}/finalizar`,
      {},
      { withCredentials: true }
    );
  }
}