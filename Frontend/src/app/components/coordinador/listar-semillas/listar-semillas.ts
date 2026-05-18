import { Component, inject, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramasService, SemillaLista } from '../../../services/coordinador/programas';

@Component({
  selector: 'app-listar-semillas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-semillas.html',
  styleUrl: './listar-semillas.css'
})
export class ListarSemillasComponent implements OnInit {
  private programaService = inject(ProgramasService);

  // Evento para avisarle al padre que abra el modal de creación
  @Output() onCrearSemilla = new EventEmitter<void>();

  // Signals de estado local
  public semillas = signal<SemillaLista[]>([]);
  public loading = signal<boolean>(false);
  public filtroActivo = signal<string>('todas');

  // Filtro reactivo optimizado
  public semillasFiltradas = computed(() => {
    const actuales = this.semillas();
    const filtro = this.filtroActivo();
    
    if (filtro === 'todas') return actuales;
    return actuales.filter(s => s.estado === filtro);
  });

  ngOnInit(): void {
    this.cargarSemillas();
  }

  public cargarSemillas(): void {
    this.loading.set(true);
    this.programaService.getListaSemillas().subscribe({
      next: (data) => {
        this.semillas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al recuperar las semillas:', err);
        this.loading.set(false);
      }
    });
  }
}