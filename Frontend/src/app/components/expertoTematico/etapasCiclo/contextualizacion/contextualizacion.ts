import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contextualizacion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contextualizacion.html',
  styleUrl: './contextualizacion.css',
})
export class Contextualizacion {
  archivos: File[] = [];
  links: string[] = [];
  nuevoLink: string = '';
  contenido: string = '';

  sugerirIA() {
    console.log('Consultando IA para:', this.contenido);
    // Aquí irá la lógica de llamada a tu servicio de IA
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.archivos.push(files[i]);
    }
  }

  agregarLink(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.nuevoLink.trim() !== '') {
      this.links.push(this.nuevoLink.trim());
      this.nuevoLink = ''; // Limpiar campo
      event.preventDefault();
    }
  }

  removerLink(index: number) {
    this.links.splice(index, 1);
  }
}
