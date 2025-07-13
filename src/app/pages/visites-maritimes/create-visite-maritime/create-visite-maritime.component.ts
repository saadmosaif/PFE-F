import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VisiteMaritimeService, VisiteMaritimeStatus, AD } from '../../../services/visite-maritime.service';
import { NavireService, Navire } from '../../../services/navire.service';
import { Client } from '../../../services/navire.service';

@Component({
  selector: 'app-create-visite-maritime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-visite-maritime.component.html',
  styleUrl: './create-visite-maritime.component.scss'
})
export class    CreateVisiteMaritimeComponent implements OnInit {
  visiteMaritimeForm: FormGroup;
  adForm: FormGroup;
  navires: Navire[] = [];
  agents: Client[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Autocompletion
  filteredNavires: Navire[] = [];
  filteredAgents: Client[] = [];
  showNavireDropdown = false;
  showAgentDropdown = false;

  constructor(
    private fb: FormBuilder,
    private visiteMaritimeService: VisiteMaritimeService,
    private navireService: NavireService,
    private router: Router
  ) {
    this.visiteMaritimeForm = this.fb.group({
      numeroVisite: ['', Validators.required],
      terminal: [''],
      navireId: ['', Validators.required],
      agentMaritimeId: ['', Validators.required],
      navireSearch: ['', Validators.required],
      agentMaritimeSearch: ['', Validators.required]
    });

    this.adForm = this.fb.group({
      numeroAD: ['', Validators.required],
      dateETA: ['', Validators.required],
      portProvenance: ['', Validators.required],
      portDestination: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadNavires();
    this.loadAgents();

    // Set up listeners for search fields
    this.visiteMaritimeForm.get('navireSearch')?.valueChanges.subscribe(value => {
      this.filterNavires(value);
    });

    this.visiteMaritimeForm.get('agentMaritimeSearch')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
    });
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
    this.visiteMaritimeForm.patchValue({
      navireId: navire.id,
      navireSearch: navire.nom
    });
    this.showNavireDropdown = false;
  }

  selectAgent(agent: Client): void {
    this.visiteMaritimeForm.patchValue({
      agentMaritimeId: agent.id,
      agentMaritimeSearch: agent.compagnie
    });
    this.showAgentDropdown = false;
  }

  onSubmit(): void {
    if (this.visiteMaritimeForm.invalid || this.adForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.visiteMaritimeForm.controls).forEach(key => {
        const control = this.visiteMaritimeForm.get(key);
        control?.markAsTouched();
      });

      Object.keys(this.adForm.controls).forEach(key => {
        const control = this.adForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare the data for submission
    const visiteMaritimeData = {
      ...this.visiteMaritimeForm.value,
      ad: this.adForm.value,
      status: VisiteMaritimeStatus.PREVU // New visits always start with PREVU status
    };

    // Remove search fields that are not needed for the API
    delete visiteMaritimeData.navireSearch;
    delete visiteMaritimeData.agentMaritimeSearch;

    this.visiteMaritimeService.createVisiteMaritime(visiteMaritimeData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Visite maritime créée avec succès!';

        // Reset the form
        this.visiteMaritimeForm.reset();
        this.adForm.reset();

        // Navigate to the view page after a short delay
        setTimeout(() => {
          this.router.navigate(['/visites-maritimes', response.id]);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors de la création de la visite maritime';
        console.error('Erreur lors de la création de la visite maritime', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/visites-maritimes']);
  }
}
