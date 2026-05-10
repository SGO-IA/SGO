import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompetenciaResumen {
  id: number;
  nombre: string;
  codigo_norma: string;
}

export interface ProgramaFull {
  programa_id: number;
  programa_nombre: string;
  programa_codigo: string;
  competencias: CompetenciaResumen[];
}

export interface EstructuraCompetencia {
  competenciaId: string;
  totalRaps: number;
  estructura: {
    rap_id: number;
    codigo_rap: string;
    rap_nombre: string;
    saberes: string[] | null;
    procesos: string[] | null;
    criterios: string[] | null;
  }[];
}

export interface ResultadoTest {
  existe: boolean;
  data?: {
    test_id: number;
    nombre_test: string;
    preguntas_json: any;
    ponderacion: number;
    tipo_seccion: string;
    ciclo_nombre: string;
  };
  mensaje?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TestInicialService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  obtenerProgramasCompletos(): Observable<ProgramaFull[]> {
    return this.http.get<ProgramaFull[]>(`${this.apiUrl}/programas-full`);
  }

  obtenerEstructuraCompetencia(competenciaId: number): Observable<EstructuraCompetencia> {
    return this.http.get<EstructuraCompetencia>(`${this.apiUrl}/competencias/${competenciaId}/estructura`);
  }

  consultarTestPorCompetencia(competenciaId: number): Observable<ResultadoTest> {
    return this.http.get<ResultadoTest>(`${this.apiUrl}/test-competencia/${competenciaId}`);
  }

  generarTestConIA(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/generar-test`, payload);
  }
}
