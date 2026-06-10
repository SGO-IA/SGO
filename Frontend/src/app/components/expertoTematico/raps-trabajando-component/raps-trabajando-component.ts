import { Component, input } from '@angular/core';

@Component({
  selector: 'app-raps-trabajando-component',
  imports: [],
  templateUrl: './raps-trabajando-component.html',
  styleUrl: './raps-trabajando-component.css',
})
export class RapsTrabajandoComponent {
  raps = input.required<any[]>();
}
