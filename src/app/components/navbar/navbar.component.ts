import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./navbar.component.scss'],
  template: `
    <nav class="navbar">
      <div class="navbar-left">
        <span *ngIf="user">👤 {{ user.firstName }} {{ user.lastName }}</span>
      </div>
      <div class="navbar-right">
        <button (click)="logout()">Se déconnecter</button>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  user?: KeycloakProfile;

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.getLoggedUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
