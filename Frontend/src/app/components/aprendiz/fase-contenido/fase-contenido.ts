import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeccionDidactica } from '../../../services/aprendiz/aprendiz-general';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-fase-contenido',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './fase-contenido.html'
})
export class FaseContenidoComponent {
  // Recibimos los datos desde el componente padre
  @Input({ required: true }) cicloTitulo!: string;
  @Input({ required: true }) faseNombre!: string;
  @Input() faseData?: SeccionDidactica;
  @Input() esUltimaFase: boolean = false;


  @Output() volver = new EventEmitter<void>();
  @Output() siguiente = new EventEmitter<void>();
    @Output() iniciarTest = new EventEmitter<any>();

  ngOnChanges() {
    console.log('faseData recibido en el hijo:', this.faseData);
  }

    getIconoArchivo(tipoArchivo: string | undefined): string {
    if (!tipoArchivo) return 'pi-file';
    
    if (tipoArchivo.includes('pdf')) return 'pi-file-pdf';
    if (tipoArchivo.includes('excel') || tipoArchivo.includes('spreadsheet')) return 'pi-file-excel';
    if (tipoArchivo.includes('word') || tipoArchivo.includes('document')) return 'pi-file-word';
    if (tipoArchivo.includes('image')) return 'pi-image';
    if (tipoArchivo.includes('video')) return 'pi-video';
    
    return 'pi-file';
  }
}