import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { SemillaRadiografia, Semillasrector } from '../../../services/rector/semillas';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-revision-semilla',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './modal-revision-semillas.html',
})
export class ModalRevisionSemilla implements OnInit {
  @Input({ required: true }) semillaId!: number;
  @Output() cerrar = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<number>();
  @Output() rechazar = new EventEmitter<{ id: number, motivo: string }>();

  private rectorService = inject(Semillasrector);

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  detalle = signal<SemillaRadiografia | null>(null);
  mostrandoRechazo = signal<boolean>(false);
  motivoRechazo = signal<string>('');

  ngOnInit(): void {
    this.cargarRadiografia();
  }

  cargarRadiografia() {
    this.cargando.set(true);
    this.rectorService.getDetalleSemilla(this.semillaId).subscribe({
      next: (res) => {
        if (res.ok) {
          this.detalle.set(res.data);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("Error al cargar detalles de la semilla", err);
        this.error.set("No se pudo cargar la información detallada.");
        this.cargando.set(false);
      }
    });
  }

  iniciarRechazo() {
    this.mostrandoRechazo.set(true);
  }

  cancelarRechazo() {
    this.mostrandoRechazo.set(false);
    this.motivoRechazo.set(''); // Limpiamos el campo por si se arrepiente
  }

  confirmarRechazo(id: number) {
    if (this.motivoRechazo().trim().length < 15) return; // Validación básica
    this.rechazar.emit({ id, motivo: this.motivoRechazo().trim() });
  }
}