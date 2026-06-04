import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CicloDataService } from '../../../../services/expertoTematico/ciclo-data-service';
import { IAService } from '../../../../services/expertoTematico/ia';

@Component({
  selector: 'app-reflexion-inicial',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reflexion-inicial.html',
})
export class ReflexionInicial {
archivos: File[] = [];
  links: string[] = [];
  nuevoLink: string = '';
  contenido: string = '';
  
  private cicloData = inject(CicloDataService);
  private iaService = inject(IAService);
  
  loadingIA = signal(false);
  mensajeActual = signal("");
  private intervalId: any;
  mensajesCarga: string[] = [
    "Consultando base de datos...", 
    "Extrayendo competencias del programa...",
    "Analizando diseño curricular...",
    "Conectando con inteligencia artificial...",
    "Evaluando conocimientos previos...",
    "Diseñando la propuesta pedagógica...",
    "Estructurando la actividad de aprendizaje...",
    "Alineando criterios de evaluación...",
    "Refinando el lenguaje técnico...",
    "Ya casi terminamos, dando los últimos toques..."
  ];

async sugerirIA() {
  const rapId = this.cicloData.rapId();
  if (!rapId) return;

  this.loadingIA.set(true);
  this.contenido = "";
  
  let i = 0;
  // Aumentamos a 2500ms para un ritmo más pausado y profesional
  this.intervalId = setInterval(() => {
    this.mensajeActual.set(this.mensajesCarga[i % this.mensajesCarga.length]);
    i++;
  }, 2500); 

  this.iaService.sugerir(this.contenido, 'Reflexión Inicial', rapId).subscribe({
    next: (res) => {
      this.contenido = res.sugerencia;
      this.finalizarCarga();
    },
    error: () => {
      this.contenido = "Error al conectar con la IA. Inténtalo de nuevo.";
      this.finalizarCarga();
    }
  });
}

  private finalizarCarga() {
    this.loadingIA.set(false);
    clearInterval(this.intervalId);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
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