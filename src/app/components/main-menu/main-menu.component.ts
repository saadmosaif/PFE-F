import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  userProfile?: KeycloakProfile;
  isLoggedIn = false;
  userRoles: string[] = [];

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = await this.authService.isLoggedIn();
  
    if (this.isLoggedIn) {
      this.userProfile = await this.authService.getLoggedUser();
      this.userRoles = this.authService.getRoles();
    }
  }
  

  logout(): void {
    this.authService.logout();
  }
}
