import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PreguntaTest {
  enunciado: string;
  opciones: string[];
  respuesta_correcta_index: number;
  retroalimentacion?: string;
}

interface RespuestaUsuario {
  preguntaIndex: number;
  opcionSeleccionada: number | null;
}

@Component({
  selector: 'app-test-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testmodal.html'
})
export class TestModalComponent implements OnInit {
  @Input({ required: true }) test!: { id: number; nombre_test: string; preguntas_json: any };
  @Output() cerrar = new EventEmitter<void>();
  @Output() finalizado = new EventEmitter<{ aprobado: boolean; puntaje: number }>();

  preguntas: PreguntaTest[] = [];
  respuestas = signal<RespuestaUsuario[]>([]);
  enviado = signal<boolean>(false);
  resultado = signal<{ aprobado: boolean; puntaje: number } | null>(null);

  // Letras para las opciones (A, B, C, D...)
  letras = ['A', 'B', 'C', 'D', 'E', 'F'];

  ngOnInit() {
    if (typeof this.test.preguntas_json === 'string') {
      try {
        this.preguntas = JSON.parse(this.test.preguntas_json);
      } catch (e) {
        console.error('Error parseando preguntas_json:', e);
        this.preguntas = [];
      }
    } else {
      this.preguntas = this.test.preguntas_json || [];
    }
  }

  todasRespondidas = computed(() => {
    if (!this.preguntas.length) return false;
    return this.respuestas().length === this.preguntas.length
      && this.respuestas().every(r => r.opcionSeleccionada !== null);
  });

  // 🚀 NUEVO: cuántas preguntas lleva respondidas, para la barra de progreso
  cantidadRespondidas = computed(() => {
    return this.respuestas().filter(r => r.opcionSeleccionada !== null).length;
  });

  // 🚀 NUEVO: porcentaje de progreso
  porcentajeProgreso = computed(() => {
    if (!this.preguntas.length) return 0;
    return Math.round((this.cantidadRespondidas() / this.preguntas.length) * 100);
  });

  seleccionarRespuesta(preguntaIndex: number, opcionIndex: number) {
    if (this.enviado()) return;
    const actuales = this.respuestas().filter(r => r.preguntaIndex !== preguntaIndex);
    this.respuestas.set([...actuales, { preguntaIndex, opcionSeleccionada: opcionIndex }]);
  }

  obtenerSeleccion(preguntaIndex: number): number | null {
    return this.respuestas().find(r => r.preguntaIndex === preguntaIndex)?.opcionSeleccionada ?? null;
  }

  enviarTest() {
    if (!this.todasRespondidas()) return;

    let correctas = 0;
    this.preguntas.forEach((pregunta, i) => {
      const seleccion = this.obtenerSeleccion(i);
      if (seleccion === pregunta.respuesta_correcta_index) {
        correctas++;
      }
    });

    const puntaje = (correctas / this.preguntas.length) * 100;
    const aprobado = puntaje >= 70;

    this.resultado.set({ aprobado, puntaje });
    this.enviado.set(true);
    this.finalizado.emit({ aprobado, puntaje });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}