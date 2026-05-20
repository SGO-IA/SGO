import { Component } from '@angular/core';
import { ListarExpertos } from "../../../components/expertoTematico/listar-expertos/listar-expertos";

@Component({
  selector: 'app-expertos',
  standalone: true,
  imports: [ListarExpertos],
  templateUrl: './expertos.html',
  styleUrl: './expertos.css',
})
export class Expertos {

}
