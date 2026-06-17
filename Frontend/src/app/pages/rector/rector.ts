import { Component, inject, OnInit, signal } from '@angular/core';
import { SemillaPendiente, Semillasrector } from '../../services/rector/semillas';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rector',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './rector.html',
  styleUrl: './rector.css',
})
export class Rector implements OnInit{
  private rectorService = inject(Semillasrector);
  private router = inject(Router);

  semillasList = signal<SemillaPendiente[]>([]);
  cargando = signal<boolean>(true);
  mensajeError = signal<string | null>(null);

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

  revisarSemilla(id: number): void {
    this.router.navigate(['/dashboard/rector/semilla', id, 'ovas']);
  }

  cambiarEstadoSemilla(id: number, nuevoEstado: 'Aceptada' | 'Rechazada'): void {
  Swal.fire({
    title: `¿Confirmar ${nuevoEstado}?`,
    text: `La semilla será marcada como ${nuevoEstado}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: nuevoEstado === 'Aceptada' ? '#22c55e' : '#ef4444'
  }).then((result) => {
    if (result.isConfirmed) {
        // Llamada a tu servicio (debes tener este método creado en Semillasrector)
        this.rectorService.actualizarEstado(id, nuevoEstado).subscribe({
          next: () => {
            Swal.fire('¡Éxito!', `La semilla ha sido ${nuevoEstado}.`, 'success');
            this.cargarSemillasPendientes(); // Recarga la lista para quitar la semilla de "Pendientes"
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
          }
        });
      }
    });
  }
}