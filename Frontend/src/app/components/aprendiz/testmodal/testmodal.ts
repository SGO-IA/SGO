import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AprendizGeneralService, AnalisisTestFase } from '../../../services/aprendiz/aprendiz-general';

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
export class TestModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) test!: { id: number; nombre_test: string; preguntas_json: any };
  @Output() cerrar = new EventEmitter<void>();
  @Output() finalizado = new EventEmitter<{ aprobado: boolean; puntaje: number }>();

  private aprendizSvc = inject(AprendizGeneralService);

  preguntas: PreguntaTest[] = [];
  respuestas = signal<RespuestaUsuario[]>([]);
  enviando = signal<boolean>(false); // 🚀 NUEVO
  enviado = signal<boolean>(false);
  resultado = signal<{ aprobado: boolean; puntaje: number } | null>(null);
  errorEnvio = signal<string | null>(null); // 🚀 NUEVO
  analisis = signal<AnalisisTestFase | null>(null); // 🚀 NUEVO

  letras = ['A', 'B', 'C', 'D', 'E', 'F'];

  private mensajesAnalisis = [
    'Corrigiendo tus respuestas...',
    'Identificando tus fortalezas...',
    'Detectando áreas de mejora...',
    'Generando recomendaciones...',
    'Casi listo...'
  ];
  mensajeActual = signal<string>(this.mensajesAnalisis[0]);
  private intervaloMensajes: any = null;

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

  cantidadRespondidas = computed(() => this.respuestas().filter(r => r.opcionSeleccionada !== null).length);
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

  // 🚀 REESCRITO: ahora envía al backend en vez de calcular todo local
  enviarTest() {
    if (!this.todasRespondidas() || this.enviando()) return;
    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.iniciarRotacionMensajes();

    this.aprendizSvc.enviarResultadoTestFase(this.test.id, this.respuestas()).subscribe({
      next: (res) => {
        this.analisis.set(res.data.analisisIA);
        this.resultado.set({ aprobado: res.data.aprobado, puntaje: res.data.puntaje });
        this.enviado.set(true);
        this.enviando.set(false);
        this.detenerRotacionMensajes();
        this.finalizado.emit({ aprobado: res.data.aprobado, puntaje: res.data.puntaje });
      },
      error: () => {
        this.enviando.set(false);
        this.detenerRotacionMensajes();
        this.errorEnvio.set('No se pudo enviar el test. Intenta de nuevo.');
      }
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  ngOnDestroy() {
    this.detenerRotacionMensajes();
  }
}