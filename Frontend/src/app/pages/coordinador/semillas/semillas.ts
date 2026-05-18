import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
import { CrearSemillaComponent } from '../../../components/coordinador/crear-semilla-components/crear-semilla-components';
import { ListarSemillasComponent } from '../../../components/coordinador/listar-semillas/listar-semillas';

@Component({
  selector: 'app-semillas',
  standalone: true,
  imports: [CommonModule, CrearSemillaComponent, ListarSemillasComponent],
  templateUrl: './semillas.html',
  styleUrl: './semillas.css',
})
export class Semillas {
  // Capturamos el componente hijo para gatillar recargas en caliente
  @ViewChild(ListarSemillasComponent) listarSemillasComp!: ListarSemillasComponent;

  public showModal = signal<boolean>(false);

  // Cuando el modal de creación se cierra con éxito, se refresca el hijo
  onModalClosed(): void {
    this.showModal.set(false);
    if (this.listarSemillasComp) {
      this.listarSemillasComp.cargarSemillas();
    }
  }
}