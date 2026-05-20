import { Component, inject, signal } from '@angular/core';
import { ProgramasService } from '../../../services/coordinador/programas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-semilla-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-semilla-component.html',
  styleUrl: './detalle-semilla-component.css',
})
export class DetalleSemillaComponent {
  private programasService = inject(ProgramasService);
  
  semillaDetalle = signal<any>(null);
  cargando = signal<boolean>(false);

  abrirModalConSemilla(semillaId: number) {
    this.cargando.set(true);
    
    this.programasService.getDetalleCompletoSemilla(semillaId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.semillaDetalle.set(res.data);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al traer la semilla', err);
        this.cargando.set(false);
      }
    });
  }
}