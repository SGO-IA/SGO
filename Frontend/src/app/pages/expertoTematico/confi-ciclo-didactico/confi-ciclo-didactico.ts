import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SemillasService } from '../../../services/expertoTematico/semillas';
import { RapSelector } from '../../../components/expertoTematico/rap-selector/rap-selector';

@Component({
  selector: 'app-confi-ciclo-didactico',
  standalone: true,
  imports: [RapSelector],
  templateUrl: './confi-ciclo-didactico.html'
})
export class ConfiCicloDidactico implements OnInit {
  private route = inject(ActivatedRoute);
  private semillasService = inject(SemillasService);
  
  // Señal que contendrá los RAPs para el dropdown
  rapsList = signal<any[]>([]);

  ngOnInit(): void {
    const semillaId = this.route.snapshot.paramMap.get('id');
    if (semillaId) {
      this.semillasService.verificarEstadoRaps(semillaId).subscribe((res) => {
        if (res.tieneAsignacion) {
          // Aquí están los RAPs que el experto ya seleccionó
          this.rapsList.set(res.raps); 
        }
      });
    }
  }

  // Componente rap selector
  // En tu ts padre:
  manejarSeleccion(rapId: number) {
    console.log('El experto seleccionó el RAP:', rapId);
  }
}