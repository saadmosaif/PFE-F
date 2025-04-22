// src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  override async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    
    // Force the user to log in if currently unauthenticated
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    // Get the roles required from the route
    const requiredRoles = route.data['roles'];

    // Allow the user to proceed if no additional roles are required to access the route
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present
    return requiredRoles.every((role: string) => this.roles.includes(role));
  }
}

// Function to use with the canActivate route configuration
export const authGuardFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const keycloak = inject(KeycloakService);
  const guard = new AuthGuard(router, keycloak);
  return await guard.isAccessAllowed(route, state);
};