import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtapaBaseDirective } from '../../../../etapa-base';
import { ModalIa } from '../modal-ia/modal-ia';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [FormsModule, ModalIa],
  templateUrl: './transferencia.html',
})
export class Transferencia extends EtapaBaseDirective {
  override tipoEtapaNombre = 'Transferencia';
    duracion: number = 60;


  override configurarTest(customPrompt?: string) {    
    super.configurarTest();
    // No toques this.testConfigurado aquí, el padre ya lo maneja al recibir la rpta del backend
  }

  protected override prepararDatosExtra() {
    this.datosExtra = { duracion: this.duracion };
    // No hace falta pasar test_data aquí, ya lo manejamos en la petición HTTP anidada del punto 1
  }
}