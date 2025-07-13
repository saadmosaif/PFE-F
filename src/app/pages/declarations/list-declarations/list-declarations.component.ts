import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeclarationService, Connaissement, DeclarationSearchCriteria, SensTrafic, TypeContenant } from '../../../services/declaration.service';
import { VisiteMaritimeService } from '../../../services/visite-maritime.service';
import { NavireService, Client } from '../../../services/navire.service';

@Component({
  selector: 'app-list-declarations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-declarations.component.html',
  styleUrls: ['./list-declarations.component.scss']
})
export class ListDeclarationsComponent implements OnInit {
  searchForm: FormGroup;
  connaissements: Connaissement[] = [];
  agents: Client[] = [];
  loading = false;
  errorMessage = '';

  // Autocompletion
  filteredAgents: Client[] = [];
  showAgentDropdown = false;

  sensTraficOptions = [
    { value: SensTrafic.IMPORT, label: 'Import' },
    { value: SensTrafic.EXPORT, label: 'Export' }
  ];

  typeContenantOptions = [
    { value: TypeContenant.CONTENEUR, label: 'Conteneur' },
    { value: TypeContenant.RORO, label: 'RORO' },
    { value: TypeContenant.DIVERS, label: 'Divers' }
  ];

  constructor(
    private fb: FormBuilder,
    private declarationService: DeclarationService,
    private visiteMaritimeService: VisiteMaritimeService,
    private navireService: NavireService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      numeroConnaissement: [''],
      escaleId: [''],
      agentMaritimeId: [''],
      agentMaritimeSearch: [''],
      sensTrafic: [''],
      typeContenant: ['']
    });
  }

  ngOnInit(): void {
    this.loadAgents();
    this.searchConnaissements();

    // Set up listener for agent search field
    this.searchForm.get('agentMaritimeSearch')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
    });
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

  selectAgent(agent: Client): void {
    this.searchForm.patchValue({
      agentMaritimeId: agent.id,
      agentMaritimeSearch: agent.compagnie
    });
    this.showAgentDropdown = false;
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
    this.searchConnaissements();
  }

  searchConnaissements(): void {
    this.loading = true;
    this.errorMessage = '';

    const criteria: DeclarationSearchCriteria = {
      numeroConnaissement: this.searchForm.get('numeroConnaissement')?.value || undefined,
      visiteMaritimeId: this.searchForm.get('escaleId')?.value || undefined,
      agentMaritimeId: this.searchForm.get('agentMaritimeId')?.value || undefined,
      sensTrafic: this.searchForm.get('sensTrafic')?.value || undefined,
      typeContenant: this.searchForm.get('typeContenant')?.value || undefined
    };

    this.declarationService.getConnaissements(criteria).subscribe({
      next: (data) => {
        this.connaissements = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche des connaissements';
        this.loading = false;
        console.error(error);
      }
    });
  }

  viewConnaissement(visiteMaritimeId: number): void {
    this.router.navigate(['/declarations', visiteMaritimeId]);
  }
}
