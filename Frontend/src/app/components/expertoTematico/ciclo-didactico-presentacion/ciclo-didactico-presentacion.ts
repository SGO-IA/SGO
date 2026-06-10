import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-ciclo-didactico-presentacion',
  standalone: true,
  imports: [],
  templateUrl: './ciclo-didactico-presentacion.html'
})
export class CicloDidacticoPresentacion {
  // Recibe de forma reactiva si la ayuda debe estar abierta
  visible = input.required<boolean>();
  // Notifica al padre para sincronizar el cierre
  onCerrar = output<void>();

  cerrarAyuda(): void {
    this.onCerrar.emit();
  }
}