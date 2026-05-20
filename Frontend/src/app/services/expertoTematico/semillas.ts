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

  public semillas = signal<any[]>([]);
  public cargando = signal<boolean>(false);
  
  // Estados para el flujo de gestión interna del árbol de RAPs
  public tieneRapsAsignados = signal<boolean>(false);
  public rapsTrabajando = signal<any[]>([]);
  public rapsDisponiblesParaSeleccionar = signal<any[]>([]);

  obtenerMisSemillas(): Observable<any[]> {
    this.cargando.set(true);

    return this.http.get<any[]>(`${this.apiUrl}/mis-semillas`, { 
      withCredentials: true 
    }).pipe(
      tap((data) => {
        this.semillas.set(data);
      }),
      finalize(() => {
        this.cargando.set(false);
      })
    );
  }

  verificarEstadoRaps(semillaId: string): Observable<any> {
    this.cargando.set(true);

    return this.http.get<any>(`${this.apiUrl}/semilla/${semillaId}/verificar-estado`, {
      withCredentials: true
    }).pipe(
      tap((res) => {
        if (res.status === 'success') {
          this.tieneRapsAsignados.set(res.tieneAsignacion);
          
          if (res.tieneAsignacion) {
            this.rapsTrabajando.set(res.raps);
          } else {
            this.rapsDisponiblesParaSeleccionar.set(res.rapsDisponibles);
          }
        }
      }),
      finalize(() => {
        this.cargando.set(false);
      })
    );
  }

  guardarAsignacionRaps(semillaId: string, rapIds: number[]): Observable<any> {
    this.cargando.set(true);

    return this.http.post<any>(
      `${this.apiUrl}/semilla/${semillaId}/asignar`, 
      { rapIds }, 
      { withCredentials: true }
    ).pipe(
      finalize(() => {
        this.cargando.set(false);
      })
    );
  }
}