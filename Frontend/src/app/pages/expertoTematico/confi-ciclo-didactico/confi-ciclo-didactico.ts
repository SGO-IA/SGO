import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Servicios
import { SemillasService } from '../../../services/expertoTematico/semillas';

// Componentes de Selección
import { RapSelector } from '../../../components/expertoTematico/rap-selector/rap-selector';
import { FasesTabs } from '../../../components/expertoTematico/fases-tabs/fases-tabs';

// Componentes de Etapas
import { ReflexionInicial } from '../../../components/expertoTematico/etapasCiclo/reflexion-inicial/reflexion-inicial';
import { Contextualizacion } from '../../../components/expertoTematico/etapasCiclo/contextualizacion/contextualizacion';
import { Apropiacion } from '../../../components/expertoTematico/etapasCiclo/apropiacion/apropiacion';
import { Transferencia } from '../../../components/expertoTematico/etapasCiclo/transferencia/transferencia';
import { CicloDataService } from '../../../services/expertoTematico/ciclo-data-service';

@Component({
  selector: 'app-confi-ciclo-didactico',
  standalone: true,
  imports: [
    RapSelector, 
    FasesTabs, 
    ReflexionInicial, 
    Contextualizacion, 
    Apropiacion, 
    Transferencia
  ],
  templateUrl: './confi-ciclo-didactico.html'
})
export class ConfiCicloDidactico implements OnInit {
  private route = inject(ActivatedRoute);
  private semillasService = inject(SemillasService);
  private cicloData = inject(CicloDataService);
  
  // Estados de flujo
  rapsList = signal<any[]>([]);
  pasoActual = signal<'seleccion' | 'etapas' | 'editor'>('seleccion');
  
  // Datos seleccionados
  faseActual = signal<number | null>(null);
  rapActual = signal<number | null>(null);
  etapaActiva = signal<string | null>(null);
  etapasInfo = [
    { 
      nombre: 'Reflexión', 
      icono: 'pi pi-bolt', // Un rayo para representar la idea/chispa
      desc: 'Despertar interés y saberes previos.' 
    },
    { 
      nombre: 'Contextualización', 
      icono: 'pi pi-globe', // El mundo para el contexto global
      desc: 'Relacionar el entorno con el tema.' 
    },
    { 
      nombre: 'Apropiación', 
      icono: 'pi pi-cog', // Engranaje técnico
      desc: 'Desarrollar habilidades técnicas.' 
    },
    { 
      nombre: 'Transferencia', 
      icono: 'pi pi-send', // Flecha de envío/transferencia
      desc: 'Aplicar lo aprendido en retos.' 
    }
  ];

  ngOnInit(): void {
    const semillaId = this.route.snapshot.paramMap.get('id');
    if (semillaId) {
      this.semillasService.verificarEstadoRaps(semillaId).subscribe((res) => {
        if (res.tieneAsignacion) {
          this.rapsList.set(res.raps); 
        }
      });
    }
  }

  // Lógica de selección
  manejarSeleccionFase(faseId: number) {
    this.faseActual.set(faseId);
  }

  manejarSeleccionRap(rapId: number) {
    this.rapActual.set(rapId);
  }

  // Validación para habilitar el botón continuar
  puedeContinuar = computed(() => this.faseActual() !== null && this.rapActual() !== null);

  // Navegación de estados
  continuarAlEditor() {
    if (this.faseActual() && this.rapActual()) {
      // Aquí guardas los datos globalmente
      this.cicloData.setSeleccion(this.faseActual()!, this.rapActual()!);
      this.pasoActual.set('etapas');
    }
  }

  seleccionarEtapa(etapa: string) {
    this.etapaActiva.set(etapa);
    this.pasoActual.set('editor');
  }

  volverASeleccion() {
    this.pasoActual.set('seleccion');
  }

  volverAEtapas() {
    this.pasoActual.set('etapas');
  }
}