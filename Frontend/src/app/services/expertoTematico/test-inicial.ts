import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Definimos la interfaz para el Test para mantener el tipado fuerte de TS
export interface TestDiagnostico {
  competencia_id: number;
  nombre_test: string;
  descripcion?: string;
  preguntas: any; // Aquí va el objeto JSON generado por la IA
}

export interface TestDetalleCompleto {
  test_id: number;
  competencia_id: number;
  nombre_test: string;
  descripcion?: string;
  preguntas_json: any[]; // Array parseado listo para recorrer con *ngFor
  activo: boolean;
  competencia_nombre: string;
  ciclo_nombre: string;
  ponderacion: number;
}

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private http = inject(HttpClient);
  // La ruta base según tu configuración de app.use
  private apiUrl = `${environment.apiUrl}/expertoTematico`;

  guardarTestIA(test: TestDiagnostico): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/guardar-test`, 
      test, 
      { withCredentials: true }
    );
  }

  getTestsPorCompetencia(competenciaId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/tests/${competenciaId}`, 
      { withCredentials: true }
    );
  }

  obtenerTestPorId(testId: number): Observable<TestDetalleCompleto> {
    return this.http.get<TestDetalleCompleto>(
      `${this.apiUrl}/ver-test/${testId}`,
      { withCredentials: true }
    );
  }

  actualizarTest(testId: number, datosEditados: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/editar-test/${testId}`, 
      datosEditados, 
      { withCredentials: true }
    );
  }
}