import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seleccionar-crear-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccionar-crear-test.html',
  styleUrl: './seleccionar-crear-test.css',
})
export class SeleccionarCrearTest {
  @Input() label: string = '';
  @Input() iconClass: string = '';
  @Input() options: any[] = [];
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() modelValue: any = null;
  
  @Input() bindValue: string = 'id';
  @Input() bindLabel: string = 'nombre';
  @Input() bindSecondaryLabel: string = ''; 

  @Output() valueChange = new EventEmitter<any>();

  // Emitimos directamente el valor que recibe ngModel
  onModelChange(value: any) {
    this.valueChange.emit(value);
  }
}
