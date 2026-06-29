import { Injectable, inject } from '@angular/core';
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
  recursos: RecursoR2[];
  tests: TestIA[];
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
}

export interface Ova {
  id: number;
  titulo: string;
  descripcion: string;
  ciclos: CicloDidactico[];
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

// ────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class AprendizGeneralService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aprendiz`;

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
}