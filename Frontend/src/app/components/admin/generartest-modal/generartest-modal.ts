import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generartest-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generartest-modal.html',
  styleUrl: './generartest-modal.css',
})
export class GenerartestModal {
  @Input() visible: boolean = false;
  @Input() competenciaNombre: string = '';
  @Output() alCerrar = new EventEmitter<void>();
  @Output() alGenerar = new EventEmitter<any>();

  cargando: boolean = false;

  configuracion = {
    nombre_test: '',
    descripcion: '', // Mapea al campo 'descripcion' de tests_diagnosticos
    cantidad_preguntas: 5,
    dificultad: 'intermedio',
    instrucciones_adicionales: '' 
  };

  cerrar() {
    this.visible = false;
    this.alCerrar.emit();
  }

  generar() {
    if (!this.configuracion.nombre_test.trim()) return;
    this.cargando = true;
    
    // Enviamos la configuración limpia para el Test de Diagnóstico
    this.alGenerar.emit(this.configuracion);
  }
}