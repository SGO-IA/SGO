import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CicloDidacticoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/expertoTematico`;

  /**
   * Obtiene el dashboard con los RAPs y el estado de sus ciclos
   */
  getDashboardExperto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard-experto`);
  }
}