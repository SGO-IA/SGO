import { ChangeDetectorRef, Directive, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { marked } from 'marked';
import { forkJoin } from 'rxjs';
import { CicloDataService } from './services/expertoTematico/ciclo-data-service';
import { IAService } from './services/expertoTematico/ia';
import { CicloDidacticoService } from './services/expertoTematico/ciclo-didactico';
import Swal from 'sweetalert2';

@Directive()
export abstract class EtapaBaseDirective implements OnInit, OnDestroy {
  archivos: any[] = [];
  links: any[] = [];
  titulo: string = '';
  nuevoLink: string = '';
  contenido: string = '';
  showModal = false;
  contenidoRenderizado: string = '';
  modoEdicion = false;
  seccionIdBD: number | null = null;
  
  protected cicloData = inject(CicloDataService);
  protected iaService = inject(IAService);
  protected cdr = inject(ChangeDetectorRef);
  protected cicloService = inject(CicloDidacticoService);
  
  loadingIA = signal(false);
  mensajeActual = signal("");
  protected intervalId: any;
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

  abstract tipoEtapaNombre: string;

  ngOnInit() {
    this.cargarInformacionGuardada();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  protected cargarInformacionGuardada() {
    const cicloId = this.cicloData.cicloId();
    if (!cicloId) return;

    this.cicloService.cargarEtapa(cicloId, this.tipoEtapaNombre).subscribe({
      next: async (res) => {
        if (res && res.data) {
          const data = res.data;
          this.seccionIdBD = data.seccionId;
          this.titulo = data.titulo || '';
          this.contenido = data.contenido_html || '';
          
          this.links = data.enlaces_externos?.map((enlace: any) => ({
            id: enlace.id, 
            url: enlace.url 
          })) || [];
          
          if (data.recursos_adjuntos) {
            this.archivos = data.recursos_adjuntos.map((r: any) => ({
              id: r.id, 
              name: r.nombre,
              url: r.url,
              tipoArchivo: r.tipoArchivo,
              isBackendFile: true 
            }));
          }

          if (this.contenido) {
            this.contenidoRenderizado = await marked.parse(this.contenido);
            this.modoEdicion = false;
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error(`🚩 [${this.tipoEtapaNombre}] Error al cargar:`, err)
    });
  }

  guardarEtapa() {
    const cicloId = this.cicloData.cicloId(); 
    if (!cicloId) {
      console.error(`🚩 [${this.tipoEtapaNombre}] No hay un cicloId definido.`);
      return;
    }

    const archivosNuevos = this.archivos.filter(a => !a.isBackendFile);

    if (archivosNuevos.length > 0) {
      const peticiones = archivosNuevos.map(archivo => 
        this.cicloService.subirRecurso(cicloId, archivo)
      );

      forkJoin(peticiones).subscribe({
        next: (respuestas) => {
          const archivosInfoNuevos = respuestas.map(r => ({
            url: r.data.urlR2,
            nombre: r.data.nombreArchivo,
            tipoArchivo: r.data.tipoArchivo,
            key: r.data.keyR2
          }));
          
          const archivosViejos = this.archivos.filter(a => a.isBackendFile).map(a => ({
              nombre: a.name,
              url: a.url,
              tipoArchivo: a.tipoArchivo
          }));

          this.ejecutarPersistenciaTexto([...archivosViejos, ...archivosInfoNuevos]);
        },
        error: (err) => console.error(`🚩 [${this.tipoEtapaNombre}] Error en carga R2:`, err)
      });
    } else {
      const archivosViejos = this.archivos.filter(a => a.isBackendFile).map(a => ({
          nombre: a.name,
          url: a.url,
          tipoArchivo: a.tipoArchivo
      }));
      this.ejecutarPersistenciaTexto(archivosViejos);
    }
  }

  private ejecutarPersistenciaTexto(archivosInfo: any[]) {
    const cicloId = this.cicloData.cicloId();
    if (!cicloId) return;

    const payloadBD = {
      tipo_etapa: this.tipoEtapaNombre, 
      contenido_html: this.contenido, 
      enlaces_externos: this.links.map(l => l.url),
      recursos_adjuntos: archivosInfo, 
      titulo: this.titulo,
    };

    this.cicloService.guardarEtapa(cicloId, payloadBD).subscribe({
      next: (res) => {
        this.archivos = this.archivos.filter(a => a.isBackendFile);
        this.cdr.detectChanges();
        
        // Alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Guardado exitoso!',
          text: `La etapa de ${this.tipoEtapaNombre} se ha guardado correctamente.`,
          confirmButtonColor: '#39A900', // Verde institucional
          timer: 2500, // Se cierra solo después de 2.5 segundos
          showConfirmButton: false // Oculta el botón para que sea una notificación rápida
        });
      },
      error: (err) => {
        console.error(`❌ [${this.tipoEtapaNombre}] Error al guardar en BD:`, err);
        
        // Alerta de error con SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrió un error al guardar la información en la base de datos. Por favor, intenta de nuevo.',
          confirmButtonColor: '#39A900'
        });
      }
    });
  }

async sugerirIA(customPrompt?: string) {
    const rapId = this.cicloData.rapId();
    
    // 🚩 Validación ruidosa: Si falla, te darás cuenta de inmediato
    if (!rapId) {
      alert("Error: No se ha seleccionado un RAP válido en el contexto.");
      console.error("🚩 [SugerirIA] rapId es null o undefined.");
      return;
    }

    this.loadingIA.set(true);
    // Si el prompt está vacío, enviamos el contenido actual como contexto
    const promptToUse = customPrompt || this.contenido || "Genera la estructura inicial.";
    this.contenido = "";
    
    let i = 0;
    this.intervalId = setInterval(() => {
      this.mensajeActual.set(this.mensajesCarga[i % this.mensajesCarga.length]);
      i++;
    }, 2500); 

    this.iaService.sugerir(promptToUse, this.tipoEtapaNombre, rapId).subscribe({
      next: async (res) => {
        let textoCrudo = res.sugerencia || "";
        let tituloExtraido = this.titulo; 
        let contenidoLimpio = textoCrudo;

        try {
          // 1. Limpieza estricta de formato Markdown/JSON (Vital para Cloudflare Workers AI)
          let jsonLimpio = textoCrudo.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          
          // 2. Extracción del DTO JSON
          const data = JSON.parse(jsonLimpio);
          tituloExtraido = data.titulo || this.titulo;
          contenidoLimpio = data.contenido || "";
        } catch (error) {
          console.warn("🚩 La IA no devolvió un JSON válido. Procesando como texto plano.");
          contenidoLimpio = textoCrudo;
        }

        // 3. Limpieza de Links rotos y undefined
        contenidoLimpio = contenidoLimpio.replace(/undefined/g, ""); 
        contenidoLimpio = contenidoLimpio.replace(/\[\]\((undefined|null)\)/g, "");
        contenidoLimpio = contenidoLimpio.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
        
        // 4. Inyección a las variables del modelo (Actualiza la UI)
        this.titulo = tituloExtraido;
        this.contenido = contenidoLimpio;
        this.modoEdicion = false;
        
        // 5. Motor de renderizado Markdown a HTML
        const renderer = {
          link(href: string, title: string | null, text: string) {
            let linkText = (!text || text === 'undefined') ? 'Ver recurso externo' : text;
            let finalHref = href.startsWith('http') ? href : 'https://' + href.replace(/^\/+/, '');
            return `<a href="${finalHref}" target="_blank" rel="noopener noreferrer" class="text-sena font-bold hover:underline">${linkText}</a>`;
          }
        };

        marked.use({ renderer: renderer as any });
        this.contenidoRenderizado = await marked.parse(this.contenido);
        
        this.finalizarCarga();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("❌ Error HTTP en la IA:", err);
        this.contenido = "Error de conexión con el servidor de IA. Revisa la consola.";
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
    this.showModal = false;
    this.sugerirIA(customPrompt);
  }

  private finalizarCarga() {
    this.loadingIA.set(false);
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.archivos.push(files[i]);
    }
  }
  agregarLink(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.nuevoLink.trim() !== '') {
      let urlFinal = this.nuevoLink.trim();

      // Validación vital: Agregar https:// si el usuario olvidó ponerlo
      if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
        urlFinal = 'https://' + urlFinal;
      }

      this.links.push({ id: null, url: urlFinal });
      
      this.nuevoLink = ''; 
      event.preventDefault();
      this.cdr.detectChanges(); 
    }
  }

  removerRecurso(index: number) {
    const recurso = this.archivos[index];
    if (recurso.isBackendFile && recurso.id && this.seccionIdBD) {
      this.cicloService.eliminarRecurso(this.seccionIdBD, recurso.id).subscribe({
        next: () => {
          this.archivos.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error al borrar del servidor:", err)
      });
    } else {
      this.archivos.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  removerLink(index: number) {
    const enlace = this.links[index];
    if (enlace.id && this.seccionIdBD) {
      this.cicloService.eliminarEnlace(this.seccionIdBD, enlace.id).subscribe({
        next: () => {
          this.links.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error al borrar enlace:", err)
      });
    } else {
      this.links.splice(index, 1);
      this.cdr.detectChanges();
    }
  }
}