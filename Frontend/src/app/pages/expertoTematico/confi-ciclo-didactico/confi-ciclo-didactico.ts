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
  private route                 = inject(ActivatedRoute);
  private semillasService       = inject(SemillasService);
  private cicloDidacticoService = inject(CicloDidacticoService);
  private cicloData             = inject(CicloDataService);
  private router                = inject(Router);

  rapsList          = signal<any[]>([]);
  pasoActual        = signal<'seleccion' | 'etapas' | 'editor' | 'existe'>('seleccion');
  faseActual        = signal<number | null>(null);
  rapActual         = signal<number | null>(null);
  ovaAsociado       = signal<number | null>(null);
  mostrarModal      = signal(false);
  etapaActiva       = signal<string | null>(null);
  cicloIdVerificado = signal<number | null>(null);
  cicloListo      = signal(false);
  estadoSecciones = signal<any[]>([]);
  cargandoEstado  = signal(false);
  mensajeErrorFinalizar = signal<string | null>(null);

  private readonly ETAPAS_CON_TEST: Record<string, string> = {
    'Apropiación':   'Apropiacion',
    'Transferencia': 'Transferencia'
  };

  etapasInfo = [
    { nombre: 'Reflexión',         icono: 'pi pi-bolt',  desc: 'Despertar interés y saberes previos.' },
    { nombre: 'Contextualización', icono: 'pi pi-globe', desc: 'Relacionar el entorno con el tema.'   },
    { nombre: 'Apropiación',       icono: 'pi pi-cog',   desc: 'Desarrollar habilidades técnicas.'    },
    { nombre: 'Transferencia',     icono: 'pi pi-send',  desc: 'Aplicar lo aprendido en retos.'       }
  ];

  ngOnInit(): void {
    const idSemilla = this.route.snapshot.paramMap.get('id');

    if (!idSemilla) {
      this.router.navigate(['/dashboard/panel']);
      return;
    }

    this.semillasService.verificarEstadoRaps(idSemilla).subscribe({
      next: (res) => {
        if (res.status === 'error' || res.tieneAsignacion === false) {
          this.router.navigate(['/dashboard/panel']);
          return;
        }

        this.cargarRaps(idSemilla);

        this.route.queryParams.subscribe(params => {
          const step         = params['step'];
          const cicloIdParam = params['cicloId'];

          if (step === 'etapas' && cicloIdParam) {
            const cicloIdNum = Number(cicloIdParam);

            if (isNaN(cicloIdNum)) {
              this.expulsarPorUrlInvalida(idSemilla);
              return;
            }

            this.semillasService.verificarAccesoCiclo(idSemilla, cicloIdNum, step).subscribe({
              next: () => {
                this.cicloData.setCicloId(cicloIdNum);
                this.cicloIdVerificado.set(cicloIdNum);
                this.pasoActual.set('etapas');
                // ── Validación al llegar por URL ─────────────────────────
                this.verificarEstadoCiclo(cicloIdNum);
              },
              error: () => this.expulsarPorUrlInvalida(idSemilla)
            });
          }
        });
      },
      error: () => this.router.navigate(['/dashboard/panel'])
    });
  }

// Consulta al backend sobre el estado del ciclo didactico
  private verificarEstadoCiclo(cicloId: number): void {
    this.cargandoEstado.set(true);

    this.cicloDidacticoService.getEstadoCiclo(cicloId).subscribe({
      next: (res) => {
        this.cicloListo.set(res.data.listo_para_finalizar);
        this.estadoSecciones.set(res.data.secciones);
        this.cargandoEstado.set(false);
      },
      error: (err) => {
        console.error('❌ Error verificando estado del ciclo:', err);
        this.cargandoEstado.set(false);
      }
    });
  }

  // Usado en el HTML para saber si mostrar el badge en la tarjeta
  etapaRequiereTest(nombreUI: string): boolean {
    return nombreUI in this.ETAPAS_CON_TEST;
  }

  etapaTieneTest(nombreUI: string): boolean {
    const tipoBackend = this.ETAPAS_CON_TEST[nombreUI];
    const seccion = this.estadoSecciones().find(s => s.tipo_seccion === tipoBackend);
    return seccion ? seccion.tiene_test : false;
  }

  // ── El experto presiona "Terminar ciclo" ──────────────────────────────────
terminarCiclo(): void {
    const cicloId = this.cicloIdVerificado();
    if (!cicloId) return;

    this.mensajeErrorFinalizar.set(null); // Limpiamos errores previos

    this.cicloDidacticoService.finalizarCiclo(cicloId).subscribe({
      next: (res) => {
        console.log('✅ Ciclo finalizado:', res.mensaje);
        this.router.navigate(['/dashboard/panel']);
      },
      error: (err) => {
        console.error('❌ No se pudo finalizar:', err);
        // ✅ NUEVO: Mostramos el error detallado que envía tu backend Node.js
        this.mensajeErrorFinalizar.set(err.error?.mensaje || 'Error desconocido al finalizar el ciclo.');
      }
    });
  }

  // ── Resto de métodos sin cambios ──────────────────────────────────────────
  private expulsarPorUrlInvalida(idSemilla: string | null): void {
    this.router.navigate(['/dashboard/semilla', idSemilla, 'ciclo-didactico', 'editor'], {
      queryParams: {}
    });
    this.pasoActual.set('seleccion');
  }

  private cargarRaps(id: string): void {
    this.semillasService.verificarEstadoRaps(id).subscribe(res => {
      if (res.tieneAsignacion) this.rapsList.set(res.raps);
    });
  }

  continuarAlEditor(): void {
    const rapSeleccionado = this.rapsList().find(r => r.rap_id === this.rapActual() || r.id === this.rapActual());

    if (rapSeleccionado?.ova_id) {
      this.ovaAsociado.set(rapSeleccionado.ova_id);

      this.cicloDidacticoService.verificarCiclo(rapSeleccionado.ova_id, this.faseActual()!).subscribe(res => {
        if (res.existe && typeof res.ciclo_id === 'number') {
          this.cicloData.setCicloId(res.ciclo_id);
          this.cicloIdVerificado.set(res.ciclo_id);
          this.pasoActual.set('existe');
        } else {
          this.mostrarModal.set(true);
        }
      });
    } else {
      alert('Por favor selecciona un RAP válido');
    }
  }

  accederAEtapasConParams(): void {
    const cicloId = this.cicloIdVerificado();
    if (!cicloId) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cicloId, step: 'etapas' },
      queryParamsHandling: 'merge'
    });
  }

  procesarCreacionCiclo(datos: any): void {
    const payload = {
      ova_id:              this.ovaAsociado()!,
      fase_proyecto_id:    this.faseActual()!,
      titulo:              datos.titulo,
      descripcion_general: datos.descripcion_general
    };

    this.cicloDidacticoService.crearCiclo(payload).subscribe({
      next: (res) => {
        this.cicloData.setCicloId(res.data.id);
        this.cicloIdVerificado.set(res.data.id);
        this.mostrarModal.set(false);
        this.pasoActual.set('etapas');
        // ── Validación del ciclo recién creado ───────────────────────────
        this.verificarEstadoCiclo(res.data.id);
      },
      error: (err) => console.error('❌ Error al crear ciclo:', err)
    });
  }

  manejarSeleccionFase = (id: number) => this.faseActual.set(id);
  manejarSeleccionRap  = (id: number) => this.rapActual.set(id);
  puedeContinuar       = computed(() => this.faseActual() !== null && this.rapActual() !== null);
  seleccionarEtapa     = (e: string)  => { this.etapaActiva.set(e); this.pasoActual.set('editor'); };

  volverASeleccion(): void {
    this.pasoActual.set('seleccion');
  }

  volverAEtapas(): void {
    this.pasoActual.set('etapas');
    // ── Re-validación al volver del editor ──────────────────────────────
    const cicloId = this.cicloIdVerificado();
    if (cicloId) this.verificarEstadoCiclo(cicloId);
  }

  etapaTieneContenido(nombreUI: string): boolean {
    const tipoBackend = this.mapearNombreEtapa(nombreUI);
    const seccion = this.estadoSecciones().find(s => s.tipo_seccion === tipoBackend);
    // Si la sección existe en BD, verificamos su flag. Si no existe, es false.
    return seccion ? seccion.tiene_contenido : false;
  }

  // Helper interno para mapear nombres del UI a la BD (sin tildes)
  private mapearNombreEtapa(nombreUI: string): string {
    const mapa: Record<string, string> = {
      'Reflexión': 'Reflexion',
      'Contextualización': 'Contextualizacion',
      'Apropiación': 'Apropiacion',
      'Transferencia': 'Transferencia'
    };
    return mapa[nombreUI] || nombreUI;
  }
}