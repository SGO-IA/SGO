import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-ia',
  imports: [FormsModule],
  templateUrl: './modal-ia.html',
  styleUrl: './modal-ia.css',
})
export class ModalIa {  
  customPrompt: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  get conteoPalabras(): number {
    if (!this.customPrompt || this.customPrompt.trim() === '') {
      return 0;
    }
    // Divide el texto por espacios, saltos de línea o tabulaciones y cuenta los elementos
    return this.customPrompt.trim().split(/\s+/).length;
  }
}
