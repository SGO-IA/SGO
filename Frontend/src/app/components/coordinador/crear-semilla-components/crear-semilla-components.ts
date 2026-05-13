import { Component, EventEmitter, inject, Output, signal, OnInit } from '@angular/core';
import { ProgramasService } from '../../../services/coordinador/programas';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el selector de expertos
import { ExpertoService } from '../../../services/coordinador/experto-service';

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
  expertos = signal<any[]>([]);
  estructuraSeleccionada = signal<any>(null);
  
  // Signals de UI/Estado
  loading = signal<boolean>(false);
  mostrarExpertos = signal<boolean>(false);
  
  // Datos del formulario
  expertosSeleccionados = signal<number[]>([]);

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

  // Lógica para el botón "Continuar"
  irAExpertos() {
    if (this.estructuraSeleccionada()) {
      this.mostrarExpertos.set(true);
    }
  }

  // Guardado final en la base de datos
  confirmarCreacion() {
    if (this.expertosSeleccionados().length === 0) return;

    const payload = {
      programa_id: this.estructuraSeleccionada()[0].programa_id, // Ajusta según tu respuesta del backend
      expertos: this.expertosSeleccionados(),
      nombre_semilla: `Semilla - ${this.estructuraSeleccionada()[0].nombre_programa || 'Nueva'}`
    };

    this.loading.set(true);
    this.expertoService.crearSemilla(payload).subscribe({
      next: (res) => {
        console.log('Semilla creada con éxito:', res);
        this.loading.set(false);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error al crear semilla:', err);
        this.loading.set(false);
      }
    });
  }

  getTotalRaps(): number {
    if (!this.estructuraSeleccionada()) return 0;
    return this.estructuraSeleccionada().reduce((acc: number, comp: any) => acc + (comp.raps?.length || 0), 0);
  }

  // En tu CrearSemillaComponent
toggleExperto(id: number) {
  const actuales = this.expertosSeleccionados();
  if (actuales.includes(id)) {
    this.expertosSeleccionados.set(actuales.filter(itemId => itemId !== id));
  } else {
    this.expertosSeleccionados.set([...actuales, id]);
  }
}

isSelected(id: number): boolean {
  return this.expertosSeleccionados().includes(id);
}

  cancelar() {
    this.close.emit();
  }
}