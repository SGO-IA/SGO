import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../../components/public/navbar/navbar';
import { Footer } from '../../../components/public/footer/footer';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  constructor(private router: Router) {}

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
