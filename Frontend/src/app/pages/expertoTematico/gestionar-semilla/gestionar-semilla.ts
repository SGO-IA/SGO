import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SemillasService } from '../../../services/expertoTematico/semillas';

@Component({
  selector: 'app-gestionar-semilla',
  standalone: true,
  imports: [],
  templateUrl: './gestionar-semilla.html',
  styleUrl: './gestionar-semilla.css',
})
export class GestionarSemilla {
  private route = inject(ActivatedRoute);
  public semillaService = inject(SemillasService); 

  semillaId = signal<string>('');
  rapIdsSeleccionados = new Set<number>();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.semillaId.set(id);
      this.cargarFlujoInicial();
    }
  }

  cargarFlujoInicial(): void {
    this.semillaService.verificarEstadoRaps(this.semillaId()).subscribe({
      error: (err) => console.error('Error al mapear estructura de RAPs:', err)
    });
  }

  onToggleRap(rapId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.rapIdsSeleccionados.add(rapId);
    } else {
      this.rapIdsSeleccionados.delete(rapId);
    }
  }

  confirmarSeleccionRaps(): void {
    if (this.rapIdsSeleccionados.size === 0) return;

    const idsArray = Array.from(this.rapIdsSeleccionados);
    this.semillaService.guardarAsignacionRaps(this.semillaId(), idsArray).subscribe({
      next: () => this.cargarFlujoInicial(), // Re-sincroniza automáticamente los signals
      error: (err) => console.error('Error al guardar asignaciones:', err)
    });
  }
}
