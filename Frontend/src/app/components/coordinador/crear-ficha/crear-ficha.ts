import { Component, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FichaPayload, FichasService } from '../../../services/coordinador/fichas';

@Component({
  selector: 'app-modal-crear-ficha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-ficha.html'
})
export class ModalCrearFichaComponent {
  private fichasSvc = inject(FichasService);

  // Evento para avisarle al padre que actualice la tabla
  @Output() fichaCreada = new EventEmitter<void>();

  // ─── ESTADO DEL MODAL ─────────────────────────────────────────────────────
  visible = signal(false);
  cargando = signal(false);
  error = signal<string | null>(null);

  // ─── DATOS DE SELECTORES ──────────────────────────────────────────────────
  programas = signal<any[]>([]);
  centros = signal<any[]>([]);

  // ─── FORMULARIO ───────────────────────────────────────────────────────────
  codigo_ficha = signal('');
  ficha_caracterizacion = signal('');
  programa_id = signal<number | null>(null);
  centro_id = signal<number | null>(null);
  fecha_inicio = signal('');
  fecha_fin = signal('');
  modalidad = signal('Presencial'); // Valor por defecto
  correosRaw = signal('');

  // ─── COMPUTED PARA CORREOS ────────────────────────────────────────────────
  correosLista = computed(() =>
    this.correosRaw()
      .split('\n')
      .map(c => c.trim().toLowerCase())
      .filter(c => c.length > 0)
  );

  correosInvalidos = computed(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.correosLista().filter(c => !re.test(c));
  });

  formularioValido = computed(() => {
    return this.codigo_ficha().length > 0 &&
           this.ficha_caracterizacion().length > 0 &&
           this.programa_id() !== null &&
           this.centro_id() !== null &&
           this.fecha_inicio() !== '' &&
           this.fecha_fin() !== '' &&
           this.correosLista().length > 0 && 
           this.correosInvalidos().length === 0;
  });

  // ─── MÉTODOS ──────────────────────────────────────────────────────────────
  abrir() {
    this.resetFormulario();
    this.visible.set(true);
    this.cargarSelectores();
  }

  cerrar() {
    this.visible.set(false);
  }

  private resetFormulario() {
    this.codigo_ficha.set('');
    this.ficha_caracterizacion.set('');
    this.programa_id.set(null);
    this.centro_id.set(null);
    this.fecha_inicio.set('');
    this.fecha_fin.set('');
    this.correosRaw.set('');
    this.error.set(null);
  }

  private cargarSelectores() {
    this.fichasSvc.getProgramas().subscribe(res => this.programas.set(res));
    this.fichasSvc.getCentros().subscribe(res => this.centros.set(res));
  }

  guardarFicha() {
    if (!this.formularioValido()) return;

    this.cargando.set(true);
    this.error.set(null);

    const payload: FichaPayload = {
      codigo_ficha: this.codigo_ficha(),
      ficha_caracterizacion: this.ficha_caracterizacion(),
      programa_id: this.programa_id()!,
      centro_id: this.centro_id()!,
      fecha_inicio: this.fecha_inicio(),
      fecha_fin: this.fecha_fin(),
      modalidad: this.modalidad(),
      correosAprendices: this.correosLista()
    };

    this.fichasSvc.crearFicha(payload).subscribe({
      next: (res) => {
        this.cargando.set(false);
        if (res.ok) {
          this.cerrar();
          this.fichaCreada.emit(); // ¡Avisa al padre!
        } else {
          this.error.set(res.message);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.error?.message || 'Error de conexión al crear la ficha.');
      }
    });
  }
}