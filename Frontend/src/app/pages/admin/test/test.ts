import { Component } from '@angular/core';
import { CompetenciaResumen, EstructuraCompetencia, ProgramaFull, TestInicialService } from '../../../services/admin/test-inicial-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeleccionarCrearTest } from "../../../components/admin/seleccionar-crear-test/seleccionar-crear-test";
import { GenerartestModal } from "../../../components/admin/generartest-modal/generartest-modal";
import { TestService } from '../../../services/expertoTematico/test-inicial';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, FormsModule, SeleccionarCrearTest, GenerartestModal],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  programas: ProgramaFull[] = [];
  competenciasFiltradas: CompetenciaResumen[] = [];
  
  programaSeleccionado: number | null = null;
  competenciaSeleccionada: number | null = null;
  
  estructura: EstructuraCompetencia | null = null;
  cargando: boolean = false;
  analizandoCompetencia: boolean = false;

  testActual: any = null;
  buscandoTest: boolean = false;

  mostrarModalGenerar: boolean = false;
  nombreCompetenciaElegida: string = '';

  dataIA_ParaModal: any = null;

  constructor(private iaService: TestInicialService, private testinicialService: TestService) {}

  ngOnInit(): void {
    this.cargarDatosMaestros();
  }

  cargarDatosMaestros() {
    this.cargando = true;
    this.iaService.obtenerProgramasCompletos().subscribe({
      next: (data) => {
        this.programas = data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  onProgramaChange(id: any) {
    this.programaSeleccionado = id;
    this.competenciaSeleccionada = null;
    this.estructura = null;
    
    const prog = this.programas.find(p => p.programa_id === Number(this.programaSeleccionado));
    this.competenciasFiltradas = prog ? prog.competencias : [];
  }

  prepararContexto() {
    if (!this.competenciaSeleccionada) return;
    
    const comp = this.competenciasFiltradas.find(c => c.id === this.competenciaSeleccionada);
    this.nombreCompetenciaElegida = comp ? comp.nombre : '';
    this.mostrarModalGenerar = true;

  }

onCompetenciaChange(id: any) {
    this.competenciaSeleccionada = id;
    this.testActual = null;
    if (!id) return;

    this.buscandoTest = true;

    this.iaService.consultarTestPorCompetencia(id).subscribe({
        next: (res) => {
            this.buscandoTest = false;
            console.log("Respuesta completa:", res); // MIRA ESTO EN LA CONSOLA
            
            if (res && res.existe) {
                // Asignamos la data interna
                this.testActual = res.data;
            } else {
                this.testActual = null;
            }
        },
        error: (err) => {
            this.buscandoTest = false;
            console.error('Error:', err);
        }
    });
}

procesarGeneracion(configuracionIA: any) {
  if (!this.competenciaSeleccionada) return;

  this.analizandoCompetencia = true; 
  this.dataIA_ParaModal = null;

  const payload = {
    competenciaId: this.competenciaSeleccionada,
    ...configuracionIA
  };

  this.iaService.generarTestConIA(payload).subscribe({
    next: (res) => {
      this.analizandoCompetencia = false;
      
      try {
        // 1. Limpieza de posibles tags de markdown que Claude a veces añade
        const cleanJson = res.data.replace(/```json|```/g, '').trim();
        const testGenerado = JSON.parse(cleanJson);
        
        // 2. IMPORTANTE: En lugar de cerrar el modal, le pasamos la data
        // Esto hará que el modal cambie su vista automáticamente
        this.dataIA_ParaModal = testGenerado; 
        
        console.log('✅ Data enviada al modal para revisión');
      } catch (e) {
        console.error('Error parseando JSON de Claude:', e);
      }
    },
    error: (err) => {
      this.analizandoCompetencia = false;
      console.error('Error en la generación de IA:', err);
    }
  });
}

confirmarYGuardar(evento: any) {
  if (!this.competenciaSeleccionada || !evento) return;

  this.analizandoCompetencia = true;

  const payload = {
    competencia_id: this.competenciaSeleccionada,
    nombre_test: evento.config?.nombre_test || 'Sin nombre',
    descripcion: evento.config?.descripcion || '',
    preguntas: evento.preguntas 
  };

  this.testinicialService.guardarTestIA(payload).subscribe({
    next: (res) => {
      this.analizandoCompetencia = false;

      Swal.fire({
        title: '¡Test Guardado!',
        text: 'El test diagnóstico se ha vinculado correctamente.',
        icon: 'success',
        confirmButtonColor: '#39A900',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.isConfirmed) {

          this.mostrarModalGenerar = false;
          this.dataIA_ParaModal = null;

          this.onCompetenciaChange(this.competenciaSeleccionada);
          
          this.estructura = null; 
        }
      });
    },
    error: (err) => {
      this.analizandoCompetencia = false;
      console.error('❌ Error al persistir:', err);
      Swal.fire({
        title: 'Error al guardar',
        text: 'Hubo un problema con la base de datos.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  });
}
}
