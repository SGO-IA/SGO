import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CicloDidacticoService } from '../../../services/expertoTematico/ciclo-didactico';

@Component({
  selector: 'app-fases-tabs',
  standalone: true,
  imports: [],
  templateUrl: './fases-tabs.html',
  styleUrl: './fases-tabs.css',
})
export class FasesTabs implements OnInit {
  private service = inject(CicloDidacticoService);
  fases = signal<any[]>([]);
  
  // Output para avisar al padre
  faseSeleccionada = output<number>(); 
  faseActiva = signal<number | null>(null);

ngOnInit() {
  console.log('🚀 Solicitando fases al backend...');
  this.service.getFasesProyecto().subscribe({
    next: (data) => {
      console.log('📦 Fases recibidas:', data);
      this.fases.set(data);
    },
    error: (err) => console.error('❌ Error cargando las fases:', err)
  });
}

  seleccionarFase(id: number) {
    this.faseActiva.set(id);
    this.faseSeleccionada.emit(id); // Emitimos al padre
  }
}