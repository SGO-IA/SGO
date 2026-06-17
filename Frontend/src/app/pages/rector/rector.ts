import { Component, inject, OnInit, signal } from '@angular/core';
import { SemillaPendiente, Semillasrector } from '../../services/rector/semillas';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-rector',
  standalone: true,
  imports: [RouterModule],
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
}