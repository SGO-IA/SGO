import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AprendizGeneralService, EntornoData } from '../../../services/aprendiz/aprendiz-general';
import { NavigationService } from '../../../services/shared/navigation';
import { TestDiagnosticoModalComponent } from '../../../components/aprendiz/test-diagnostico/test-diagnostico';
import { DiagnosticoService, TestDiagnostico } from '../../../services/aprendiz/test-diagnostico';

@Component({
  selector: 'app-entorno-aprendiz',
  standalone: true,
  imports: [CommonModule, TestDiagnosticoModalComponent], // 🚀 agregado
  templateUrl: './entorno.html'
})
export class EntornoAprendiz implements OnInit {
  private route = inject(ActivatedRoute);
  private aprendizSvc = inject(AprendizGeneralService);
  private diagnosticoSvc = inject(DiagnosticoService); // 🚀 NUEVO
  public navService = inject(NavigationService);
  private router = inject(Router); 
  
  fichaId: string | null = null;
  
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  entorno = signal<EntornoData | null>(null);

  // 🚀 NUEVO: estado del flujo de validación diagnóstica
  verificandoAcceso = signal<number | null>(null); // guarda el id de la OVA que se está verificando (para el spinner puntual)
  testDiagnosticoActivo = signal<TestDiagnostico | null>(null);
  ovaBloqueada = signal<any>(null);

  ngOnInit() {
    this.fichaId = this.route.snapshot.paramMap.get('id');
    if (this.fichaId) {
      this.cargarEntorno(this.fichaId);
    }
  }

  cargarEntorno(id: string) {
    this.cargando.set(true);
    this.aprendizSvc.getEntornoFicha(id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.entorno.set(res.data);
          this.navService.setMenuEntornoAprendiz(res.data.ovas);
        } else {
          this.error.set(res.message);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando el entorno:', err);
        this.error.set(err.error?.message || 'Error de conexión al cargar el entorno.');
        this.cargando.set(false);
      }
    });
  }

  // 🚀 MODIFICADO: ahora valida el diagnóstico antes de navegar
  verOva(ova: any) {
    if (!this.fichaId || !ova.id) {
      console.warn('⚠️ No se puede redireccionar porque falta fichaId o ova.id:', {
        fichaId: this.fichaId,
        ovaId: ova?.id
      });
      return;
    }

    this.verificandoAcceso.set(ova.id);

    this.diagnosticoSvc.verificarAccesoOva(ova.id).subscribe({
      next: (res) => {
        this.verificandoAcceso.set(null);

        if (res.data.accesoPermitido) {
          this.router.navigate(['/dashboard/aprendiz/entorno', this.fichaId, 'ova', ova.id]);
        } else {
          this.testDiagnosticoActivo.set(res.data.testDiagnostico);
          this.ovaBloqueada.set(ova);
        }
      },
      error: (err) => {
        console.error('Error verificando acceso a la OVA:', err);
        this.verificandoAcceso.set(null);
        this.error.set('No se pudo verificar el acceso a esta lección. Intenta de nuevo.');
      }
    });
  }

  // 🚀 NUEVO
  cerrarModalDiagnostico() {
    this.testDiagnosticoActivo.set(null);
    this.ovaBloqueada.set(null);
  }

  // 🚀 NUEVO
  manejarAprobacionDiagnostico() {
    const ova = this.ovaBloqueada();
    this.testDiagnosticoActivo.set(null);
    this.ovaBloqueada.set(null);

    if (ova && this.fichaId) {
      this.router.navigate(['/dashboard/aprendiz/entorno', this.fichaId, 'ova', ova.id]);
    }
  }
}