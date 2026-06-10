import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtapaBaseDirective } from '../../../../etapa-base';
import { ModalIa } from '../modal-ia/modal-ia';

@Component({
  selector: 'app-apropiacion',
  standalone: true,
  imports: [FormsModule, ModalIa],
  templateUrl: './apropiacion.html',
})
export class Apropiacion extends EtapaBaseDirective {
  override tipoEtapaNombre = 'Apropiación';
  
  // Variables extra del componente
  duracion: number = 60;
  testConfigurado: boolean = false;

  // Si necesitas guardar campos extra, puedes sobrescribir el método de persistencia
  // Pero lo ideal es que uses el título y contenido de la clase base
  
  configurarTest() {
    this.testConfigurado = true;
    this.cdr.detectChanges();
  }
}