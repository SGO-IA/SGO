import { Component } from '@angular/core';
import { Navbar } from '../../../components/public/navbar/navbar';
import { Footer } from '../../../components/public/footer/footer';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [Navbar, Footer],
  templateUrl: './ayuda.html',
  styleUrl: './ayuda.css',
})
export class Ayuda {

}
