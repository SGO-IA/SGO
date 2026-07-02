import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompetenciaInstructor, FichaInstructor, InstructorGeneralService } from '../../../services/instructor/general';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private instructorSvc = inject(InstructorGeneralService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  fichas = signal<FichaInstructor[]>([]);

  // Métricas rápidas derivadas para el header del dashboard
  totalFichas = computed(() => this.fichas().length);

  totalCompetencias = computed(() => 
    this.fichas().reduce((acc, f) => acc + f.competencias.length, 0)
  );

  ovasSinConfigurar = computed(() =>
    this.fichas().reduce((acc, f) => 
      acc + f.competencias.filter(c => !c.ova).length, 0
    )
  );

  ngOnInit() {
    this.cargarPanel();
  }

  cargarPanel() {
    this.cargando.set(true);
    this.error.set(null);

    this.instructorSvc.getMisFichas().subscribe({
      next: (res) => {
        if (res.ok) {
          this.fichas.set(res.data);
        } else {
          this.error.set(res.message);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando panel del instructor:', err);
        this.error.set(err.error?.message || 'Error de conexión al cargar tu panel.');
        this.cargando.set(false);
      }
    });
  }

  // Colores/etiquetas según el estado de la ficha
  claseEstadoFicha(estado: string): string {
    switch (estado) {
      case 'lectiva': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'productiva': return 'bg-sena-alpha text-sena border-sena/20';
      case 'finalizada': return 'bg-gray-50 text-gray-400 border-gray-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  }

  claseEstadoSemilla(estado: string | undefined): string {
    switch (estado) {
      case 'aprobada': return 'bg-green-50 text-green-600 border-green-100';
      case 'pendiente_rector': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rechazada': return 'bg-red-50 text-red-600 border-red-100';
      case 'en_construccion': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  }

  irAConfigurarOva(ficha: FichaInstructor, competenciaId: number) {
    // 🔧 Ajusta la ruta real de tu editor de OVA/ciclo didáctico para instructor
    if (ficha.semilla) {
      this.router.navigate(['/dashboard/instructor/semilla', ficha.semilla.id, 'competencia', competenciaId]);
    }
  }

  irAEstadisticas(ficha: FichaInstructor, competencia: CompetenciaInstructor) {
    if (competencia.ova) {
      this.router.navigate(['/dashboard/instructor/estadistica', ficha.ficha_id, competencia.id, competencia.ova.id]);
    }
  }
}