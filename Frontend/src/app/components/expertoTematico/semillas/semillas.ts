import { Component, inject, OnInit } from '@angular/core';
import { SemillasService } from '../../../services/expertoTematico/semillas';
import { LoginService } from '../../../services/public/login-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-semillasComponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semillas.html',
  styleUrl: './semillas.css',
})
export class SemillasComponent implements OnInit {
  public semillaService = inject(SemillasService);
  private loginService = inject(LoginService);

  ngOnInit(): void {
    this.loginService.getProfile().subscribe({
      next: (res) => {
        if (res && res.autenticado) {
          // Ejecuta la petición. Al dispararse, el 'tap' del servicio actualizará los Signals de forma transparente
          this.semillaService.obtenerMisSemillas().subscribe({
            error: (err) => console.error('Error al descargar semillas:', err)
          });
        }
      },
      error: (err) => {
        console.error('Error de autenticación al cargar semillas:', err);
      }
    });
  }
}