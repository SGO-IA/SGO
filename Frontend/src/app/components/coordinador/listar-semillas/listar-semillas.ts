import { Component, inject, OnInit, signal, computed, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramasService, SemillaLista } from '../../../services/coordinador/programas';
import { DetalleSemillaComponent } from '../detalle-semilla-component/detalle-semilla-component';
import { ModalDuplicarSemillaComponent } from '../publicarsemilla/publicarsemilla';

@Component({
  selector: 'app-listar-semillas',
  standalone: true,
  imports: [CommonModule, DetalleSemillaComponent, ModalDuplicarSemillaComponent],
  templateUrl: './listar-semillas.html',
  styleUrl: './listar-semillas.css'
})
export class ListarSemillasComponent implements OnInit {
  private programaService = inject(ProgramasService);

  // Evento para avisarle al padre que abra el modal de creación
  @Output() onCrearSemilla = new EventEmitter<void>();
  @ViewChild('modalDetalle') modalDetalle!: DetalleSemillaComponent;
  @ViewChild(ModalDuplicarSemillaComponent) modalPublicar!: ModalDuplicarSemillaComponent;

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

  public gestionarAccionSemilla(semilla: any): void {
    if (semilla.estado === 'aprobada') {
      // 1. Clonamos la semilla y le agregamos la propiedad 'id' explícita
      // porque el modal espera 'id' en lugar de 'semilla_id'
      const semillaAdaptada = {
        ...semilla,
        id: semilla.semilla_id
      };
      
      // 2. Llamamos al método correcto del modal (se llama 'abrir')
      this.modalPublicar.abrir(semillaAdaptada); 
      
    } else {
      // Para cualquier otro estado, abrimos el detalle normal
      this.modalDetalle.abrirModalConSemilla(semilla.semilla_id);
    }
  }
}