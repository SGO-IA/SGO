import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtapaBaseDirective } from '../../../../etapa-base';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transferencia.html',
})
export class Transferencia extends EtapaBaseDirective {
  override tipoEtapaNombre = 'Transferencia';
  
  // Variables extra
  duracion: number = 60;
  testConfigurado: boolean = false;

  configurarTest() {
    this.testConfigurado = true;
    this.cdr.detectChanges();
  }
}