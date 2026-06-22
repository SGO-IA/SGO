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

  cambiarEstadoSemilla(id: number, nuevoEstado: 'aprobada' | 'rechazada'): void {
    const esRechazo = nuevoEstado === 'rechazada';

    Swal.fire({
      title: esRechazo ? 'Rechazar Semilla' : 'Aprobar Semilla',
      text: esRechazo 
        ? 'Por favor, indica el motivo del rechazo para que los expertos puedan corregirlo.' 
        : '¿Estás seguro de aprobar esta semilla? Pasará a la siguiente fase.',
      icon: esRechazo ? 'warning' : 'question',
      input: esRechazo ? 'textarea' : undefined, // Solo pide texto si es rechazo
      inputPlaceholder: 'Escribe el motivo del rechazo aquí...',
      inputValidator: (value: string) => { 
        if (esRechazo && !value) {
          return '¡Debes escribir un motivo de rechazo!';
        }
        return null; // SweetAlert espera null si la validación es correcta
      },
      showCancelButton: true,
      confirmButtonText: esRechazo ? 'Rechazar' : 'Aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: esRechazo ? '#ef4444' : '#22c55e',
    }).then((result) => {
      if (result.isConfirmed) {
        // Extraemos el texto del textarea de SweetAlert
        const comentario = esRechazo ? result.value : undefined;

        this.rectorService.actualizarEstado(id, nuevoEstado, comentario).subscribe({
          next: () => {
            Swal.fire(
              '¡Procesado!', 
              `La semilla ha sido ${nuevoEstado}.`, 
              'success'
            );
            this.cargarSemillasPendientes(); // Recarga la tabla
          },
          error: (err) => {
            Swal.fire(
              'Error', 
              err.error?.message || 'No se pudo actualizar la semilla.', 
              'error'
            );
          }
        });
      }
    });
  }
}