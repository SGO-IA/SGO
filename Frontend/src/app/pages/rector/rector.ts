import { Component, inject, OnInit, signal } from '@angular/core';
import { SemillaPendiente, Semillasrector } from '../../services/rector/semillas';
import { Router, RouterModule } from '@angular/router';
import { ModalRevisionSemilla } from '../../components/rector/modal-revision-semillas/modal-revision-semillas';

@Component({
  selector: 'app-rector',
  standalone: true,
  imports: [RouterModule, ModalRevisionSemilla],
  templateUrl: './rector.html',
  styleUrl: './rector.css',
})
export class Rector implements OnInit{
  private rectorService = inject(Semillasrector);
  private router = inject(Router);

  // Estados gestionados con Signals
  semillasList = signal<SemillaPendiente[]>([]);
  cargando = signal<boolean>(true);
  mensajeError = signal<string | null>(null);
  modalAbierto = signal<boolean>(false);
  semillaSeleccionada = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarSemillasPendientes();
  }

  cargarSemillasPendientes(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.rectorService.getSemillasPendientes().subscribe({
      next: (res) => {
        if (res.ok) {
          this.semillasList.set(res.data);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando semillas:', err);
        this.mensajeError.set('No se pudieron cargar las semillas pendientes. Intenta nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  // Navega a la vista de detalle/revisión de la semilla
  revisarSemilla(id: number): void {
    // En lugar de hacer router.navigate, abrimos el modal
    this.semillaSeleccionada.set(id);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    setTimeout(() => this.semillaSeleccionada.set(null), 200); // Limpia después de la animación
  }

  aprobarSemillaFinal(id: number): void {
    console.log("Aprobar semilla:", id);
    // Aquí luego llamarás al backend para UPDATE estado = 'aprobada'
  }
}
