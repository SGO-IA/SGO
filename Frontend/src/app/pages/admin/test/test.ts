import { Component } from '@angular/core';
import { CompetenciaResumen, EstructuraCompetencia, ProgramaFull, TestInicialService } from '../../../services/admin/test-inicial-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeleccionarCrearTest } from "../../../components/admin/seleccionar-crear-test/seleccionar-crear-test";
import { GenerartestModal } from "../../../components/admin/generartest-modal/generartest-modal";

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

  constructor(private iaService: TestInicialService) {}

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
    
    // Buscamos el nombre de la competencia para pasarlo al modal
    const comp = this.competenciasFiltradas.find(c => c.id === this.competenciaSeleccionada);
    this.nombreCompetenciaElegida = comp ? comp.nombre : '';

    // Abrimos el modal directamente
    this.mostrarModalGenerar = true;

    // La lógica de iaService.obtenerEstructuraCompetencia la moveremos 
    // dentro del modal más adelante para que el modal gestione su propia carga.
  }

  onCompetenciaChange(id: any) {
  this.competenciaSeleccionada = id;
  this.testActual = null; // Limpiar test anterior
  this.estructura = null;

  if (!id) return;

  this.buscandoTest = true;

  this.iaService.consultarTestPorCompetencia(id).subscribe({
    next: (res) => {
      this.buscandoTest = false;
      if (res.existe) {
        this.testActual = res.data;
      } else {
        // Si no existe, procedemos a cargar la estructura para la IA
        this.prepararContexto();
      }
    },
    error: () => {
      this.buscandoTest = false;
      console.error('Error al verificar el test');
    }
  });
}
}
