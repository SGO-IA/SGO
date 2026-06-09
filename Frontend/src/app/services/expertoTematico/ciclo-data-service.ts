import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CicloDataService {
  private selection = signal({ 
    faseId: null as number | null, 
    rapId: null as number | null,
    ovaId: null as number | null 
  });

  private _cicloId = signal<number | null>(null);

  // 1. Recuperamos los datos al iniciar el servicio (por si hubo un F5)
  constructor() {
    try {
      const savedSelection = sessionStorage.getItem('sgo_ia_selection');
      const savedCicloId = sessionStorage.getItem('sgo_ia_cicloid');

      if (savedSelection) {
        this.selection.set(JSON.parse(savedSelection));
      }
      if (savedCicloId) {
        this._cicloId.set(Number(savedCicloId));
      }
    } catch (error) {
      console.error('🚩 [CicloDataService] Error al restaurar el estado:', error);
    }
  }
  
  // Getters reactivos (se mantienen intactos)
  cicloId = computed(() => this._cicloId());
  rapId = computed(() => this.selection().rapId);
  faseId = computed(() => this.selection().faseId);
  ovaId = computed(() => this.selection().ovaId);
  getCicloId = computed(() => this.cicloId());

  // 2. Guardamos en sessionStorage cada vez que se actualiza el signal
  setSeleccion(faseId: number, rapId: number, ovaId: number) {
    const nuevoEstado = { faseId, rapId, ovaId };
    this.selection.set(nuevoEstado);
    sessionStorage.setItem('sgo_ia_selection', JSON.stringify(nuevoEstado));
  }

  // 3. Guardamos el cicloId en sessionStorage
  setCicloId(id: number) {
    this._cicloId.set(id);
    sessionStorage.setItem('sgo_ia_cicloid', id.toString());
  }
}