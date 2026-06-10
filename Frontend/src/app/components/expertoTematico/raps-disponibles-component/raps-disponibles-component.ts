import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-raps-disponibles-component',
  imports: [],
  templateUrl: './raps-disponibles-component.html',
  styleUrl: './raps-disponibles-component.css',
})
export class RapsDisponiblesComponent {
  competenciasConRaps = input.required<any[]>();
  mostrarBotonConfirmar = input<boolean>(false);

  toggleRap = output<{ rapId: number; event: Event }>();
  confirmarSeleccion = output<void>();
}
