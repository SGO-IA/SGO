import { Component, EventEmitter, inject, Output, signal, OnInit, computed } from '@angular/core';
import { CrearSemillaPayload, ProgramasService } from '../../../services/coordinador/programas';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpertoService } from '../../../services/coordinador/experto-service';

interface Competencia {
  id: number;
  programa_id: number;
  codigo_norma: string;
  nombre: string;
  raps?: any[];
}

interface Experto {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

@Component({
  selector: 'app-crear-semilla-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-semilla-component.html',
  styleUrl: './crear-semilla-component.css',
})
export class CrearSemillaComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  // Inyección de servicios
  private programaService = inject(ProgramasService);
  private expertoService = inject(ExpertoService);
  
  // Signals de Datos
  programas = signal<any[]>([]);
  expertos = signal<Experto[]>([]);
  estructuraSeleccionada = signal<Competencia[] | null>(null);
  
  // Signals de UI/Estado
  loading = signal<boolean>(false);
  mostrarExpertos = signal<boolean>(false);
  showCompetenciasModal = signal<boolean>(false);
  expertoEnEdicion = signal<Experto | null>(null);
  
  // 🔥 AQUÍ ESTÁ LA MAGIA: Guardamos las asignaciones de forma estructurada
  asignacionesExpertos = signal<{ [key: number]: number[] }>({});

  // 🔥 EL ARREGLO QUE DESBLOQUEA EL BOTÓN: Es reactivo y se calcula solo basado en las asignaciones
  expertosSeleccionados = computed(() => Object.keys(this.asignacionesExpertos()).map(Number));

  ngOnInit() {
    this.cargarProgramas();
    this.cargarExpertos();
  }

  cargarProgramas() {
    this.programaService.getProgramasSelector().subscribe({
      next: (data) => this.programas.set(data),
      error: (err) => console.error('Error al cargar programas:', err)
    });
  }

  cargarExpertos() {
    this.expertoService.getExpertos().subscribe({
      next: (data) => this.expertos.set(data),
      error: (err) => console.error('Error al cargar expertos:', err)
    });
  }

  onProgramaChange(event: any) {
    const id = event.target.value;
    if (!id) return;

    this.loading.set(true);
    this.programaService.getEstructuraPrograma(id).subscribe({
      next: (res) => {
        this.estructuraSeleccionada.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
  }

  irAExpertos() {
    if (this.estructuraSeleccionada()) {
      this.mostrarExpertos.set(true);
    }
  }

  // --- LÓGICA DEL SUB-MODAL DE COMPETENCIAS ---
  abrirAsignacionCompetencias(experto: Experto): void {
    this.expertoEnEdicion.set(experto);
    
    if (!this.asignacionesExpertos()[experto.id]) {
      this.asignacionesExpertos.update(prev => ({ ...prev, [experto.id]: [] }));
    }
    
    this.showCompetenciasModal.set(true);
  }

  toggleCompetenciaEnExperto(competenciaId: number): void {
    const expId = this.expertoEnEdicion()?.id;
    if (!expId) return;

    this.asignacionesExpertos.update(prev => {
      const actuales = prev[expId] ? [...prev[expId]] : [];
      const index = actuales.indexOf(competenciaId);
      
      if (index > -1) {
        actuales.splice(index, 1); 
      } else {
        actuales.push(competenciaId); 
      }

      const copia = { ...prev, [expId]: actuales };
      
      if (actuales.length === 0) {
        delete copia[expId];
      }
      
      return copia;
    });
  }

  isCompetenciaChecked(competenciaId: number): boolean {
    const expId = this.expertoEnEdicion()?.id;
    if (!expId) return false;
    return this.asignacionesExpertos()[expId]?.includes(competenciaId) || false;
  }

  isExpertoAsignado(expertoId: number): boolean {
    return !!this.asignacionesExpertos()[expertoId] && this.asignacionesExpertos()[expertoId].length > 0;
  }

  getContadorCompetencias(expertoId: number): number {
    return this.asignacionesExpertos()[expertoId]?.length || 0;
  }

  limpiarAsignaciones(): void {
    this.asignacionesExpertos.set({});
  }

  // --- GUARDADO FINAL ---
  confirmarCreacion() {
    const estructura = this.estructuraSeleccionada();
    if (!estructura || estructura.length === 0 || this.expertosSeleccionados().length === 0) return;

    const payload: CrearSemillaPayload = {
      programa_id: estructura[0].programa_id, 
      nombre_semilla: `Semilla - ${estructura[0].nombre || 'Nueva Plantilla'}`,
      expertos: this.asignacionesExpertos() 
    };

    this.loading.set(true);
    
    this.programaService.crearSemillaCompleta(payload).subscribe({
      next: (res) => {
        console.log('Semilla y mapeo de expertos guardados en el SGO:', res);
        this.loading.set(false);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error al crear la semilla:', err);
        this.loading.set(false);
      }
    });
  }

  getTotalRaps(): number {
    if (!this.estructuraSeleccionada()) return 0;
    return this.estructuraSeleccionada()!.reduce((acc: number, comp: any) => acc + (comp.raps?.length || 0), 0);
  }

  cancelar() {
    this.close.emit();
  }
}