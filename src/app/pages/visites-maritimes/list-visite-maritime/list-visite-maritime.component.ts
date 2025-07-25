import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VisiteMaritimeService, VisiteMaritime, VisiteMaritimeStatus, VisiteMaritimeSearchCriteria } from '../../../services/visite-maritime.service';
import { NavireService, Navire } from '../../../services/navire.service';
import { Client } from '../../../services/navire.service';

@Component({
  selector: 'app-list-visite-maritime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './list-visite-maritime.component.html',
  styleUrl: './list-visite-maritime.component.scss',
})
export class ListVisiteMaritimeComponent implements OnInit {
  searchForm: FormGroup;
  visitesMaritimes: VisiteMaritime[] = [];
  allVisitesMaritimes: VisiteMaritime[] = []; // All maritime visits
  navires: Navire[] = [];
  agents: Client[] = [];
  loading = true;
  errorMessage = '';

  // Advanced search toggle
  showAdvancedSearch = false;

  // Autocompletion
  filteredNavires: Navire[] = [];
  filteredAgents: Client[] = [];
  showNavireDropdown = false;
  showAgentDropdown = false;

  // Status checkboxes
  statusOptions = [
    { value: VisiteMaritimeStatus.PREVU, label: 'Prévu' },
    { value: VisiteMaritimeStatus.VALIDE, label: 'Validé' },
    { value: VisiteMaritimeStatus.ACTIVE, label: 'Activé' },
    { value: VisiteMaritimeStatus.CLOTURE, label: 'Clôturé' },
    { value: VisiteMaritimeStatus.ANNULE, label: 'Annulé' }
  ];

  constructor(
    private fb: FormBuilder,
    private visiteMaritimeService: VisiteMaritimeService,
    private navireService: NavireService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      // Basic search fields
      numeroVisite: [''],
      numeroAD: [''],

      // Advanced search fields
      etaDebut: [''],
      etaFin: [''],
      etdDebut: [''],
      etdFin: [''],
      statuts: this.fb.group({
        PREVU: [true],
        VALIDE: [true],
        ACTIVE: [true],
        CLOTURE: [true],
        ANNULE: [true]
      }),
      numeroDap: [''],
      terminal: [''],
      agentMaritimeId: [''],
      navireId: [''],
      agentMaritimeSearch: [''],
      navireSearch: ['']
    });
  }

  /**
   * Toggles the advanced search panel visibility
   */
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  /**
   * Resets the search form to its initial state
   */
  resetForm(): void {
    this.searchForm.reset({
      statuts: {
        PREVU: true,
        VALIDE: true,
        ACTIVE: true,
        CLOTURE: true,
        ANNULE: true
      }
    });
    this.searchVisitesMaritimes();
  }
  formatDateTime(value: string): string | undefined {
    if (!value) return undefined;
    // Convert to 'yyyy-MM-ddTHH:mm:ss' format expected by Spring
    const date = new Date(value);
    return date.toISOString().slice(0, 19);
  }


  ngOnInit(): void {
    this.loadNavires();
    this.loadAgents();
    this.searchVisitesMaritimes();
    this.loadAllVisitesMaritimes(); // Load all maritime visits

    // Set up listeners for search fields
    this.searchForm.get('navireSearch')?.valueChanges.subscribe(value => {
      this.filterNavires(value);
    });

    this.searchForm.get('agentMaritimeSearch')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
    });
  }

  // Load all maritime visits without any filtering
  loadAllVisitesMaritimes(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('Loading all maritime visits...');
    this.visiteMaritimeService.getVisitesMaritimes().subscribe({
      next: (data) => {
        console.log('Loaded all maritime visits:', data);
        console.log('Number of maritime visits:', data.length);

        // Map the backend response to the frontend format
        this.allVisitesMaritimes = data.map(visite => {
          console.log('Processing visite maritime:', visite);

          // Create a client object if agentMaritime is a string
          if (typeof visite.agentMaritime === 'string') {
            console.log('Converting agentMaritime string to object:', visite.agentMaritime);
            visite.agentMaritime = {
              id: 0,
              nom: '',
              prenom: '',
              telephone: '',
              adresse: '',
              compagnie: visite.agentMaritime,
              code: '',
              deleted: false
            };
          }

          // Create a navire object if navire is a string
          if (typeof visite.navire === 'string') {
            console.log('Converting navire string to object:', visite.navire);
            visite.navire = {
              id: 0,
              nom: visite.navire,
              numeroIMO: '',
              type: '',
              capacite: 0,
              deleted: false
            };
          }

          // Map statut to status if status is undefined
          if (visite.statut && !visite.status) {
            console.log('Mapping statut to status:', visite.statut);
            visite.status = visite.statut;
          }

          // Map dateETA to eta if eta is undefined
          if (visite.dateETA && !visite.eta) {
            console.log('Mapping dateETA to eta:', visite.dateETA);
            visite.eta = new Date(visite.dateETA).toISOString();
          }

          // Map dateETD to etd if etd is undefined
          if (visite.dateETD && !visite.etd) {
            console.log('Mapping dateETD to etd:', visite.dateETD);
            visite.etd = new Date(visite.dateETD).toISOString();
          }

          return visite;
        });

        console.log('Processed all maritime visits:', this.allVisitesMaritimes);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de toutes les visites maritimes';
        this.loading = false;
        console.error('Erreur lors du chargement de toutes les visites maritimes', error);
      }
    });
  }

  filterNavires(searchText: string): void {
    if (!searchText) {
      this.filteredNavires = [];
      this.showNavireDropdown = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredNavires = this.navires.filter(navire =>
      navire.nom.toLowerCase().includes(searchText)
    );
    this.showNavireDropdown = this.filteredNavires.length > 0;
  }

  filterAgents(searchText: string): void {
    if (!searchText) {
      this.filteredAgents = [];
      this.showAgentDropdown = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredAgents = this.agents.filter(agent =>
      agent.compagnie.toLowerCase().includes(searchText)
    );
    this.showAgentDropdown = this.filteredAgents.length > 0;
  }

  selectNavire(navire: Navire): void {
    this.searchForm.patchValue({
      navireId: navire.id,
      navireSearch: navire.nom
    });
    this.showNavireDropdown = false;
  }

  selectAgent(agent: Client): void {
    this.searchForm.patchValue({
      agentMaritimeId: agent.id,
      agentMaritimeSearch: agent.compagnie
    });
    this.showAgentDropdown = false;
  }

  loadNavires(): void {
    this.navireService.getNavires().subscribe({
      next: (data) => {
        this.navires = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des navires', error);
      }
    });
  }

  loadAgents(): void {
    this.navireService.getClients().subscribe({
      next: (data) => {
        this.agents = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des agents', error);
      }
    });
  }

  onSubmit(): void {
    this.searchVisitesMaritimes();
  }

  searchVisitesMaritimes(): void {
    this.loading = true;
    this.errorMessage = '';

    const criteria: VisiteMaritimeSearchCriteria = {
      // Basic search criteria
      numeroVisite: this.searchForm.get('numeroVisite')?.value || undefined,
      numeroAD: this.searchForm.get('numeroAD')?.value || undefined,

      // Advanced search criteria
      etaDebut: this.formatDateTime(this.searchForm.get('etaDebut')?.value),
      etaFin: this.formatDateTime(this.searchForm.get('etaFin')?.value),
      etdDebut: this.formatDateTime(this.searchForm.get('etdDebut')?.value),
      etdFin: this.formatDateTime(this.searchForm.get('etdFin')?.value),
      numeroDap: this.searchForm.get('numeroDap')?.value || undefined,
      agentMaritimeId: this.searchForm.get('agentMaritimeId')?.value || undefined,
      navireId: this.searchForm.get('navireId')?.value || undefined
    };

    // Get selected statuses
    const statusGroup = this.searchForm.get('statuts') as FormGroup;
    const selectedStatuses: VisiteMaritimeStatus[] = [];

    Object.keys(statusGroup.controls).forEach(key => {
      if (statusGroup.get(key)?.value) {
        selectedStatuses.push(key as VisiteMaritimeStatus);
      }
    });

    if (selectedStatuses.length > 0) {
      criteria.statuts = selectedStatuses;
    }

    this.visiteMaritimeService.getVisitesMaritimes(criteria).subscribe({
      next: (data) => {
        // Map the backend response to the frontend format
        this.visitesMaritimes = data.map(visite => {
          // Create a client object if agentMaritime is a string
          if (typeof visite.agentMaritime === 'string') {
            visite.agentMaritime = {
              id: 0,
              nom: '',
              prenom: '',
              telephone: '',
              adresse: '',
              compagnie: visite.agentMaritime,
              code: '',
              deleted: false
            };
          }

          // Create a navire object if navire is a string
          if (typeof visite.navire === 'string') {
            visite.navire = {
              id: 0,
              nom: visite.navire,
              numeroIMO: '',
              type: '',
              capacite: 0,
              deleted: false
            };
          }

          // Map statut to status if status is undefined
          if (visite.statut && !visite.status) {
            visite.status = visite.statut;
          }

          // Map dateETA to eta if eta is undefined
          if (visite.dateETA && !visite.eta) {
            visite.eta = new Date(visite.dateETA).toISOString();
          }

          // Map dateETD to etd if etd is undefined
          if (visite.dateETD && !visite.etd) {
            visite.etd = new Date(visite.dateETD).toISOString();
          }

          return visite;
        });

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche des visites maritimes';
        this.loading = false;
        console.error(error);
      }
    });
  }

  viewVisiteMaritime(id: number): void {
    this.router.navigate(['/visites-maritimes', id]);
  }

  // Helper methods for type checking
  getNavireNom(navire: string | Navire): string {
    if (navire && typeof navire === 'object' && 'nom' in navire) {
      return navire.nom;
    }
    return navire as string;
  }

  getAgentMaritimeCompagnie(agentMaritime: string | Client): string {
    if (agentMaritime && typeof agentMaritime === 'object' && 'compagnie' in agentMaritime) {
      return agentMaritime.compagnie;
    }
    return agentMaritime as string;
  }

  getStatusLowerCase(status: VisiteMaritimeStatus | undefined): string {
    return status ? status.toLowerCase() : '';
  }
}
