import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SemillasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expertoTematico`;
    private httpOptions = { withCredentials: true };

  // Señales de estado
  public semillas = signal<any[]>([]);
  public cargando = signal<boolean>(false);
  public tieneRapsAsignados = signal<boolean>(false);
  public rapsTrabajando = signal<any[]>([]);
  public rapsDisponiblesParaSeleccionar = signal<any[]>([]);

  private conCarga<T>(peticion$: Observable<T>): Observable<T> {
    this.cargando.set(true);
    return peticion$.pipe(
      finalize(() => this.cargando.set(false))
    );
  }

  obtenerMisSemillas(): Observable<any[]> {
    const peticion$ = this.http.get<any[]>(`${this.apiUrl}/mis-semillas`, this.httpOptions).pipe(
      tap((data) => this.semillas.set(data))
    );
    return this.conCarga(peticion$);
  }

  verificarEstadoRaps(semillaId: string): Observable<any> {
    const peticion$ = this.http.get<any>(`${this.apiUrl}/semilla/${semillaId}/verificar-estado`, this.httpOptions).pipe(
      tap((res) => {
        if (res.status === 'success') {
          this.tieneRapsAsignados.set(res.tieneAsignacion);
          
          if (res.tieneAsignacion) {
            this.rapsTrabajando.set(res.raps);
          } else {
            this.rapsDisponiblesParaSeleccionar.set(res.rapsDisponibles);
          }
        }
      })
    );
    return this.conCarga(peticion$);
  }

  guardarAsignacionRaps(semillaId: string, rapIds: number[]): Observable<any> {
    const peticion$ = this.http.post<any>(`${this.apiUrl}/semilla/${semillaId}/asignar`, { rapIds }, this.httpOptions);
    return this.conCarga(peticion$);
  }

  verificarAccesoCiclo(semillaId: string | null, cicloId: number, step: string): Observable<any> {
      // Añadimos 't' (timestamp) para que la URL sea única y el caché no funcione
      const timestamp = new Date().getTime();
      const url = `${this.apiUrl}/semillas/${semillaId}/ciclos-didacticos/${cicloId}/verificar-acceso?step=${step}&t=${timestamp}`;
      
      return this.http.get<any>(url, this.httpOptions);
  }
}