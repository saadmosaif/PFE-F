import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-terminals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Liste des Terminaux</h2>
    <p>Affichage des terminaux existants (à venir)</p>
  `,
})
export class ListTerminalsComponent {}