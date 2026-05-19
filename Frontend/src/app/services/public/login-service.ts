import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signal para que cualquier componente (Navbar, Profile) sepa quién está logueado
  currentUser = signal<any>(null);

  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/google`;
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.autenticado) {
          this.currentUser.set(res.usuario);
        }
      })
    );
  }

  completarRegistro(id: string, telefono: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/completar-registro`, { 
      id, 
      telefono_principal: telefono 
    }, { withCredentials: true });
  }

  logout() {
    // 1. Avisamos al backend para que destruya la sesión
    this.http.get(`${this.apiUrl}/logout`, { withCredentials: true }).subscribe({
      next: () => {
        // 2. Limpiamos el estado local (Signal)
        this.currentUser.set(null);
        // 3. Redirigimos al usuario
        window.location.href = '/';
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        // Aun si falla el servidor, limpiamos localmente por seguridad
        this.currentUser.set(null);
        window.location.href = '/';
      }
    });
  }
}