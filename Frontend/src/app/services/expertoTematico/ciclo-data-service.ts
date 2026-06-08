import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CicloDataService {
  private selection = signal({ 
    faseId: null as number | null, 
    rapId: null as number | null,
    ovaId: null as number | null 
  });

  private _cicloId = signal<number | null>(null); // renombrado para seguir convención
  
  // Getter público para el componente
  cicloId = computed(() => this._cicloId());
  // Getters reactivos
  rapId = computed(() => this.selection().rapId);
  faseId = computed(() => this.selection().faseId);
  ovaId = computed(() => this.selection().ovaId);
  getCicloId = computed(() => this.cicloId());

  setSeleccion(faseId: number, rapId: number, ovaId: number) {
    this.selection.set({ faseId, rapId, ovaId });
  }

  setCicloId(id: number) {
    this._cicloId.set(id);
  }
}