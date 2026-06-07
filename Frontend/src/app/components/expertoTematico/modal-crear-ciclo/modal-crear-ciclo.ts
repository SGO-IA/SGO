import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-crear-ciclo',
  imports: [FormsModule],
  templateUrl: './modal-crear-ciclo.html',
  styleUrl: './modal-crear-ciclo.css',
})
export class ModalCrearCiclo {
  cerrar = output();
  guardar = output<any>();
  data = { titulo: '', descripcion_general: '' };
}
