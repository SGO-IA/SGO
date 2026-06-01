import { Component, signal } from '@angular/core';
import { CicloDidacticoPresentacion } from '../../../components/expertoTematico/ciclo-didactico-presentacion/ciclo-didactico-presentacion';

@Component({
  selector: 'app-ciclo-didactico',
  standalone: true,
  // 📦 Registramos el subcomponente de ayuda
  imports: [CicloDidacticoPresentacion], 
  templateUrl: './ciclo-didactico.html'
})
export class CicloDidactico {
  
  // Signal reactivo para controlar la visibilidad de la sección de ayuda
  mostrarAyuda = signal<boolean>(false);

  toggleAyuda(): void {
    this.mostrarAyuda.update(estado => !estado);
  }

  cerrarAyuda(): void {
    this.mostrarAyuda.set(false);
  }

  // ... El resto de tus lógicas y métodos para renderizar las fases e inyecciones de servicios
}