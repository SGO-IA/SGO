import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CicloDataService {
  // Estado único de la verdad ampliado
  private selection = signal({ 
    faseId: null as number | null, 
    rapId: null as number | null,
    ovaId: null as number | null // Añadimos el OVA aquí
  });

  // Getters reactivos para que los componentes hijos lean el estado
  rapId = computed(() => this.selection().rapId);
  faseId = computed(() => this.selection().faseId);
  ovaId = computed(() => this.selection().ovaId); // Getter para el OVA

  // Actualizamos el método para recibir los 3 parámetros
  setSeleccion(faseId: number, rapId: number, ovaId: number) {
    this.selection.set({ faseId, rapId, ovaId });
  }
}