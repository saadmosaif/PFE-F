import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { CreatePortComponent } from './pages/ports/create-port/create-port.component';
import { ListPortsComponent } from './pages/ports/list-ports/list-ports.component';

import { CreateTerminalComponent } from './pages/terminaux/create-terminal/create-terminal.component';
import { ListTerminalsComponent } from './pages/terminaux/list-terminals/list-terminals.component';

import { CreateShipComponent } from './pages/navires/create-ship/create-ship.component';
import { ListShipsComponent } from './pages/navires/list-ships/list-ships.component';

import { CreateEscaleComponent } from './pages/escales/create-escale/create-escale.component';
import { ListEscalesComponent } from './pages/escales/list-escales/list-escales.component';
import { ViewEscaleComponent } from './pages/escales/view-escale/view-escale.component';

import { CreateVisiteMaritimeComponent } from './pages/visites-maritimes/create-visite-maritime/create-visite-maritime.component';
import { ListVisiteMaritimeComponent } from './pages/visites-maritimes/list-visite-maritime/list-visite-maritime.component';
import { ViewVisiteMaritimeComponent } from './pages/visites-maritimes/view-visite-maritime/view-visite-maritime.component';

import { ListDeclarationsComponent } from './pages/declarations/list-declarations/list-declarations.component';
import { ViewDeclarationComponent } from './pages/declarations/view-declaration/view-declaration.component';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  // Ports
  {
    path: 'ports/create',
    component: CreatePortComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ports',
    component: ListPortsComponent,
    canActivate: [authGuard]
  },
  // Terminaux
  {
    path: 'terminaux/create',
    component: CreateTerminalComponent,
    canActivate: [authGuard]
  },
  {
    path: 'terminaux',
    component: ListTerminalsComponent,
    canActivate: [authGuard]
  },
  // Navires
  {
    path: 'navires/create',
    component: CreateShipComponent,
    canActivate: [authGuard]
  },
  {
    path: 'navires',
    component: ListShipsComponent,
    canActivate: [authGuard]
  },
  // Visites maritimes (legacy routes)
  {
    path: 'escales/create',
    component: CreateEscaleComponent,
    canActivate: [authGuard]
  },
  {
    path: 'escales',
    component: ListEscalesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'escales/:id',
    component: ViewEscaleComponent,
    canActivate: [authGuard]
  },
  // Visites maritimes (new routes)
  {
    path: 'visites-maritimes/create',
    component: CreateVisiteMaritimeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'visites-maritimes',
    component: ListVisiteMaritimeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'visites-maritimes/:id',
    component: ViewVisiteMaritimeComponent,
    canActivate: [authGuard]
  },
  // Déclarations de marchandises
  {
    path: 'declarations',
    component: ListDeclarationsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'declarations/:id',
    component: ViewDeclarationComponent,
    canActivate: [authGuard]
  }
];
