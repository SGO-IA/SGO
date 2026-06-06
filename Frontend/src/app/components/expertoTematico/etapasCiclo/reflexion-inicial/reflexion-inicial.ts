import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CicloDataService } from '../../../../services/expertoTematico/ciclo-data-service';
import { IAService } from '../../../../services/expertoTematico/ia';
import { ModalIa } from '../modal-ia/modal-ia';
import { marked } from 'marked';
import { R2Cloudflare } from '../../../../services/expertoTematico/r2-cloudflare';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-reflexion-inicial',
  standalone: true,
  imports: [FormsModule, ModalIa],
  templateUrl: './reflexion-inicial.html',
})
export class ReflexionInicial {
archivos: File[] = [];
  links: string[] = [];
  nuevoLink: string = '';
  contenido: string = '';
  showModal = false;
  contenidoRenderizado: string = '';
  modoEdicion = false;
  
  private cicloData = inject(CicloDataService);
  private iaService = inject(IAService);
  private cdr = inject(ChangeDetectorRef);
  private r2Cloudflare = inject(R2Cloudflare);
  
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

  guardarReflexion() {
    // Simulamos u obtenemos el ID de sección correspondiente (este ID debería venir del ciclo actual o backend)
    const seccionIdActual = 1; 

    if (this.archivos.length > 0) {
      console.log(`Iniciando carga masiva de ${this.archivos.length} archivos a Cloudflare R2...`);
      
      // Mapeamos cada archivo del array a una petición observable de subida
      const peticionesSubida = this.archivos.map(archivo => 
        this.r2Cloudflare.subirArchivoASeccion(seccionIdActual, archivo)
      );

      // forkJoin ejecuta todas las subidas en paralelo (equivalente a Promise.all)
      forkJoin(peticionesSubida).subscribe({
        next: (respuestas) => {
          console.log('Todos los archivos se subieron e indexaron con éxito en R2:', respuestas);
          
          // Limpiamos la zona de archivos cargados tras el éxito
          this.archivos = [];
          
          // TODO: Aquí disparas el guardado del texto de la reflexión (this.contenido) y tus links
          this.ejecutarPersistenciaTexto();
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error crítico durante la subida masiva a Cloudflare R2:', err);
          // Aquí puedes mapear una alerta visual para informar al usuario de la falla
        }
      });
    } else {
      // Si no hay archivos, guardamos el texto y los links directamente
      this.ejecutarPersistenciaTexto();
    }
  }

  private ejecutarPersistenciaTexto() {
    console.log('Persitiendo contenido HTML de la reflexión:', this.contenido);
    console.log('Persistiendo enlaces externos adicionales:', this.links);
    // Aquí invocarías al servicio correspondiente que guarde la sección en BD
  }

async sugerirIA(customPrompt?: string) {
  const rapId = this.cicloData.rapId();
  if (!rapId) return;

  this.loadingIA.set(true);
  const promptToUse = customPrompt || this.contenido;
  this.contenido = "";
  
  let i = 0;
  this.intervalId = setInterval(() => {
    this.mensajeActual.set(this.mensajesCarga[i % this.mensajesCarga.length]);
    i++;
  }, 2500); 

  this.iaService.sugerir(promptToUse, 'Reflexión Inicial', rapId).subscribe({
    next: async (res) => {
      // 1. Limpieza total de basura de IA
      let texto = res.sugerencia || "";
      texto = texto.replace(/undefined/g, ""); 
      texto = texto.replace(/\[\]\((undefined|null)\)/g, "");
      // Limpiamos espacios en los links: [texto]( url ) -> [texto](url)
      texto = texto.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
      
      this.contenido = texto;
      this.modoEdicion = false;
      
      // 2. Renderer configurado
      const renderer = {
        link(href: string, title: string | null, text: string) {
          let linkText = (!text || text === 'undefined') ? 'Ver recurso externo' : text;

          // Corrección: Solo anteponer https si no tiene ni http ni https
          let finalHref = href;
          if (!href.startsWith('http')) {
            finalHref = 'https://' + href.replace(/^\/+/, ''); // elimina slashes iniciales si los hay
          }

          return `<a href="${finalHref}" target="_blank" rel="noopener noreferrer" class="text-sena font-bold hover:underline">${linkText}</a>`;
        }
      };

      marked.use({ renderer: renderer as any });
      
      // 3. IMPORTANTE: Parseamos 'texto' (que ya está limpio), no 'res.sugerencia'
      this.contenidoRenderizado = await marked.parse(texto);
      
      this.finalizarCarga();
      this.cdr.detectChanges();
    },
    error: () => {
      this.contenido = "Error de conexión. Intenta nuevamente.";
      this.finalizarCarga();
      this.cdr.detectChanges();
    }
  });
}

finalizarEdicion() {
  this.contenidoRenderizado = marked.parse(this.contenido) as string;
  this.modoEdicion = false;
  this.cdr.detectChanges();
}

openIA(customPrompt?: string) {
  if (customPrompt) {
    this.showModal = false;
    this.sugerirIA(customPrompt);
  }
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