import {
  Component, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenciaSelector, FichaSelector, InstructorSelector, InstructorVinculacion, ProgramasService, SemillaBanco } from '../../../services/coordinador/programas';


type Paso = 'ficha' | 'instructores' | 'aprendices' | 'confirmacion';

interface InstructorForm {
  instructorId: number | null;
  competenciaId: number | null;
}

@Component({
  selector: 'app-modal-duplicar-semilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicarsemilla.html',
})
export class ModalDuplicarSemillaComponent {
  private svc = inject(ProgramasService);

  // ─── Estado del modal ─────────────────────────────────────────────────────
  visible         = signal(false);
  semillaOrigen   = signal<SemillaBanco | null>(null);
  pasoActual      = signal<Paso>('ficha');
  cargando        = signal(false);
  error           = signal('');
  exito           = signal(false);

  // ─── Datos de selectores ──────────────────────────────────────────────────
  fichas          = signal<FichaSelector[]>([]);
  instructores    = signal<InstructorSelector[]>([]);
  competencias    = signal<CompetenciaSelector[]>([]);

  // ─── Formulario ───────────────────────────────────────────────────────────
  fichaId         = signal<number | null>(null);
  instructoresForm = signal<InstructorForm[]>([{ instructorId: null, competenciaId: null }]);
  correosRaw      = signal('');   // textarea: uno por línea

  // ─── Computed ─────────────────────────────────────────────────────────────
  pasos: Paso[]   = ['ficha', 'instructores', 'aprendices', 'confirmacion'];

  indicePaso = computed(() => this.pasos.indexOf(this.pasoActual()));

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

  pasoValido = computed(() => {
    switch (this.pasoActual()) {
      case 'ficha':
        return this.fichaId() !== null;
      case 'instructores':
        return this.instructoresForm().length > 0 &&
          this.instructoresForm().every(i => i.instructorId !== null && i.competenciaId !== null);
      case 'aprendices':
        return this.correosLista().length > 0 && this.correosInvalidos().length === 0;
      case 'confirmacion':
        return true;
      default:
        return false;
    }
  });

  fichaSeleccionada = computed(() =>
    this.fichas().find(f => f.id === this.fichaId()) ?? null
  );

  // ─── Abrir modal ──────────────────────────────────────────────────────────
  abrir(semilla: SemillaBanco) {
    this.semillaOrigen.set(semilla);
    this.pasoActual.set('ficha');
    this.fichaId.set(null);
    this.instructoresForm.set([{ instructorId: null, competenciaId: null }]);
    this.correosRaw.set('');
    this.error.set('');
    this.exito.set(false);
    this.visible.set(true);

    this.cargarDatos(semilla.programa_id);
  }

  cerrar() {
    this.visible.set(false);
  }

  // ─── Carga de datos ───────────────────────────────────────────────────────
  private cargarDatos(programaId: number) {
    this.svc.getFichasPorPrograma(programaId).subscribe({
      next: data => this.fichas.set(data),
      error: () => this.error.set('No se pudieron cargar las fichas.'),
    });
    this.svc.getInstructores().subscribe({
      next: data => this.instructores.set(data),
    });
    this.svc.getCompetenciasPorPrograma(programaId).subscribe({
      next: data => this.competencias.set(data),
    });
  }

  // ─── Navegación por pasos ─────────────────────────────────────────────────
  siguiente() {
    const idx = this.indicePaso();
    if (idx < this.pasos.length - 1) {
      this.pasoActual.set(this.pasos[idx + 1]);
    }
  }

  anterior() {
    const idx = this.indicePaso();
    if (idx > 0) {
      this.pasoActual.set(this.pasos[idx - 1]);
    }
  }

  // ─── Instructores ─────────────────────────────────────────────────────────
  agregarInstructor() {
    this.instructoresForm.update(list => [...list, { instructorId: null, competenciaId: null }]);
  }

  quitarInstructor(index: number) {
    this.instructoresForm.update(list => list.filter((_, i) => i !== index));
  }

  actualizarInstructor(index: number, campo: keyof InstructorForm, valor: number) {
    this.instructoresForm.update(list => {
      const copia = [...list];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  }

  // ─── Enviar ───────────────────────────────────────────────────────────────
  confirmarDuplicacion() {
    const semilla = this.semillaOrigen();
    if (!semilla || !this.fichaId()) return;

    const instructores: InstructorVinculacion[] = this.instructoresForm()
      .filter(i => i.instructorId !== null && i.competenciaId !== null)
      .map(i => ({ instructorId: i.instructorId!, competenciaId: i.competenciaId! }));

    this.cargando.set(true);
    this.error.set('');

    this.svc.duplicarSemilla({
      semillaOrigenId:   semilla.id,
      fichaId:           this.fichaId()!,
      instructores,
      correosAprendices: this.correosLista(),
    }).subscribe({
      next: res => {
        this.cargando.set(false);
        if (res.ok) {
          this.exito.set(true);
        } else {
          this.error.set(res.message);
        }
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(
          err?.error?.message ?? 'Error al duplicar la semilla. Intenta de nuevo.'
        );
      },
    });
  }

  // ─── Helpers de template ──────────────────────────────────────────────────
  nombreInstructor(id: number | null): string {
    if (!id) return '—';
    return this.instructores().find(i => i.id === id)?.nombre ?? '—';
  }

  nombreCompetencia(id: number | null): string {
    if (!id) return '—';
    const comp = this.competencias().find(c => c.id === id);
    return comp ? `${comp.codigo_norma} – ${comp.nombre.slice(0, 40)}` : '—';
  }

  trackByIndex(index: number) { return index; }
}