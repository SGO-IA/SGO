import { Component, computed, signal } from '@angular/core';
import { ExpertoService } from '../../../services/coordinador/experto-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-expertos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-expertos.html',
  styleUrl: './listar-expertos.css',
})
export class ListarExpertos {
// Señales para manejar el estado de forma eficiente
  expertos = signal<any[]>([]);
  searchQuery = signal<string>('');
  loading = signal<boolean>(true);

  expertoSeleccionado = signal<any | null>(null);
  modalAbierto = signal<boolean>(false);

  // Filtro reactivo en tiempo real por nombre de experto
  expertosFiltrados = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.expertos();
    return this.expertos().filter(experto => 
      experto.nombre.toLowerCase().includes(query)
    );
  });

  constructor(private expertosService: ExpertoService) {}

  ngOnInit(): void {
    this.cargarExpertos();
  }

  abrirModal(experto: any): void {
    this.expertoSeleccionado.set(experto);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    setTimeout(() => this.expertoSeleccionado.set(null), 300); // Espera a la animación de salida
  }

  cargarExpertos(): void {
    this.expertosService.getExpertos().subscribe({
      next: (data) => {
        this.expertos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar expertos temáticos:', err);
        this.loading.set(false);
      }
    });
  }

  // Helper para pintar badges de estado de la semilla
  getBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      'en_construccion': 'bg-amber-50 text-amber-700 border-amber-100',
      'pendiente_rector': 'bg-blue-50 text-blue-700 border-blue-100',
      'aprobada': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'rechazada': 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return classes[estado] || 'bg-gray-50 text-gray-700 border-gray-100';
  }

  formatearEstado(estado: string): string {
    return estado ? estado.replace('_', ' ') : '';
  }
}
