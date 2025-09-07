import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeclarationService, Connaissement, Conteneur, RORO, Divers, TypeContenant, SensTrafic, TypeConteneur } from '../../../services/declaration.service';
import { VisiteMaritimeService, VisiteMaritime, VisiteMaritimeStatus } from '../../../services/visite-maritime.service';
import { NavireService, Navire, Client } from '../../../services/navire.service';
import { PortService } from '../../../services/port.service';
import { TerminalService } from '../../../services/terminal.service';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-view-declaration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-declaration.component.html',
  styleUrls: ['./view-declaration.component.scss']
})
export class ViewDeclarationComponent implements OnInit {
  visiteMaritime: VisiteMaritime | null = null;
  connaissements: Connaissement[] = [];
  conteneurs: Conteneur[] = [];
  roros: RORO[] = [];
  divers: Divers[] = [];
  loading = true;
  errorMessage = '';
  activeTab = 'connaissements';

  // Reference data
  ports: any[] = [];
  terminals: any[] = [];
  navires: Navire[] = [];
  clients: Client[] = [];

  // Forms
  connaissementForm: FormGroup;
  conteneurForm: FormGroup;
  roroForm: FormGroup;
  diversForm: FormGroup;

  // Modal visibility
  showConnaissementModal = false;
  showConteneurModal = false;
  showRoroModal = false;
  showDiversModal = false;

  // Edit mode
  editMode = false;
  editItemId: number | null = null;

  // Dropdown options
  sensTraficOptions = [
    { value: SensTrafic.IMPORT, label: 'Import' },
    { value: SensTrafic.EXPORT, label: 'Export' }
  ];

  typeContenantOptions = [
    { value: TypeContenant.CONTENEUR, label: 'Conteneur' },
    { value: TypeContenant.RORO, label: 'RORO' },
    { value: TypeContenant.DIVERS, label: 'Divers' }
  ];

  typeConteneurOptions = [
    { value: TypeConteneur.DRY, label: 'Dry' },
    { value: TypeConteneur.REEFER, label: 'Reefer' },
    { value: TypeConteneur.OPEN_TOP, label: 'Open Top' },
    { value: TypeConteneur.FLAT_RACK, label: 'Flat Rack' },
    { value: TypeConteneur.TANK, label: 'Tank' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private declarationService: DeclarationService,
    private visiteMaritimeService: VisiteMaritimeService,
    private portService: PortService,
    private terminalService: TerminalService,
    private navireService: NavireService,
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.connaissementForm = this.fb.group({
      numeroConnaissement: ['', Validators.required],
      agentMaritime: ['', Validators.required],
      sensTrafic: ['', Validators.required],
      portProvenance: ['', Validators.required],
      portDestination: ['', Validators.required],
      typeContenant: ['', Validators.required],
      nombreUnites: [0, [Validators.required, Validators.min(1)]],
      volume: [0, [Validators.required, Validators.min(0)]]
    });

    this.conteneurForm = this.fb.group({
      connaissementId: ['', Validators.required],
      numeroConteneur: ['', Validators.required],
      codeISO: ['', Validators.required],
      typeConteneur: ['', Validators.required],
      dimensions: ['', Validators.required]
    });

    this.roroForm = this.fb.group({
      connaissementId: ['', Validators.required],
      numeroIdentification: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      poids: [0, [Validators.required, Validators.min(0)]]
    });

    this.diversForm = this.fb.group({
      connaissementId: ['', Validators.required],
      description: ['', Validators.required],
      quantite: [0, [Validators.required, Validators.min(1)]],
      poids: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Load reference data
    this.loadPorts();
    this.loadTerminals();
    this.loadNavires();
    this.loadClients();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVisiteMaritime(+id);
    } else {
      this.errorMessage = 'ID de visite maritime non trouvé';
      this.loading = false;
    }
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
      next: (data: any) => {
        this.terminals = data;
      },
      error: (error: any) => {
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

  loadClients(): void {
    this.clientService.getClient().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients', error);
      }
    });
  }

  loadVisiteMaritime(id: number): void {
    this.visiteMaritimeService.getVisiteMaritimeById(id).subscribe({
      next: (data) => {
        this.visiteMaritime = data;
        this.loadConnaissements(id);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la visite maritime';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadConnaissements(visiteMaritimeId: number): void {
    const criteria = { visiteMaritimeId };
    this.declarationService.getConnaissements(criteria).subscribe({
      next: (data) => {
        this.connaissements = data;

        // Load all other types of merchandise
        if (this.connaissements.length > 0) {
          // Keep track of pending requests
          let pendingRequests = this.connaissements.length * 3; // 3 types of merchandise per connaissement

          const decrementPendingRequests = () => {
            pendingRequests--;
            if (pendingRequests === 0) {
              this.loading = false;
            }
          };

          this.connaissements.forEach(connaissement => {
            // Load conteneurs
            this.declarationService.getConteneurs(connaissement.id).subscribe({
              next: (data) => {
                try {
                  // Filter out items with undefined connaissement or provide a default value
                  const newConteneurs = (data || []).filter(item => item && item.connaissement);

                  // Add a default connaissement object if needed
                  newConteneurs.forEach(conteneur => {
                    if (!conteneur.connaissement) {
                      conteneur.connaissement = {
                        id: 0,
                        numeroConnaissement: 'N/A',
                        agentMaritime: '',
                        sensTrafic: SensTrafic.IMPORT,
                        portProvenance: '',
                        portDestination: '',
                        typeContenant: TypeContenant.CONTENEUR,
                        nombreUnites: 0,
                        volume: 0,
                        visiteMaritimeId: 0,
                        numeroVisite: ''
                      };
                    }
                  });

                  // Add to existing conteneurs
                  this.conteneurs = [...this.conteneurs, ...newConteneurs];
                } catch (err) {
                  console.error('Erreur lors du traitement des données Conteneur', err);
                }
                decrementPendingRequests();
              },
              error: (error) => {
                console.error('Erreur lors du chargement des conteneurs', error);
                decrementPendingRequests();
              }
            });

            // Load roros
            this.declarationService.getROROs(connaissement.id).subscribe({
              next: (data) => {
                try {
                  // Filter out items with undefined connaissement or provide a default value
                  const newRoros = (data || []).filter(item => item && item.connaissement);

                  // Add a default connaissement object if needed
                  newRoros.forEach(roro => {
                    if (!roro.connaissement) {
                      roro.connaissement = {
                        id: 0,
                        numeroConnaissement: 'N/A',
                        agentMaritime: '',
                        sensTrafic: SensTrafic.IMPORT,
                        portProvenance: '',
                        portDestination: '',
                        typeContenant: TypeContenant.RORO,
                        nombreUnites: 0,
                        volume: 0,
                        visiteMaritimeId: 0,
                        numeroVisite: ''
                      };
                    }
                  });

                  // Add to existing roros
                  this.roros = [...this.roros, ...newRoros];
                } catch (err) {
                  console.error('Erreur lors du traitement des données RORO', err);
                }
                decrementPendingRequests();
              },
              error: (error) => {
                console.error('Erreur lors du chargement des ROROs', error);
                decrementPendingRequests();
              }
            });

            // Load divers
            this.declarationService.getDivers(connaissement.id).subscribe({
              next: (data) => {
                try {
                  // Filter out items with undefined connaissement or provide a default value
                  const newDivers = (data || []).filter(item => item && item.connaissement);

                  // Add a default connaissement object if needed
                  newDivers.forEach(item => {
                    if (!item.connaissement) {
                      item.connaissement = {
                        id: 0,
                        numeroConnaissement: 'N/A',
                        agentMaritime: '',
                        sensTrafic: SensTrafic.IMPORT,
                        portProvenance: '',
                        portDestination: '',
                        typeContenant: TypeContenant.DIVERS,
                        nombreUnites: 0,
                        volume: 0,
                        visiteMaritimeId: 0,
                        numeroVisite: ''
                      };
                    }
                  });

                  // Add to existing divers
                  this.divers = [...this.divers, ...newDivers];
                } catch (err) {
                  console.error('Erreur lors du traitement des données Divers', err);
                }
                decrementPendingRequests();
              },
              error: (error) => {
                console.error('Erreur lors du chargement des divers', error);
                decrementPendingRequests();
              }
            });
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des connaissements';
        this.loading = false;
        console.error(error);
      }
    });
  }

  // The loadConteneurs, loadRoros, and loadDivers methods have been inlined in the loadConnaissements method

  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // No need to load data here as it's already loaded when the component is initialized
  }

  // Modal operations
  openConnaissementModal(connaissement?: Connaissement): void {
    this.connaissementForm.reset();
    this.editMode = !!connaissement;
    this.editItemId = connaissement?.id || null;

    if (connaissement) {
      this.connaissementForm.patchValue({
        numeroConnaissement: connaissement.numeroConnaissement,
        agentMaritime: connaissement.agentMaritime,
        sensTrafic: connaissement.sensTrafic,
        portProvenance: connaissement.portProvenance,
        portDestination: connaissement.portDestination,
        typeContenant: connaissement.typeContenant,
        nombreUnites: connaissement.nombreUnites,
        volume: connaissement.volume
      });
    }

    this.showConnaissementModal = true;
  }

  closeConnaissementModal(): void {
    this.showConnaissementModal = false;
    this.editMode = false;
    this.editItemId = null;
  }

  submitConnaissement(): void {
    if (this.connaissementForm.invalid || !this.visiteMaritime) return;

    const connaissementData = {
      ...this.connaissementForm.value,
      visiteMaritimeId: this.visiteMaritime.id
    };

    if (this.editMode && this.editItemId) {
      // Update existing connaissement
      this.declarationService.updateConnaissement(this.editItemId, connaissementData).subscribe({
        next: (updatedConnaissement) => {
          const index = this.connaissements.findIndex(c => c.id === this.editItemId);
          if (index !== -1) {
            this.connaissements[index] = updatedConnaissement;
          }
          this.closeConnaissementModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du connaissement', error);
        }
      });
    } else {
      // Create new connaissement
      this.declarationService.createConnaissement(connaissementData).subscribe({
        next: (newConnaissement) => {
          this.connaissements.push(newConnaissement);
          this.closeConnaissementModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création du connaissement', error);
        }
      });
    }
  }

  openConteneurModal(conteneur?: Conteneur): void {
    this.conteneurForm.reset();
    this.editMode = !!conteneur;
    this.editItemId = conteneur?.id || null;

    if (conteneur) {
      this.conteneurForm.patchValue({
        connaissementId: conteneur.connaissement?.id,
        numeroConteneur: conteneur.numeroConteneur,
        codeISO: conteneur.codeISO,
        typeConteneur: conteneur.typeConteneur,
        dimensions: conteneur.dimensions
      });
    }

    this.showConteneurModal = true;
  }

  closeConteneurModal(): void {
    this.showConteneurModal = false;
    this.editMode = false;
    this.editItemId = null;
  }

  submitConteneur(): void {
    if (this.conteneurForm.invalid) return;

    const conteneurData = this.conteneurForm.value;

    if (this.editMode && this.editItemId) {
      // Update existing conteneur
      this.declarationService.updateConteneur(this.editItemId, conteneurData).subscribe({
        next: (updatedConteneur) => {
          const index = this.conteneurs.findIndex(c => c.id === this.editItemId);
          if (index !== -1) {
            this.conteneurs[index] = updatedConteneur;
          }
          this.closeConteneurModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du conteneur', error);
        }
      });
    } else {
      // Create new conteneur
      this.declarationService.createConteneur(conteneurData).subscribe({
        next: (newConteneur) => {
          this.conteneurs.push(newConteneur);
          this.closeConteneurModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création du conteneur', error);
        }
      });
    }
  }

  openRoroModal(roro?: RORO): void {
    this.roroForm.reset();
    this.editMode = !!roro;
    this.editItemId = roro?.id || null;

    if (roro) {
      this.roroForm.patchValue({
        connaissementId: roro.connaissement?.id,
        numeroIdentification: roro.numeroIdentification,
        marque: roro.marque,
        modele: roro.modele,
        poids: roro.poids
      });
    }

    this.showRoroModal = true;
  }

  closeRoroModal(): void {
    this.showRoroModal = false;
    this.editMode = false;
    this.editItemId = null;
  }

  submitRoro(): void {
    if (this.roroForm.invalid) return;

    const roroData = this.roroForm.value;

    if (this.editMode && this.editItemId) {
      // Update existing RORO
      this.declarationService.updateRORO(this.editItemId, roroData).subscribe({
        next: (updatedRoro) => {
          const index = this.roros.findIndex(r => r.id === this.editItemId);
          if (index !== -1) {
            this.roros[index] = updatedRoro;
          }
          this.closeRoroModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du RORO', error);
        }
      });
    } else {
      // Create new RORO
      this.declarationService.createRORO(roroData).subscribe({
        next: (newRoro) => {
          this.roros.push(newRoro);
          this.closeRoroModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création du RORO', error);
        }
      });
    }
  }

  openDiversModal(divers?: Divers): void {
    this.diversForm.reset();
    this.editMode = !!divers;
    this.editItemId = divers?.id || null;

    if (divers) {
      this.diversForm.patchValue({
        connaissementId: divers.connaissement?.id,
        description: divers.description,
        quantite: divers.quantite,
        poids: divers.poids
      });
    }

    this.showDiversModal = true;
  }

  closeDiversModal(): void {
    this.showDiversModal = false;
    this.editMode = false;
    this.editItemId = null;
  }

  submitDivers(): void {
    if (this.diversForm.invalid) return;

    const diversData = this.diversForm.value;

    if (this.editMode && this.editItemId) {
      // Update existing divers
      this.declarationService.updateDivers(this.editItemId, diversData).subscribe({
        next: (updatedDivers) => {
          const index = this.divers.findIndex(d => d.id === this.editItemId);
          if (index !== -1) {
            this.divers[index] = updatedDivers;
          }
          this.closeDiversModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du divers', error);
        }
      });
    } else {
      // Create new divers
      this.declarationService.createDivers(diversData).subscribe({
        next: (newDivers) => {
          this.divers.push(newDivers);
          this.closeDiversModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création du divers', error);
        }
      });
    }
  }

  // Delete operations
  deleteConnaissement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce connaissement ?')) {
      this.declarationService.deleteConnaissement(id).subscribe({
        next: () => {
          this.connaissements = this.connaissements.filter(c => c.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du connaissement', error);
        }
      });
    }
  }

  deleteConteneur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce conteneur ?')) {
      this.declarationService.deleteConteneur(id).subscribe({
        next: () => {
          this.conteneurs = this.conteneurs.filter(c => c.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du conteneur', error);
        }
      });
    }
  }

  deleteRoro(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce RORO ?')) {
      this.declarationService.deleteRORO(id).subscribe({
        next: () => {
          this.roros = this.roros.filter(r => r.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du RORO', error);
        }
      });
    }
  }

  deleteDivers(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce divers ?')) {
      this.declarationService.deleteDivers(id).subscribe({
        next: () => {
          this.divers = this.divers.filter(d => d.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du divers', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/declarations']);
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

  getStatusLowerCase(status: string | VisiteMaritimeStatus | undefined): string {
    return status ? String(status).toLowerCase() : '';
  }
}
