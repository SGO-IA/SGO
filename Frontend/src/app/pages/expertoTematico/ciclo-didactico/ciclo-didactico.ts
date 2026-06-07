import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CicloDidacticoPresentacion } from '../../../components/expertoTematico/ciclo-didactico-presentacion/ciclo-didactico-presentacion';
import { CicloDidacticoService } from '../../../services/expertoTematico/ciclo-didactico';
import { SemillasService } from '../../../services/expertoTematico/semillas'; // Importamos el servicio de semillas

@Component({
  selector: 'app-ciclo-didactico',
  standalone: true,
  imports: [CicloDidacticoPresentacion, RouterLink], 
  templateUrl: './ciclo-didactico.html'
})
export class CicloDidactico implements OnInit {
  private route = inject(ActivatedRoute);
  private cicloService = inject(CicloDidacticoService);
  private semillasService = inject(SemillasService); // Inyectamos para obtener el OVA
  
  mostrarAyuda = signal<boolean>(false);
  idSemilla = signal<string | null>(null);
  tieneCicloDidactico = signal<boolean>(false);
  ciclosActivos = signal<any[]>([]); // Almacenará los ciclos si existen

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idSemilla.set(id);
      this.verificarCiclosActivos(id);
    }
  }

  private verificarCiclosActivos(semillaId: string) {
    // 1. Obtenemos los RAPs y el OVA asociado a la Semilla
    this.semillasService.verificarEstadoRaps(semillaId).subscribe({
      next: (res) => {
        if (res.tieneAsignacion && res.raps.length > 0) {
          const ovaId = res.raps[0].ova_id;
          if (ovaId) {
            // 2. Si hay un OVA, consultamos sus ciclos
            this.cargarCiclosPorOva(ovaId);
          } else {
            this.tieneCicloDidactico.set(false);
          }
        } else {
          this.tieneCicloDidactico.set(false);
        }
      },
      error: (err) => console.error('Error al verificar asignación de RAPs:', err)
    });
  }

  private cargarCiclosPorOva(ovaId: number) {
    // 3. Consultamos el endpoint del protocolo SGO-Layered
    this.cicloService.getCiclosPorOva(ovaId).subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data.length > 0) {
          this.ciclosActivos.set(res.data);
          this.tieneCicloDidactico.set(true); // Cambiamos la bandera a true
        } else {
          this.tieneCicloDidactico.set(false);
        }
      },
      error: (err) => console.error('Error al cargar los ciclos didácticos:', err)
    });
  }

  toggleAyuda(): void { this.mostrarAyuda.update(estado => !estado); }
  cerrarAyuda(): void { this.mostrarAyuda.set(false); }
}