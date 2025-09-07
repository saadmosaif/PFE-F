import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VisiteMaritimeService, VisiteMaritimeStatus, AD } from '../../../services/visite-maritime.service';
import { NavireService, Navire } from '../../../services/navire.service';
import { Client } from '../../../services/navire.service';
import { PortService, Port } from '../../../services/port.service';
import { TerminalService, Terminal } from '../../../services/terminal.service';

@Component({
  selector: 'app-create-visite-maritime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-visite-maritime.component.html',
  styleUrls: ['./create-visite-maritime.component.scss']
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
  ports: Port[] = [];
  filteredPorts: Port[] = [];
  terminals: Terminal[] = [];
  filteredTerminals: Terminal[] = [];
  showNavireDropdown = false;
  showAgentDropdown = false;
  showTerminalDropdown = false;
  showPortProvenanceDropdown = false;
  showPortDestinationDropdown = false;

  constructor(
    private fb: FormBuilder,
    private visiteMaritimeService: VisiteMaritimeService,
    private navireService: NavireService,
    private portService: PortService,
    private terminalService: TerminalService,
    private router: Router
  ) {
    this.visiteMaritimeForm = this.fb.group({
      terminal: [''],
      terminalSearch: [''],
      terminalId: [''],
      navireId: ['', Validators.required],
      agentMaritimeId: ['', Validators.required],
      navireSearch: ['', Validators.required],
      agentMaritimeSearch: ['', Validators.required]
    });

    this.adForm = this.fb.group({
      dateETA: ['', Validators.required],
      dateETD: ['', Validators.required],
      portProvenance: ['', Validators.required],
      portProvenanceSearch: ['', Validators.required],
      portProvenanceId: [''],
      portDestination: ['', Validators.required],
      portDestinationSearch: ['', Validators.required],
      portDestinationId: ['']
    });
  }

  ngOnInit(): void {
    this.loadNavires();
    this.loadAgents();
    this.loadPorts();
    this.loadTerminals();

    // Set up listeners for search fields
    this.visiteMaritimeForm.get('navireSearch')?.valueChanges.subscribe(value => {
      this.filterNavires(value);
    });

    this.visiteMaritimeForm.get('agentMaritimeSearch')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
    });

    this.visiteMaritimeForm.get('terminalSearch')?.valueChanges.subscribe(value => {
      this.filterTerminals(value);
    });

    this.adForm.get('portProvenanceSearch')?.valueChanges.subscribe(value => {
      this.filterPortProvenance(value);
    });

    this.adForm.get('portDestinationSearch')?.valueChanges.subscribe(value => {
      this.filterPortDestination(value);
    });
  }

  loadPorts(): void {
    this.portService.getPorts().subscribe({
      next: (data) => {
        this.ports = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ports', error);
      }
    });
  }

  loadTerminals(): void {
    this.terminalService.getTerminaux().subscribe({
      next: (data) => {
        this.terminals = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des terminaux', error);
      }
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

  filterTerminals(searchText: string): void {
    if (!searchText) {
      this.filteredTerminals = [];
      this.showTerminalDropdown = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredTerminals = this.terminals.filter(terminal =>
      terminal.numero.toLowerCase().includes(searchText)
    );
    this.showTerminalDropdown = this.filteredTerminals.length > 0;
  }

  filterPortProvenance(searchText: string): void {
    if (!searchText) {
      this.filteredPorts = [];
      this.showPortProvenanceDropdown = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredPorts = this.ports.filter(port =>
      port.nomPort.toLowerCase().includes(searchText)
    );
    this.showPortProvenanceDropdown = this.filteredPorts.length > 0;
  }

  filterPortDestination(searchText: string): void {
    if (!searchText) {
      this.filteredPorts = [];
      this.showPortDestinationDropdown = false;
      return;
    }

    searchText = searchText.toLowerCase();
    this.filteredPorts = this.ports.filter(port =>
      port.nomPort.toLowerCase().includes(searchText)
    );
    this.showPortDestinationDropdown = this.filteredPorts.length > 0;
  }

  selectTerminal(terminal: Terminal): void {
    this.visiteMaritimeForm.patchValue({
      terminalId: terminal.id,
      terminalSearch: terminal.numero,
      terminal: terminal.numero
    });
    this.showTerminalDropdown = false;
  }

  selectPortProvenance(port: Port): void {
    this.adForm.patchValue({
      portProvenanceId: port.id,
      portProvenanceSearch: port.nomPort,
      portProvenance: port.nomPort
    });
    this.showPortProvenanceDropdown = false;
  }

  selectPortDestination(port: Port): void {
    this.adForm.patchValue({
      portDestinationId: port.id,
      portDestinationSearch: port.nomPort,
      portDestination: port.nomPort
    });
    this.showPortDestinationDropdown = false;
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
    delete visiteMaritimeData.terminalSearch;
    delete visiteMaritimeData.ad.portProvenanceSearch;
    delete visiteMaritimeData.ad.portDestinationSearch;

    // Convert dateETA from string to ISO format for backend
    if (visiteMaritimeData.ad.dateETA) {
      // Add time component to make it a valid LocalDateTime
      const dateETA = new Date(visiteMaritimeData.ad.dateETA);
      visiteMaritimeData.etaDebut = dateETA.toISOString();
      console.log('Converted dateETA to ISO format:', visiteMaritimeData.etaDebut);
    }

    // Convert dateETD from string to ISO format for backend
    if (visiteMaritimeData.ad.dateETD) {
      // Add time component to make it a valid LocalDateTime
      const dateETD = new Date(visiteMaritimeData.ad.dateETD);
      visiteMaritimeData.etdDebut = dateETD.toISOString();
      console.log('Converted dateETD to ISO format:', visiteMaritimeData.etdDebut);
    }

    // Debug logging
    console.log('Sending data to backend:', visiteMaritimeData);
    console.log('Port Provenance ID:', visiteMaritimeData.ad.portProvenanceId);
    console.log('Port Destination ID:', visiteMaritimeData.ad.portDestinationId);

    // Move portProvenanceId and portDestinationId to the root level
    visiteMaritimeData.portProvenanceId = visiteMaritimeData.ad.portProvenanceId;
    visiteMaritimeData.portDestinationId = visiteMaritimeData.ad.portDestinationId;

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
