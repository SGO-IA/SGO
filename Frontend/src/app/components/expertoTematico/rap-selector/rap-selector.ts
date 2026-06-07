import { JsonPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rap-selector',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './rap-selector.html',
  styleUrl: './rap-selector.css',
})
export class RapSelector {
  raps = input.required<any[]>();
  
  // Evento para notificar al padre la selección
  rapSeleccionado = output<number>();

  onSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.rapSeleccionado.emit(Number(value));
  }
}
