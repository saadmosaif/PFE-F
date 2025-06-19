import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EscaleService, Escale, EscaleStatus, EscaleSearchCriteria } from '../../../services/escale.service';
import { NavireService, Navire } from '../../../services/navire.service';
import { Client } from '../../../services/navire.service';

@Component({
  selector: 'app-list-escales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-escales.component.html',
  styleUrl: './list-escales.component.scss'
})
export class ListEscalesComponent implements OnInit {
  searchForm: FormGroup;
  escales: Escale[] = [];
  navires: Navire[] = [];
  agents: Client[] = [];
  loading = false;
  errorMessage = '';

  // Autocompletion
  filteredNavires: Navire[] = [];
  filteredAgents: Client[] = [];
  showNavireDropdown = false;
  showAgentDropdown = false;

  // Status checkboxes
  statusOptions = [
    { value: EscaleStatus.PREVU, label: 'Prévu' },
    { value: EscaleStatus.VALIDE, label: 'Validé' },
    { value: EscaleStatus.ACTIVE, label: 'Activé' },
    { value: EscaleStatus.CLOTURE, label: 'Clôturé' },
    { value: EscaleStatus.ANNULE, label: 'Annulé' }
  ];

  constructor(
    private fb: FormBuilder,
    private escaleService: EscaleService,
    private navireService: NavireService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      numeroVisite: [''],
      numeroAD: [''],
      eta: [''],
      etd: [''],
      statuts: this.fb.group({
        PREVU: [true],
        VALIDE: [true],
        ACTIVE: [true],
        CLOTURE: [true],
        ANNULE: [true]
      }),
      numeroDap: [''],
      agentMaritimeId: [''],
      navireId: [''],
      agentMaritimeSearch: [''],
      navireSearch: ['']
    });
  }

  ngOnInit(): void {
    this.loadNavires();
    this.loadAgents();
    this.searchEscales();

    // Set up listeners for search fields
    this.searchForm.get('navireSearch')?.valueChanges.subscribe(value => {
      this.filterNavires(value);
    });

    this.searchForm.get('agentMaritimeSearch')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
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
    this.searchEscales();
  }

  searchEscales(): void {
    this.loading = true;
    this.errorMessage = '';

    const criteria: EscaleSearchCriteria = {
      numeroVisite: this.searchForm.get('numeroVisite')?.value || undefined,
      numeroAD: this.searchForm.get('numeroAD')?.value || undefined,
      eta: this.searchForm.get('eta')?.value || undefined,
      etd: this.searchForm.get('etd')?.value || undefined,
      numeroDap: this.searchForm.get('numeroDap')?.value || undefined,
      agentMaritimeId: this.searchForm.get('agentMaritimeId')?.value || undefined,
      navireId: this.searchForm.get('navireId')?.value || undefined
    };

    // Get selected statuses
    const statusGroup = this.searchForm.get('statuts') as FormGroup;
    const selectedStatuses: EscaleStatus[] = [];

    Object.keys(statusGroup.controls).forEach(key => {
      if (statusGroup.get(key)?.value) {
        selectedStatuses.push(key as EscaleStatus);
      }
    });

    if (selectedStatuses.length > 0) {
      criteria.statuts = selectedStatuses;
    }

    this.escaleService.getEscales(criteria).subscribe({
      next: (data) => {
        this.escales = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche des visites maritimes';
        this.loading = false;
        console.error(error);
      }
    });
  }

  viewEscale(id: number): void {
    this.router.navigate(['/escales', id]);
  }
}
