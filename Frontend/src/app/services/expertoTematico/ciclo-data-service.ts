import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CicloDataService {
  // Estado único de la verdad
  private selection = signal({ faseId: null as number | null, rapId: null as number | null });

  // Getters para que los hijos lean el estado
  rapId = computed(() => this.selection().rapId);
  faseId = computed(() => this.selection().faseId);

  setSeleccion(faseId: number, rapId: number) {
    this.selection.set({ faseId, rapId });
  }
}