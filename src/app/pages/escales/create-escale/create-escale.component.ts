import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-escale',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Créer un Avis d’arrivée</h2>
    <p>Formulaire d’avis d’arrivée (à venir)</p>
  `,
})
export class CreateEscaleComponent {}