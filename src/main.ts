import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './app/core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

const authService = new AuthService();

authService.init().then(() => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      provideRouter(routes),
      { provide: AuthService, useValue: authService }, // ✅ obligatoire ici
    ]
  });
});
