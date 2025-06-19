import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeclarationService, Connaissement, Conteneur, RORO, Divers, TypeContenant, SensTrafic, TypeConteneur } from '../../../services/declaration.service';
import { EscaleService, Escale } from '../../../services/escale.service';

@Component({
  selector: 'app-view-declaration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-declaration.component.html',
  styleUrls: ['./view-declaration.component.scss']
})
export class ViewDeclarationComponent implements OnInit {
  escale: Escale | null = null;
  connaissements: Connaissement[] = [];
  conteneurs: Conteneur[] = [];
  roros: RORO[] = [];
  divers: Divers[] = [];
  loading = true;
  errorMessage = '';
  activeTab = 'connaissements';

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
    private escaleService: EscaleService,
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEscale(+id);
    } else {
      this.errorMessage = 'ID de visite maritime non trouvé';
      this.loading = false;
    }
  }

  loadEscale(id: number): void {
    this.escaleService.getEscaleById(id).subscribe({
      next: (data) => {
        this.escale = data;
        this.loadConnaissements(id);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la visite maritime';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadConnaissements(escaleId: number): void {
    const criteria = { escaleId };
    this.declarationService.getConnaissements(criteria).subscribe({
      next: (data) => {
        this.connaissements = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des connaissements';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadConteneurs(connaissementId: number): void {
    this.declarationService.getConteneurs(connaissementId).subscribe({
      next: (data) => {
        this.conteneurs = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des conteneurs', error);
      }
    });
  }

  loadRoros(connaissementId: number): void {
    this.declarationService.getROROs(connaissementId).subscribe({
      next: (data) => {
        this.roros = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ROROs', error);
      }
    });
  }

  loadDivers(connaissementId: number): void {
    this.declarationService.getDivers(connaissementId).subscribe({
      next: (data) => {
        this.divers = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des divers', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // Load data based on the active tab
    if (tab === 'conteneurs' && this.conteneurs.length === 0) {
      // Load conteneurs for all connaissements
      this.connaissements.forEach(connaissement => {
        this.loadConteneurs(connaissement.id);
      });
    } else if (tab === 'roros' && this.roros.length === 0) {
      // Load roros for all connaissements
      this.connaissements.forEach(connaissement => {
        this.loadRoros(connaissement.id);
      });
    } else if (tab === 'divers' && this.divers.length === 0) {
      // Load divers for all connaissements
      this.connaissements.forEach(connaissement => {
        this.loadDivers(connaissement.id);
      });
    }
  }

  // Modal operations
  openConnaissementModal(): void {
    this.connaissementForm.reset();
    this.showConnaissementModal = true;
  }

  closeConnaissementModal(): void {
    this.showConnaissementModal = false;
  }

  submitConnaissement(): void {
    if (this.connaissementForm.invalid || !this.escale) return;

    const connaissementData = {
      ...this.connaissementForm.value,
      escaleId: this.escale.id
    };

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

  openConteneurModal(): void {
    this.conteneurForm.reset();
    this.showConteneurModal = true;
  }

  closeConteneurModal(): void {
    this.showConteneurModal = false;
  }

  submitConteneur(): void {
    if (this.conteneurForm.invalid) return;

    const conteneurData = this.conteneurForm.value;

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

  openRoroModal(): void {
    this.roroForm.reset();
    this.showRoroModal = true;
  }

  closeRoroModal(): void {
    this.showRoroModal = false;
  }

  submitRoro(): void {
    if (this.roroForm.invalid) return;

    const roroData = this.roroForm.value;

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

  openDiversModal(): void {
    this.diversForm.reset();
    this.showDiversModal = true;
  }

  closeDiversModal(): void {
    this.showDiversModal = false;
  }

  submitDivers(): void {
    if (this.diversForm.invalid) return;

    const diversData = this.diversForm.value;

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
}
