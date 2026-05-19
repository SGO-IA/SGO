import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SemillasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expertoTematico`;

  // Signals reactivos globales para la vista
  public semillas = signal<any[]>([]);
  public cargando = signal<boolean>(false);

  obtenerMisSemillas(): Observable<any[]> {
    // Activamos el estado de carga
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
}