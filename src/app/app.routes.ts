// src/app/app.routes.ts
import { Routes } from '@angular/router';
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

import { ListDeclarationsComponent } from './pages/declarations/list-declarations/list-declarations.component';

export const routes: Routes = [
 
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full'
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent
   },
    // Ports
  { 
    path: 'ports/create',
    component: CreatePortComponent
   },

  { 
    path: 'ports', 
    component: ListPortsComponent
   },

  // Terminaux
  { 
    path: 'terminaux/create',
    component: CreateTerminalComponent
  },
  { 
    path: 'terminaux',
    component: ListTerminalsComponent

   },

  // Navires
  { 
    path: 'navires/create', 
    component: CreateShipComponent 
  },

  { 
    path: 'navires',
    component: ListShipsComponent
  
  },

  // Visites maritimes
  { 
    path: 'escales/create',
    component: CreateEscaleComponent 

  },

  { 
    path: 'escales', 
    component: ListEscalesComponent 
  },

  // Déclarations de marchandises
  { 
    path: 'declarations', component: ListDeclarationsComponent },
];
