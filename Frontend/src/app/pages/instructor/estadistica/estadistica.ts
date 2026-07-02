import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AprendizEstadistica, EstadisticasResponse, InstructorGeneralService } from '../../../services/instructor/general';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadistica.html'
})
export class Estadisticas implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private instructorSvc = inject(InstructorGeneralService);

  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  data = signal<EstadisticasResponse['data'] | null>(null);
  aprendizSeleccionado = signal<AprendizEstadistica | null>(null);
  filtroEstado = signal<'todos' | 'completado' | 'en_progreso' | 'sin_iniciar'>('todos');

  fichaId!: number;
  competenciaId!: number;
  ovaId!: number;

  aprendicesFiltrados = computed(() => {
    const d = this.data();
    if (!d) return [];
    if (this.filtroEstado() === 'todos') return d.aprendices;
    return d.aprendices.filter(a => a.estado === this.filtroEstado());
  });

  // Para el donut chart: ángulos acumulados
  segmentosDonut = computed(() => {
    const r = this.data()?.resumen;
    if (!r || r.totalAprendices === 0) return [];

    const total = r.totalAprendices;
    const datos = [
      { valor: r.completados, color: '#22c55e', label: 'Completado' },
      { valor: r.enProgreso, color: '#f59e0b', label: 'En progreso' },
      { valor: r.sinIniciar, color: '#e5e7eb', label: 'Sin iniciar' }
    ];

    let acumulado = 0;
    return datos.map(d => {
      const porcentaje = (d.valor / total) * 100;
      const inicio = acumulado;
      acumulado += porcentaje;
      return { ...d, inicio, fin: acumulado, porcentaje: Math.round(porcentaje) };
    });
  });

ngOnInit() {
  console.log('Params recibidos:', this.route.snapshot.paramMap.keys, {
    fichaId: this.route.snapshot.paramMap.get('fichaId'),
    competenciaId: this.route.snapshot.paramMap.get('competenciaId'),
    ovaId: this.route.snapshot.paramMap.get('ovaId')
  });

  this.fichaId = Number(this.route.snapshot.paramMap.get('fichaId'));
  this.competenciaId = Number(this.route.snapshot.paramMap.get('competenciaId'));
  this.ovaId = Number(this.route.snapshot.paramMap.get('ovaId'));

  if (this.fichaId && this.competenciaId && this.ovaId) {
    this.cargarEstadisticas();
  } else {
    console.warn('⚠️ Faltan parámetros de ruta, no se puede cargar estadísticas');
  }
}

  cargarEstadisticas() {
    this.cargando.set(true);
    this.instructorSvc.getEstadisticas(this.fichaId, this.competenciaId, this.ovaId).subscribe({
      next: (res) => {
        if (res.ok) this.data.set(res.data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error.set('No se pudieron cargar las estadísticas.');
        this.cargando.set(false);
      }
    });
  }

  // Coordenadas SVG para un arco de donut (círculo r=15.9, técnica de stroke-dasharray)
  arcoDash(porcentaje: number): string {
    return `${porcentaje} ${100 - porcentaje}`;
  }

  arcoOffset(inicio: number): number {
    return 100 - inicio + 25; // +25 para empezar arriba (12 en punto)
  }

  verDetalleAprendiz(aprendiz: AprendizEstadistica) {
    this.aprendizSeleccionado.set(aprendiz);
  }

  cerrarDetalle() {
    this.aprendizSeleccionado.set(null);
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'completado': return 'bg-green-50 text-green-600 border-green-200';
      case 'en_progreso': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  }

  claseNivel(nivel: string | undefined): string {
    switch (nivel) {
      case 'alto': return 'text-green-600';
      case 'medio': return 'text-amber-600';
      default: return 'text-red-500';
    }
  }
}