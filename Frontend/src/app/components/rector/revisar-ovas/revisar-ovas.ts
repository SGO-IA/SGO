import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CicloDrillDown, OvaDrillDown, Semillasrector } from '../../../services/rector/semillas';

@Component({
  selector: 'app-revision-ovas',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './revisar-ovas.html'
})
export class RevisionOvas implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rectorService = inject(Semillasrector);

  semillaId = signal<number | null>(null);
  ovasList = signal<OvaDrillDown[]>([]);
  cargando = signal<boolean>(true);
  mensajeError = signal<string | null>(null);

  // ✅ NUEVOS ESTADOS PARA EL ACORDEÓN DE CICLOS
  ovaExpandidoId = signal<number | null>(null);
  ciclosList = signal<CicloDrillDown[]>([]);
  cargandoCiclos = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.semillaId.set(Number(id));
      this.cargarOvas(Number(id));
    } else {
      this.volverASemillas();
    }
  }

  cargarOvas(id: number): void {
    this.cargando.set(true);
    this.rectorService.getOvasPorSemilla(id).subscribe({
      next: (res) => {
        if (res.ok) this.ovasList.set(res.data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("Error al cargar OVAs:", err);
        this.mensajeError.set("No se pudieron cargar los OVAs de esta semilla.");
        this.cargando.set(false);
      }
    });
  }

  // ✅ NUEVA LÓGICA: Alternar el acordeón y cargar ciclos
  toggleCiclosDeOva(ovaId: number): void {
    // Si ya está expandido el mismo OVA, lo cerramos
    if (this.ovaExpandidoId() === ovaId) {
      this.ovaExpandidoId.set(null);
      this.ciclosList.set([]);
      return;
    }

    // Si es un OVA diferente, lo abrimos y cargamos sus ciclos
    this.ovaExpandidoId.set(ovaId);
    this.cargandoCiclos.set(true);
    this.ciclosList.set([]); // Limpiamos ciclos anteriores

    this.rectorService.getCiclosPorOva(ovaId).subscribe({
      next: (res) => {
        if (res.ok) this.ciclosList.set(res.data);
        this.cargandoCiclos.set(false);
      },
      error: (err) => {
        console.error("Error al cargar ciclos:", err);
        this.cargandoCiclos.set(false);
      }
    });
  }

  verModoLectura(cicloId: number): void {
    this.router.navigate(['/dashboard/rector/ciclo', cicloId, 'lectura']);
  }

  volverASemillas(): void {
    this.router.navigate(['/dashboard/rector']);
  }
}