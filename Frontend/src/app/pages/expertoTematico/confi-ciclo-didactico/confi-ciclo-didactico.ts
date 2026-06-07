import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SemillasService } from '../../../services/expertoTematico/semillas';
import { CicloDataService } from '../../../services/expertoTematico/ciclo-data-service';
import { RapSelector } from '../../../components/expertoTematico/rap-selector/rap-selector';
import { FasesTabs } from '../../../components/expertoTematico/fases-tabs/fases-tabs';
import { ReflexionInicial } from '../../../components/expertoTematico/etapasCiclo/reflexion-inicial/reflexion-inicial';
import { Contextualizacion } from '../../../components/expertoTematico/etapasCiclo/contextualizacion/contextualizacion';
import { Apropiacion } from '../../../components/expertoTematico/etapasCiclo/apropiacion/apropiacion';
import { Transferencia } from '../../../components/expertoTematico/etapasCiclo/transferencia/transferencia';
import { ModalCrearCiclo } from '../../../components/expertoTematico/modal-crear-ciclo/modal-crear-ciclo';
import { CicloDidacticoService } from '../../../services/expertoTematico/ciclo-didactico';

@Component({
  selector: 'app-confi-ciclo-didactico',
  standalone: true,
  imports: [RapSelector, FasesTabs, ReflexionInicial, Contextualizacion, Apropiacion, Transferencia, ModalCrearCiclo],
  templateUrl: './confi-ciclo-didactico.html'
})
export class ConfiCicloDidactico implements OnInit {
  private route = inject(ActivatedRoute);
  private semillasService = inject(SemillasService);
  private cicloDidacticoService = inject(CicloDidacticoService);
  private cicloData = inject(CicloDataService);
  private router = inject(Router);

  rapsList = signal<any[]>([]);
  pasoActual = signal<'seleccion' | 'etapas' | 'editor' | 'existe'>('seleccion');

  faseActual = signal<number | null>(null);
  rapActual = signal<number | null>(null);
  ovaAsociado = signal<number | null>(null);
  mostrarModal = signal(false);
  etapaActiva = signal<string | null>(null);
  cicloIdVerificado = signal<number | null>(null);

  etapasInfo = [
    { nombre: 'Reflexión', icono: 'pi pi-bolt', desc: 'Despertar interés y saberes previos.' },
    { nombre: 'Contextualización', icono: 'pi pi-globe', desc: 'Relacionar el entorno con el tema.' },
    { nombre: 'Apropiación', icono: 'pi pi-cog', desc: 'Desarrollar habilidades técnicas.' },
    { nombre: 'Transferencia', icono: 'pi pi-send', desc: 'Aplicar lo aprendido en retos.' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarRaps(id);

    // Escuchamos los Query Params para saber si venimos de editar un ciclo existente
    this.route.queryParams.subscribe(params => {
      const step = params['step'];
      const cicloId = params['cicloId'];

      if (step === 'etapas' && cicloId) {
        // 1. Guardamos el ID del ciclo seleccionado en el servicio
        this.cicloData.setCicloId(Number(cicloId));
        // 2. Saltamos directamente a la vista de etapas
        this.pasoActual.set('etapas');
      }
    });
  }

  private cargarRaps(id: string) {
    this.semillasService.verificarEstadoRaps(id).subscribe(res => {
      if (res.tieneAsignacion) this.rapsList.set(res.raps);
    });
  }

continuarAlEditor() {
    const rapSeleccionado = this.rapsList().find(r => r.rap_id === this.rapActual() || r.id === this.rapActual());
    
    if (rapSeleccionado?.ova_id) {
        this.ovaAsociado.set(rapSeleccionado.ova_id);
        
        this.cicloDidacticoService.verificarCiclo(rapSeleccionado.ova_id, this.faseActual()!).subscribe(res => {
            if (res.existe && typeof res.ciclo_id === 'number') {
                this.cicloData.setCicloId(res.ciclo_id); 
                this.cicloIdVerificado.set(res.ciclo_id); // <--- Guardamos el ID aquí
                this.pasoActual.set('existe');
            } else {
                this.mostrarModal.set(true);
            }
        });
    } else {
        alert('Por favor selecciona un RAP válido');
    }
  }

  accederAEtapasConParams() {
    // Cambiamos la URL inyectando los Query Params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cicloId: this.cicloIdVerificado(), step: 'etapas' },
      queryParamsHandling: 'merge' // Mantiene el resto de la URL intacta
    });
    
    // Mostramos la vista de etapas
    this.pasoActual.set('etapas');
  }

  procesarCreacionCiclo(datos: any) {
    const payload = {
        ova_id: this.ovaAsociado()!,
        fase_proyecto_id: this.faseActual()!,
        titulo: datos.titulo,
        descripcion_general: datos.descripcion_general
    };

    this.cicloDidacticoService.crearCiclo(payload).subscribe({
        next: (res) => {
            // Sincronizamos el ID del nuevo ciclo creado
            this.cicloData.setCicloId(res.data.id); 
            this.mostrarModal.set(false);
            this.pasoActual.set('etapas');
        },
        error: (err) => console.error('❌ Error al crear ciclo:', err)
    });
  }

  // Setters y Navegación
  manejarSeleccionFase = (id: number) => this.faseActual.set(id);
  manejarSeleccionRap = (id: number) => this.rapActual.set(id);
  puedeContinuar = computed(() => this.faseActual() !== null && this.rapActual() !== null);
  seleccionarEtapa = (e: string) => { this.etapaActiva.set(e); this.pasoActual.set('editor'); };

  volverASeleccion() {
    this.pasoActual.set('seleccion');
  }

  volverAEtapas() {
    this.pasoActual.set('etapas');
  }
}