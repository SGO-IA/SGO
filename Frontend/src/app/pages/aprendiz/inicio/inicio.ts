import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AprendizGeneralService, FichaAprendiz } from '../../../services/aprendiz/aprendiz-general';
import { LoginService } from '../../../services/public/login-service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.html'
})
export class Inicio implements OnInit {
  private aprendizSvc = inject(AprendizGeneralService);
  private loginSvc = inject(LoginService);
  private router = inject(Router);

  // ─── ESTADO ────────────────────────────────────────────────────────────────
  fichas = signal<FichaAprendiz[]>([]);
  busqueda = signal<string>('');
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  // ─── DATOS COMPUTADOS ──────────────────────────────────────────────────────
  nombreUsuario = computed(() => {
    const user = this.loginSvc.currentUser();
    // Extrae solo el primer nombre para un saludo más cercano
    return user ? user.nombre.split(' ')[0] : 'Aprendiz';
  });

  fichasFiltradas = computed(() => {
    const termino = this.busqueda().toLowerCase().trim();
    if (!termino) return this.fichas();
    
    return this.fichas().filter(f => 
      f.nombre_programa.toLowerCase().includes(termino) ||
      f.codigo_ficha.toLowerCase().includes(termino)
    );
  });

  // ─── CICLO DE VIDA ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarFichas();
  }

  // ─── MÉTODOS ───────────────────────────────────────────────────────────────
  cargarFichas() {
    this.cargando.set(true);
    this.error.set(null);

    this.aprendizSvc.getMisFichas().subscribe({
      next: (res) => {
        if (res.ok) {
          this.fichas.set(res.data);
        } else {
          this.error.set(res.message);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar fichas del aprendiz:', err);
        this.error.set('No pudimos cargar tus espacios de formación. Verifica tu conexión.');
        this.cargando.set(false);
      }
    });
  }

  limpiarBusqueda() {
    this.busqueda.set('');
  }

  entrarEntorno(ficha: FichaAprendiz) {
    this.router.navigate(['/dashboard/aprendiz/entorno', ficha.ficha_id]);
    console.log('Ingresando al entorno de la ficha:', ficha.codigo_ficha);
  }
}