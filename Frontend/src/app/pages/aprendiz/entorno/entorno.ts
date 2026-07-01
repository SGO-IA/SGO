import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AprendizGeneralService, EntornoData } from '../../../services/aprendiz/aprendiz-general';
import { NavigationService } from '../../../services/shared/navigation';

@Component({
  selector: 'app-entorno-aprendiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entorno.html'
})
export class EntornoAprendiz implements OnInit {
  private route = inject(ActivatedRoute);
  private aprendizSvc = inject(AprendizGeneralService);
  public navService = inject(NavigationService);
  private router = inject(Router); 
  
  fichaId: string | null = null;
  
  // Estados de la petición
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Data del backend
  entorno = signal<EntornoData | null>(null);

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
          // Le pasamos las OVAS al Sidebar para que construya el menú
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

  verOva(ova: any) {
    console.log('🎯 [Click] Botón Realizar OVA presionado. Datos del OVA:', ova);
    
    if (this.fichaId && ova.id) {
      const urlDestino = `/dashboard/aprendiz/entorno/${this.fichaId}/ova/${ova.id}`;
      console.log(`🚀 Intentando navegar de forma absoluta a: ${urlDestino}`);
      
      this.router.navigate(['/dashboard/aprendiz/entorno', this.fichaId, 'ova', ova.id]);
    } else {
      console.warn('⚠️ No se puede redireccionar porque falta fichaId o ova.id:', {
        fichaId: this.fichaId,
        ovaId: ova?.id
      });
    }
  }
}