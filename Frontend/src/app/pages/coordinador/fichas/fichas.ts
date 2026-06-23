import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)] del buscador
import { FichaListado, FichasService } from '../../../services/coordinador/fichas';
import { ModalCrearFichaComponent } from '../../../components/coordinador/crear-ficha/crear-ficha';

@Component({
  selector: 'app-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCrearFichaComponent],
  templateUrl: './fichas.html',
  styleUrl: './fichas.css',
})
export class Fichas implements OnInit {
  private fichasSvc = inject(FichasService);

  // ─── ESTADO (Signals) ─────────────────────────────────────────────────────
  fichas = signal<FichaListado[]>([]);
  busqueda = signal<string>('');
  fichaSeleccionada = signal<FichaListado | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  // ─── BUSCADOR EN TIEMPO REAL ──────────────────────────────────────────────
  // Angular recalcula esto automáticamente cuando 'busqueda()' o 'fichas()' cambian
  fichasFiltradas = computed(() => {
    const termino = this.busqueda().toLowerCase().trim();
    
    // Si el buscador está vacío, mostramos todas
    if (!termino) {
      return this.fichas();
    }
    
    // Si hay texto, filtramos por código de ficha o por nombre del programa
    return this.fichas().filter(f => 
      f.codigoFicha.toLowerCase().includes(termino) ||
      f.programaNombre.toLowerCase().includes(termino)
    );
  });

  // ─── CICLO DE VIDA ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ─── MÉTODOS ──────────────────────────────────────────────────────────────
  cargarDatos() {
    this.cargando.set(true);
    this.error.set(null);

    this.fichasSvc.getFichasConAprendices().subscribe({
      next: (res) => {
        if (res.ok) {
          this.fichas.set(res.data);
        } else {
          this.error.set(res.message);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar fichas:', err);
        this.error.set('No se pudieron cargar las fichas. Revisa tu conexión.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarFicha(ficha: FichaListado) {
    this.fichaSeleccionada.set(ficha);
  }

  cerrarDetalle() {
    this.fichaSeleccionada.set(null);
  }

  // Método opcional por si quieres limpiar el buscador rápido
  limpiarBusqueda() {
    this.busqueda.set('');
  }
}