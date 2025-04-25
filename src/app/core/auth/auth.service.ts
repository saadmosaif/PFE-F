import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance, KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {  // ✅ LE MOT "export" EST ESSENTIEL !
  private keycloak: KeycloakInstance;

  constructor() {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'gep-realm',
      clientId: 'gep-frontend',
    });
  }

  async init(): Promise<void> {
    await this.keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      redirectUri: window.location.origin + '/dashboard', // <-- ✅ redirection vers /home
    });
  }

  async getLoggedUser(): Promise<KeycloakProfile> {
    if (!this.keycloak.authenticated) {
      throw new Error('User not authenticated');
    }
    return await this.keycloak.loadUserProfile();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getRoles(): string[] {
    return this.keycloak.realmAccess?.roles || [];
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  isUserInRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getKeycloakInstance(): KeycloakInstance {
    return this.keycloak;
  }
}
