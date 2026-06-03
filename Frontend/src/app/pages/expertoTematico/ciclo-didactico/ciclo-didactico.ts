import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Importa esto
import { CicloDidacticoPresentacion } from '../../../components/expertoTematico/ciclo-didactico-presentacion/ciclo-didactico-presentacion';

@Component({
  selector: 'app-ciclo-didactico',
  standalone: true,
  imports: [CicloDidacticoPresentacion], 
  templateUrl: './ciclo-didactico.html'
})
export class CicloDidactico implements OnInit {
  private route = inject(ActivatedRoute); // Inyecta el servicio
  
  mostrarAyuda = signal<boolean>(false);
  idSemilla = signal<string | null>(null);
  tieneCicloDidactico = signal<boolean>(false); // Cambia esto según tu lógica de datos real

  ngOnInit(): void {
    // Obtenemos el ID de la ruta
    this.idSemilla.set(this.route.snapshot.paramMap.get('id'));
    // Aquí deberías hacer tu llamada al servicio para verificar si existen ciclos
  }

  toggleAyuda(): void { this.mostrarAyuda.update(estado => !estado); }
  cerrarAyuda(): void { this.mostrarAyuda.set(false); }
}