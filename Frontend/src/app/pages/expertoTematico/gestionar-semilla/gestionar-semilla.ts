import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SemillasService } from '../../../services/expertoTematico/semillas';
import { RapsDisponiblesComponent } from '../../../components/expertoTematico/raps-disponibles-component/raps-disponibles-component';
import { RapsTrabajandoComponent } from '../../../components/expertoTematico/raps-trabajando-component/raps-trabajando-component';
interface CompetenciaAgrupada {
  competenciaId: number;
  competenciaNombre: string;
  raps: any[];
}

@Component({
  selector: 'app-gestionar-semilla',
  standalone: true,
  imports: [RapsDisponiblesComponent, RapsTrabajandoComponent],
  templateUrl: './gestionar-semilla.html',
  styleUrl: './gestionar-semilla.css',
})
export class GestionarSemilla {
  private route = inject(ActivatedRoute);
  public semillaService = inject(SemillasService);
  private router = inject(Router);

  semillaId = signal<string>('');
  rapIdsSeleccionados = new Set<number>();

  // gestionar-semilla.ts
ngOnInit(): void {
    // Bandera inicial: Rastreo del componente
    console.log('🚩 [GestionarSemilla] ¡ngOnInit ejecutándose!');
    
    const id = this.route.snapshot.paramMap.get('id');
    
    console.log('🚩 [GestionarSemilla] ID de semilla obtenido de la URL:', id);

    if (id) {
      this.semillaId.set(id);
      
      console.log('🚩 [GestionarSemilla] Iniciando petición a verificarEstadoRaps...');
      
this.semillaService.verificarEstadoRaps(id).subscribe({
  next: (res) => {
    console.log('🚩 [GestionarSemilla] Respuesta recibida (next):', res);
    
    // REGLA DE SEGURIDAD ESTRICTA:
    // Si status es 'error' O si no tiene asignación (caso semilla 89), expulsamos.
    if (res.status === 'error' || res.tieneAsignacion === false) {
      console.warn('🚩 [GestionarSemilla] Acceso no autorizado o datos inválidos. Redirigiendo...');
      this.router.navigate(['/dashboard/panel']);
      return;
    }
    
    console.log('🚩 [GestionarSemilla] Validación exitosa. Cargando flujo inicial.');
    this.cargarFlujoInicial();
  },
  error: (err) => {
    console.error('🚩 [GestionarSemilla] Error HTTP:', err);
    this.router.navigate(['/dashboard/panel']);
  }
});
    } else {
      console.error('🚩 [GestionarSemilla] No se encontró ID en la URL.');
      this.router.navigate(['/dashboard/panel']);
    }
  }

  cargarFlujoInicial(): void {
    this.semillaService.verificarEstadoRaps(this.semillaId()).subscribe({
      error: (err) => console.error('Error al mapear estructura de RAPs:', err)
    });
  }

  get competenciasConRaps(): CompetenciaAgrupada[] {
    // Obtenemos los RAPs directamente desde el signal reactivo de tu servicio
    const raps = this.semillaService.rapsDisponiblesParaSeleccionar();
    const grupos: { [key: number]: CompetenciaAgrupada } = {};

    raps.forEach((rap: any) => {
      // Extrae las llaves exactas mapeadas con alias desde tu Backend en Node.JS
      const compId = rap.competencia_id || 0; 
      const compNombre = rap.competencia_nombre || 'Competencia Sin Asignar';

      if (!grupos[compId]) {
        grupos[compId] = {
          competenciaId: compId,
          competenciaNombre: compNombre,
          raps: []
        };
      }
      grupos[compId].raps.push(rap);
    });

    return Object.values(grupos);
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
      next: () => {
        this.rapIdsSeleccionados.clear(); // Limpia el Set local tras una asignación exitosa
        this.cargarFlujoInicial();        // Re-sincroniza automáticamente los signals de SGO
      }, 
      error: (err) => console.error('Error al guardar asignaciones:', err)
    });
  }
}