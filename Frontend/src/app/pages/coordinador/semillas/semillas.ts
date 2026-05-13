import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CrearSemillaComponent } from '../../../components/coordinador/crear-semilla-components/crear-semilla-components';

@Component({
  selector: 'app-semillas',
  standalone: true,
  imports: [CommonModule, CrearSemillaComponent],
  templateUrl: './semillas.html',
  styleUrl: './semillas.css',
})
export class Semillas {
  public showModal = signal<boolean>(false);
}
