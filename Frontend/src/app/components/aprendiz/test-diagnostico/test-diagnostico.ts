import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticoService, TestDiagnostico } from '../../../services/aprendiz/test-diagnostico';

interface RespuestaUsuario {
  preguntaIndex: number;
  opcionSeleccionada: number | null;
}

@Component({
  selector: 'app-test-diagnostico-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-diagnostico.html'
})
export class TestDiagnosticoModalComponent {
  @Input({ required: true }) test!: TestDiagnostico;
  @Output() cerrar = new EventEmitter<void>();
  @Output() aprobado = new EventEmitter<void>();

  private diagnosticoSvc = inject(DiagnosticoService);

  respuestas = signal<RespuestaUsuario[]>([]);
  enviando = signal<boolean>(false);
  enviado = signal<boolean>(false);
  resultado = signal<{ aprobado: boolean; puntaje: number } | null>(null);
  errorEnvio = signal<string | null>(null);
  letras = ['A', 'B', 'C', 'D', 'E', 'F'];

  todasRespondidas = computed(() => {
    if (!this.test?.preguntas?.length) return false;
    return this.respuestas().length === this.test.preguntas.length
      && this.respuestas().every(r => r.opcionSeleccionada !== null);
  });

  cantidadRespondidas = computed(() => this.respuestas().filter(r => r.opcionSeleccionada !== null).length);
  porcentajeProgreso = computed(() => {
    if (!this.test?.preguntas?.length) return 0;
    return Math.round((this.cantidadRespondidas() / this.test.preguntas.length) * 100);
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
    if (!this.todasRespondidas() || this.enviando()) return;
    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.diagnosticoSvc.enviarResultadoDiagnostico(this.test.id, this.respuestas()).subscribe({
      next: (res) => {
        const puntaje = res.data.puntaje;
        const aprobado = res.data.nivelSugerido !== 'bajo'; // 🔧 Ajusta tu criterio real de aprobación
        this.resultado.set({ aprobado, puntaje });
        this.enviado.set(true);
        this.enviando.set(false);
      },
      error: () => {
        this.enviando.set(false);
        this.errorEnvio.set('No se pudo enviar el test. Intenta de nuevo.');
      }
    });
  }

  continuar() {
    if (this.resultado()?.aprobado) {
      this.aprobado.emit();
    } else {
      this.cerrar.emit();
    }
  }
}