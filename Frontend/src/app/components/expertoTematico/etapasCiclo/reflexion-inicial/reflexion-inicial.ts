import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
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
export class ReflexionInicial implements OnInit{
  archivos: any[] = [];
  links: any[] = [];
  titulo: string = '';
  nuevoLink: string = '';
  contenido: string = '';
  showModal = false;
  contenidoRenderizado: string = '';
  modoEdicion = false;
  seccionIdBD: number | null = null;
  
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

  ngOnInit() {
    this.cargarInformacionGuardada();
  }

  private cargarInformacionGuardada() {
    const cicloId = this.cicloData.cicloId();
    if (!cicloId) return;

    // Llamamos al método GET del servicio pasando el tipo de etapa
    this.cicloService.cargarEtapa(cicloId, 'Reflexión Inicial').subscribe({
      next: async (res) => {
        if (res && res.data) {
          const data = res.data;
          this.seccionIdBD = data.seccionId;
          
          this.titulo = data.titulo || '';
          this.contenido = data.contenido_html || '';
          
          // ✅ CORRECCIÓN AQUÍ: Asegúrate de mapear el 'id' que viene del backend
          this.links = data.enlaces_externos.map((enlace: any) => ({
            id: enlace.id, // El backend debe enviar { id, url }
            url: enlace.url 
          })) || [];
          
          // ✅ CORRECCIÓN AQUÍ: Asegúrate de mapear el 'id' del recurso
          if (data.recursos_adjuntos) {
            this.archivos = data.recursos_adjuntos.map((r: any) => ({
              id: r.id, // <--- ESTO ES VITAL: El ID que viene de la tabla recursos_r2
              name: r.nombre,
              url: r.url,
              tipoArchivo: r.tipoArchivo,
              isBackendFile: true 
            }));
          }

          // Si hay contenido, lo renderizamos de una vez y lo ponemos en modo vista
          if (this.contenido) {
            this.contenidoRenderizado = await marked.parse(this.contenido);
            this.modoEdicion = false;
          }
          
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('🚩 [ReflexionInicial] Error al cargar información previa:', err)
    });
  }

  guardarReflexion() {
    const cicloId = this.cicloData.cicloId(); 

    if (!cicloId) {
      console.error('🚩 [ReflexionInicial] No hay un cicloId definido.');
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
          
          // Juntamos los archivos que ya existían con los nuevos que acabamos de subir
          const archivosViejos = this.archivos.filter(a => a.isBackendFile).map(a => ({
              nombre: a.name,
              url: a.url,
              tipoArchivo: a.tipoArchivo
          }));

          this.ejecutarPersistenciaTexto([...archivosViejos, ...archivosInfoNuevos]);
        },
        error: (err) => console.error('🚩 [ReflexionInicial] Error en carga R2:', err)
      });
    } else {
      // Si no hay archivos nuevos, igual enviamos los viejos para que no se borren en el Upsert
      const archivosViejos = this.archivos.filter(a => a.isBackendFile).map(a => ({
          nombre: a.name,
          url: a.url,
          tipoArchivo: a.tipoArchivo
      }));
      this.ejecutarPersistenciaTexto(archivosViejos);
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
      tipo_etapa: 'Reflexión Inicial', 
      
      contenido_html: this.contenido, 
      
      enlaces_externos: this.links.map(l => l.url),
      recursos_adjuntos: archivosInfo, 
      titulo: this.titulo,
    };

    console.log('📦 [ReflexionInicial] Payload listo para enviar al backend:', payloadBD);

    // 3. Consumo del servicio HTTP
    this.cicloService.guardarEtapa(cicloId, payloadBD).subscribe({
      next: (res) => {
        console.log('✅ [ReflexionInicial] Guardado exitoso en BD:', res);
        
        // Limpiamos los arrays de archivos nuevos después de un guardado exitoso
        this.archivos = this.archivos.filter(a => a.isBackendFile);
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
      // ✅ Guardar como objeto { id, url } en lugar de solo el string
      this.links.push({ 
        id: null, 
        url: this.nuevoLink.trim() 
      });
      
      this.nuevoLink = ''; 
      event.preventDefault();
      
      // ✅ Forzar detección de cambios
      this.cdr.detectChanges(); 
    }
  }

removerRecurso(index: number) {
    const recurso = this.archivos[index];
    
    // DEBUG: Verifica qué tiene el objeto antes de borrar
    console.log("DEBUG Recurso a borrar:", recurso);

    // Si tiene un ID de base de datos, borramos en servidor
    if (recurso.isBackendFile && recurso.id && this.seccionIdBD) {
      this.cicloService.eliminarRecurso(this.seccionIdBD, recurso.id).subscribe({
        next: () => {
          this.archivos.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error al borrar del servidor:", err)
      });
    } else {
      // Si es un archivo local (o no tiene ID), solo borramos del array local
      this.archivos.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

removerLink(index: number) {
    const enlace = this.links[index];
    
    // Si tiene ID, es de BD -> Borramos en servidor
    if (enlace.id && this.seccionIdBD) {
      this.cicloService.eliminarEnlace(this.seccionIdBD, enlace.id).subscribe({
        next: () => {
          this.links.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error al borrar enlace:", err)
      });
    } else {
      // Si es nuevo (id null) -> Borramos solo localmente
      this.links.splice(index, 1);
      this.cdr.detectChanges();
    }
  }
}