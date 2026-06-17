import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { SemillaRadiografia, Semillasrector } from '../../../services/rector/semillas';

@Component({
  selector: 'app-modal-revision-semilla',
  standalone: true,
  templateUrl: './modal-revision-semillas.html',
})
export class ModalRevisionSemilla implements OnInit {
  @Input({ required: true }) semillaId!: number;
  @Output() cerrar = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<number>(); // Para cuando decidas hacer el endpoint de aprobar

  private rectorService = inject(Semillasrector);

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  detalle = signal<SemillaRadiografia | null>(null);

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
}