import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  enviarInvitacion(datos: { correo: string, confirmarCorreo: string, rol_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitar`, datos);
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  actualizarEstado(id: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/usuarios/${id}/estado`, { activo });
  }
}
