import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-declarations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Déclarations de Marchandises</h2>
    <p>Liste des déclarations disponibles (à venir)</p>
  `,
})
export class ListDeclarationsComponent {}
