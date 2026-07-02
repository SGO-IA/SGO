import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AprendizGeneralService, Ova, TestPendiente } from '../../../services/aprendiz/aprendiz-general';
import { NavigationService } from '../../../services/shared/navigation';
import { FaseContenidoComponent } from '../../../components/aprendiz/fase-contenido/fase-contenido';
import { TestModalComponent } from '../../../components/aprendiz/testmodal/testmodal';

const ORDEN_FASES = ['Reflexion', 'Contextualizacion', 'Apropiacion', 'Transferencia'];

@Component({
  selector: 'app-entorno-ova',
  standalone: true,
  imports: [CommonModule, RouterModule, FaseContenidoComponent, TestModalComponent], // Añadido RouterModule para el routerLink
  templateUrl: './entorno-ova.html'
})
export class EntornoOvaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private aprendizSvc = inject(AprendizGeneralService);
  public navService = inject(NavigationService); // Público para el HTML

  fichaId: string | null = null;
  ovaId: string | null = null;
  
  ovaData = signal<Ova | null>(null);
  cargando = signal<boolean>(true);
    testActivo = signal<any>(null);

  ngOnInit() {
    this.fichaId = this.route.snapshot.paramMap.get('fichaId');
    this.ovaId = this.route.snapshot.paramMap.get('ovaId');

    if (this.fichaId && this.ovaId) {
      this.verificarYRecuperarEntorno();
    }
  }

  verificarYRecuperarEntorno() {
    this.cargando.set(true);
    const ovasEnMemoria = this.aprendizSvc.entornoActualOvas();

    if (ovasEnMemoria.length === 0) {
      this.aprendizSvc.getEntornoFicha(this.fichaId!).subscribe({
        next: (res) => {
          if (res.ok) {
            this.aprendizSvc.entornoActualOvas.set(res.data.ovas);
            this.navService.setMenuEntornoAprendiz(res.data.ovas);
            this.extraerDatosOvaEspecifica(res.data.ovas);
          }
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false)
      });
    } else {
      this.navService.setMenuEntornoAprendiz(ovasEnMemoria);
      this.extraerDatosOvaEspecifica(ovasEnMemoria);
      this.cargando.set(false);
    }
  }

  extraerDatosOvaEspecifica(ovas: Ova[]) {
    const ovaActual = ovas.find(o => o.id === Number(this.ovaId));
    if (ovaActual) {
      this.ovaData.set(ovaActual);
    } else {
      this.router.navigate(['/dashboard/aprendiz/entorno', this.fichaId]);
    }
  }

  abrirFase(ciclo: any, fase: string) {
    const dataFase = ciclo.secciones[fase];
    console.log('Objeto completo de la fase:', dataFase);
    console.log('¿Tiene contenido_html?', dataFase?.contenido_html);
    
    this.navService.cicloSeleccionado.set({ ...ciclo, seccionActiva: fase });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 🚀 MÉTODO PARA CERRAR LA PIZARRA Y VOLVER A LOS CICLOS
  cerrarFase() {
    this.navService.cicloSeleccionado.set(null);
  }

irASiguienteFase() {
    const cicloActual = this.navService.cicloSeleccionado();
    if (!cicloActual) return;

    const indiceActual = ORDEN_FASES.indexOf(cicloActual.seccionActiva);
    const esUltima = indiceActual === ORDEN_FASES.length - 1;

    if (esUltima) {
      this.validarYFinalizarCiclo(cicloActual);
      return;
    }

    const siguienteFase = ORDEN_FASES[indiceActual + 1];
    this.navService.cicloSeleccionado.set({ ...cicloActual, seccionActiva: siguienteFase });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 🚀 NUEVO
finalizandoCiclo = signal<boolean>(false);
erroresFinalizacion = signal<TestPendiente[] | null>(null);

validarYFinalizarCiclo(cicloActual: any) {
    this.finalizandoCiclo.set(true);
    this.erroresFinalizacion.set(null);

    this.aprendizSvc.finalizarCiclo(cicloActual.id).subscribe({
      next: () => {
        this.finalizandoCiclo.set(false);

        // 🚀 NUEVO: refleja el cambio localmente sin esperar un refetch completo
        const ova = this.ovaData();
        if (ova) {
          const ciclo = ova.ciclos.find(c => c.id === cicloActual.id);
          if (ciclo) ciclo.completado = true;
          ova.completado = ova.ciclos.every(c => c.completado);
          this.ovaData.set({ ...ova });
        }

        this.cerrarFase();
      },
      error: (err) => {
        this.finalizandoCiclo.set(false);
        if (err.error?.error === 'CICLO_INCOMPLETO') {
          this.erroresFinalizacion.set(err.error.pendientes);
        } else {
          console.error('Error inesperado al finalizar ciclo:', err);
        }
      }
    });
}

cerrarAlertaFinalizacion() {
    this.erroresFinalizacion.set(null);
}

  // 🚀 NUEVO: determina si la fase actual es la última del recorrido
  esUltimaFase(): boolean {
    const cicloActual = this.navService.cicloSeleccionado();
    if (!cicloActual) return false;
    return ORDEN_FASES.indexOf(cicloActual.seccionActiva) === ORDEN_FASES.length - 1;
  }

  abrirTest(test: any) {
    this.testActivo.set(test);
  }

  cerrarTest() {
    this.testActivo.set(null);
  }

  manejarFinalizacionTest(resultado: { aprobado: boolean; puntaje: number }) {
    console.log('Resultado del test (sin guardar todavía):', resultado);
  }
}