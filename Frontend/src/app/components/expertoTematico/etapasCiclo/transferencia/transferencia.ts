import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
})
export class Transferencia {
  contenido: string = '';
  duracion: number = 60; // en minutos
  archivos: File[] = [];

  // Configuración de Test
  testConfigurado: boolean = false;

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.archivos.push(files[i]);
    }
  }

  configurarTest() {
    // Aquí abrirías un modal o navegarías a la config del test
    console.log('Abriendo configurador de test...');
    this.testConfigurado = true;
  }

  sugerirIA() { /* Lógica IA */ }
}
