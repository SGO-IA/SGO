import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CicloDataService } from '../../../../services/expertoTematico/ciclo-data-service';
import { IAService } from '../../../../services/expertoTematico/ia';
import { ModalIa } from '../modal-ia/modal-ia';
import { marked } from 'marked';
import { forkJoin } from 'rxjs';
import { CicloDidacticoService } from '../../../../services/expertoTematico/ciclo-didactico'; // ✅ Inyección actualizada

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
  private cicloService = inject(CicloDidacticoService); // ✅ Usamos el servicio centralizado
  
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
    // Obtenemos el ID desde la señal reactiva
    const cicloId = this.cicloData.cicloId(); 

    if (!cicloId) {
      console.error('🚩 [ReflexionInicial] No hay un cicloId definido.');
      return;
    }

    if (this.archivos.length > 0) {
      // 1. Subida a R2 pasando el cicloId usando el servicio unificado
      const peticiones = this.archivos.map(archivo => 
        this.cicloService.subirRecurso(cicloId, archivo)
      );

      forkJoin(peticiones).subscribe({
        next: (respuestas) => {
          // Obtenemos los metadatos de los archivos para guardar en BD
          const archivosInfo = respuestas.map(r => ({
            url: r.data.urlR2,
            nombre: r.data.nombreArchivo,
            tipoArchivo: r.data.tipoArchivo, // Aseguramos el tipo MIME
            key: r.data.keyR2
          }));
          
          // 2. Persistir con los metadatos de R2
          this.ejecutarPersistenciaTexto(archivosInfo);
        },
        error: (err) => console.error('🚩 [ReflexionInicial] Error en carga R2:', err)
      });
    } else {
      this.ejecutarPersistenciaTexto([]);
    }
  }

  private ejecutarPersistenciaTexto(archivosInfo: any[]) {
    // 1. Extraemos SOLO la llave maestra necesaria
    const cicloId = this.cicloData.cicloId();

    // Validación de seguridad SGO
    if (!cicloId) {
      console.error('🚩 [ReflexionInicial] Error: No se encontró el cicloId. No se puede guardar.');
      return;
    }

    // 2. Armamos el DTO exacto que espera tu Backend
    const payloadBD = {
      tipo_etapa: 'Reflexión Inicial', // Enum match in backend
      contenido_html: this.contenidoRenderizado || this.contenido, // Aseguramos enviar el HTML
      enlaces_externos: this.links,
      recursos_adjuntos: archivosInfo // Array con URLs generadas por Cloudflare
    };

    console.log('📦 [ReflexionInicial] Payload listo para enviar al backend:', payloadBD);

    // 3. Consumo del servicio HTTP
    this.cicloService.guardarEtapa(cicloId, payloadBD).subscribe({
      next: (res) => {
        console.log('✅ [ReflexionInicial] Guardado exitoso en BD:', res);
        
        // Limpiamos los arrays después de un guardado exitoso
        this.archivos = [];
        // this.links = []; // Comenta esto si prefieres que los links sigan visibles tras guardar
        this.cdr.detectChanges();
        
        alert('Etapa guardada correctamente con sus recursos adjuntos.');
      },
      error: (err) => {
        console.error('❌ [ReflexionInicial] Error al guardar en BD:', err);
        alert('Ocurrió un error al guardar la información en la base de datos.');
      }
    });
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
              finalHref = 'https://' + href.replace(/^\/+/, '');
            }

            return `<a href="${finalHref}" target="_blank" rel="noopener noreferrer" class="text-sena font-bold hover:underline">${linkText}</a>`;
          }
        };

        marked.use({ renderer: renderer as any });
        
        // 3. Parseamos 'texto'
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
      this.nuevoLink = ''; 
      event.preventDefault();
    }
  }

  removerLink(index: number) {
    this.links.splice(index, 1);
  }
}