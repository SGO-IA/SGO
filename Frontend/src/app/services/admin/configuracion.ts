import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  // Cambiamos a una URL genérica acorde a tu nuevo Router del Back
  private readonly URL_BASE = `${environment.apiUrl}/admin/config`;

  constructor(private http: HttpClient) { }

  async obtenerConfiguracion(clave: string) {
    try {
      // Endpoint: GET .../admin/config/nombre_de_la_clave
      return await firstValueFrom(
        this.http.get<any>(`${this.URL_BASE}/${clave}`)
      );
    } catch (error) {
      console.error(`Error al obtener configuración para ${clave}:`, error);
      throw error;
    }
  }

  async actualizarConfiguracion(clave: string, valor: any) {
    try {
      // El backend espera: { valor: ... }
      const body = { valor };
      
      // Endpoint: PATCH .../admin/config/nombre_de_la_clave
      return await firstValueFrom(
        this.http.patch<any>(`${this.URL_BASE}/${clave}`, body)
      );
    } catch (error) {
      console.error(`Error al actualizar configuración para ${clave}:`, error);
      throw error;
    }
  }
}