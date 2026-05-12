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
  @Input() cargando: boolean = false;
  
  // Agregamos esto para recibir el test generado desde el padre
  @Input() testGenerado: any = null; 

  @Output() alCerrar = new EventEmitter<void>();
  @Output() alGenerar = new EventEmitter<any>();
  @Output() alConfirmar = new EventEmitter<any>(); // Nuevo evento para guardar

  configuracion = {
    nombre_test: '',
    descripcion: '',
    cantidad_preguntas: 5,
    dificultad: 'intermedio',
    instrucciones_adicionales: '' 
  };
  
  cerrar() {
    this.testGenerado = null; // Limpiar al cerrar
    this.alCerrar.emit();
  }

  generar() {
    if (!this.configuracion.nombre_test.trim()) return;
    this.alGenerar.emit(this.configuracion);
  }

  confirmarGuardado() {
    this.alConfirmar.emit(this.testGenerado);
  }

  marcarComoCorrecta(pregunta: any, opcionSeleccionada: any) {
    pregunta.opciones.forEach((opt: any) => opt.es_correcta = false);
    opcionSeleccionada.es_correcta = true;
  }
}


