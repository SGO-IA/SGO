import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CicloLectura, SeccionLectura, Semillasrector } from '../../../services/rector/semillas';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { RecursoService } from '../../../services/recursos/recursos';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ciclo-lectura',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownComponent],
  providers: [provideMarkdown()],
  templateUrl: './ciclo-lectura.html'
})
export class CicloLecturaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rectorService = inject(Semillasrector);
  private recursoService = inject(RecursoService);

  cicloId = signal<number | null>(null);
  cicloData = signal<CicloLectura | null>(null);
  cargando = signal<boolean>(true);
  mensajeError = signal<string | null>(null);

  etapaActiva = signal<'Reflexion' | 'Contextualizacion' | 'Apropiacion' | 'Transferencia'>('Reflexion');

  etapasSena = [
    { key: 'Reflexion', label: 'Reflexión Inicial', icon: 'pi-comment', color: 'border-amber-500 text-amber-600 bg-amber-50' },
    { key: 'Contextualizacion', label: 'Contextualización', icon: 'pi-compass', color: 'border-blue-500 text-blue-600 bg-blue-50' },
    { key: 'Apropiacion', label: 'Apropiación', icon: 'pi-book', color: 'border-green-500 text-green-600 bg-green-50' },
    { key: 'Transferencia', label: 'Transferencia', icon: 'pi-send', color: 'border-purple-500 text-purple-600 bg-purple-50' }
  ];

  seccionActual = computed<SeccionLectura | undefined>(() => {
    const data = this.cicloData();
    if (!data) return undefined;
    return data.secciones.find(s => s.tipo_seccion === this.etapaActiva());
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cicloId.set(Number(id));
      this.cargarContenidoLectura(Number(id));
    } else {
      this.regresar();
    }
  }

  cargarContenidoLectura(id: number): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.rectorService.getModoLecturaCiclo(id).subscribe({
      next: (res) => {
        if (res.ok) {
          this.cicloData.set(res.data);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("❌ Error cargando modo lectura:", err);
        this.mensajeError.set("No se pudo extraer el contenido de este ciclo didáctico.");
        this.cargando.set(false);
      }
    });
  }

  cambiarEtapa(key: any): void {
    this.etapaActiva.set(key);
  }

  regresar(): void {
    // Regresa al listado general del rector (puedes ajustar el historial si prefieres)
    this.router.navigate(['/dashboard/rector']);
  }

  formatearMarkdown(texto: string | undefined): string {
    if (!texto) return '';

    return texto
      // 1. Añade un doble salto de línea antes de cualquier bloque en negrita (ej: **Objetivo:**)
      // Esto separa cada sección en su propio párrafo.
      .replace(/(\*\*[^*]+\*\*)/g, '\n\n$1')
      
      // 2. Añade un salto de línea antes de los guiones de lista ( - Elemento)
      // Para que Markdown lo reconozca como una lista real.
      .replace(/ - /g, '\n- ')
      
      // 3. Limpia espacios en blanco innecesarios al inicio y al final
      .trim();
  }

  // En ciclo-lectura.ts
  ejecutarDescarga(id: number): void {
  // 1. Primero verificamos que el recurso esté disponible
  this.recursoService.verificarRecurso(id).subscribe({
    next: () => {
      // 2. Si todo está OK, procedemos a abrir la descarga
      const urlDescarga = this.recursoService.obtenerUrlDescargaDirecta(id);
      window.open(urlDescarga, '_blank');
    },
    error: () => {
      // 3. Si hay error (404 o 500), mostramos la alerta
      Swal.fire({
        icon: 'error',
        title: 'Error de descarga',
        text: 'El archivo no está disponible o ha ocurrido un error en el servidor.',
        confirmButtonColor: '#3b82f6' // Ajusta al color de tu preferencia (ej. SENA blue)
      });
    }
  });
}
}