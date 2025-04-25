import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-ships',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Liste des Navires</h2>
    <p>Affichage des navires enregistrés (à venir)</p>
  `,
})
export class ListShipsComponent {}