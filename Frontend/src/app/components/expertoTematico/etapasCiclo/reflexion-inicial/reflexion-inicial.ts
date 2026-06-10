import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalIa } from '../modal-ia/modal-ia';
import { EtapaBaseDirective } from '../../../../etapa-base';
@Component({
  selector: 'app-reflexion-inicial',
  standalone: true,
  imports: [FormsModule, ModalIa],
  templateUrl: './reflexion-inicial.html',
})
export class ReflexionInicial extends EtapaBaseDirective {
  override tipoEtapaNombre = 'Reflexión Inicial';
}