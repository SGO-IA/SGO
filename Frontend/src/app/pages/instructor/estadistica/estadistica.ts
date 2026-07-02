import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AprendizEstadistica, EstadisticasResponse, AnalisisGrupalIA, InstructorGeneralService } from '../../../services/instructor/general';

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

  // 🤖 Estado del análisis grupal con IA
  mostrarModalAnalisis = signal<boolean>(false);
  analisisCargando = signal<boolean>(false);
  analisisError = signal<string | null>(null);
  analisisIA = signal<AnalisisGrupalIA | null>(null);

  fichaId!: number;
  competenciaId!: number;
  ovaId!: number;

  aprendicesFiltrados = computed(() => {
    const d = this.data();
    if (!d) return [];
    if (this.filtroEstado() === 'todos') return d.aprendices;
    return d.aprendices.filter(a => a.estado === this.filtroEstado());
  });

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

  arcoDash(porcentaje: number): string {
    return `${porcentaje} ${100 - porcentaje}`;
  }

  arcoOffset(inicio: number): number {
    return 100 - inicio + 25;
  }

  verDetalleAprendiz(aprendiz: AprendizEstadistica) {
    this.aprendizSeleccionado.set(aprendiz);
  }

  cerrarDetalle() {
    this.aprendizSeleccionado.set(null);
  }

  // 🤖 Análisis grupal con IA
  abrirAnalisisIA() {
    this.mostrarModalAnalisis.set(true);
    // Si ya lo generamos antes en esta sesión, no volvemos a llamar a la IA
    if (this.analisisIA()) return;
    this.generarAnalisisIA();
  }

  generarAnalisisIA() {
    this.analisisCargando.set(true);
    this.analisisError.set(null);

    this.instructorSvc.getAnalisisGrupalIA(this.fichaId, this.competenciaId, this.ovaId).subscribe({
      next: (res) => {
        if (res.ok) {
          this.analisisIA.set(res.data);
        } else {
          this.analisisError.set(res.message || 'No se pudo generar el análisis.');
        }
        this.analisisCargando.set(false);
      },
      error: (err) => {
        console.error('Error generando análisis con IA:', err);
        this.analisisError.set(err.error?.message || 'Error al conectar con el servicio de IA.');
        this.analisisCargando.set(false);
      }
    });
  }

  reintentarAnalisis() {
    this.generarAnalisisIA();
  }

  cerrarModalAnalisis() {
    this.mostrarModalAnalisis.set(false);
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