// home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Bienvenue dans la page d'accueil</h2>
    <p *ngIf="profile">Bonjour {{ profile.firstName }} {{ profile.lastName }} ({{ profile.email }})</p>
    <button (click)="logout()">Se déconnecter</button>
  `,
})
export class HomeComponent implements OnInit {
  profile?: KeycloakProfile;

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.profile = await this.authService.getLoggedUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
