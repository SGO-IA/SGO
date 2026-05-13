import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ExpertoService {
  private http = inject(HttpClient);
  // Apuntamos a la misma base del coordinador
  private apiUrl = `${environment.apiUrl}/coordinador`;
  
  getExpertos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expertos`, { withCredentials: true });
  }

  crearSemilla(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/semillas`, data, { withCredentials: true });
  }
}