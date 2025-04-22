// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Bienvenue dans la page d'accueil</h1>
    <p>Vous êtes authentifié avec succès via Keycloak.</p>
  `
})
export class HomeComponent {}
