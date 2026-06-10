import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtapaBaseDirective } from '../../../../etapa-base';
import { ModalIa } from '../modal-ia/modal-ia';

@Component({
  selector: 'app-contextualizacion',
  standalone: true,
  imports: [FormsModule, ModalIa], // Importa los componentes necesarios
  templateUrl: './contextualizacion.html',
})
export class Contextualizacion extends EtapaBaseDirective {
  // ✅ Esto es lo único que cambia por componente
  override tipoEtapaNombre = 'Contextualización'; 
}