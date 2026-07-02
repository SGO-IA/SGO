import { Component, Input, Output, EventEmitter, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalisisIA, DiagnosticoService, TestDiagnostico } from '../../../services/aprendiz/test-diagnostico';

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
export class TestDiagnosticoModalComponent implements OnDestroy {
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
  analisis = signal<AnalisisIA | null>(null);

  // 🚀 NUEVO: mensajes rotativos mientras la IA analiza
  private mensajesAnalisis = [
    'Corrigiendo tus respuestas...',
    'Identificando tus fortalezas...',
    'Detectando áreas de mejora...',
    'Generando recomendaciones personalizadas...',
    'Casi listo, un momento más...'
  ];
  mensajeActual = signal<string>(this.mensajesAnalisis[0]);
  private intervaloMensajes: any = null;

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

  // 🚀 NUEVO: rota los mensajes cada 2.2s mientras enviando() sea true
  private iniciarRotacionMensajes() {
    let index = 0;
    this.mensajeActual.set(this.mensajesAnalisis[0]);

    this.intervaloMensajes = setInterval(() => {
      index = (index + 1) % this.mensajesAnalisis.length;
      this.mensajeActual.set(this.mensajesAnalisis[index]);
    }, 2200);
  }

  private detenerRotacionMensajes() {
    if (this.intervaloMensajes) {
      clearInterval(this.intervaloMensajes);
      this.intervaloMensajes = null;
    }
  }

  enviarTest() {
    if (!this.todasRespondidas() || this.enviando()) return;
    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.iniciarRotacionMensajes(); // 🚀 NUEVO

    this.diagnosticoSvc.enviarResultadoDiagnostico(this.test.id, this.respuestas()).subscribe({
      next: (res) => {
        const puntaje = res.data.puntaje;
        const aprobado = res.data.nivelSugerido !== 'bajo';
        this.analisis.set(res.data.analisisIA);
        this.resultado.set({ aprobado, puntaje });
        this.enviado.set(true);
        this.enviando.set(false);
        this.detenerRotacionMensajes(); // 🚀 NUEVO
      },
      error: () => {
        this.enviando.set(false);
        this.detenerRotacionMensajes(); // 🚀 NUEVO
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

  // 🚀 NUEVO: limpieza si el usuario cierra el modal a mitad del proceso
  ngOnDestroy() {
    this.detenerRotacionMensajes();
  }
}