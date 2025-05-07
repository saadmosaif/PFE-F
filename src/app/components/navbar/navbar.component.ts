import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakProfile } from 'keycloak-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user?: KeycloakProfile;

  constructor(private authService: AuthService, private router: Router) {}


  async ngOnInit(): Promise<void> {
    this.user = await this.authService.getLoggedUser();
  }

  logout(): void {
    this.authService.logout();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
