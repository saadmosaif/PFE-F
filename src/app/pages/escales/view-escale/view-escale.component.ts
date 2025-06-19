import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EscaleService, Escale, EscaleStatus, AD, DAP } from '../../../services/escale.service';

@Component({
  selector: 'app-view-escale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-escale.component.html',
  styleUrl: './view-escale.component.scss'
})
export class ViewEscaleComponent implements OnInit {
  escale: Escale | null = null;
  loading = true;
  errorMessage = '';
  activeTab = 'ad';
  dapForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private escaleService: EscaleService,
    private fb: FormBuilder
  ) {
    this.dapForm = this.fb.group({
      numeroDap: ['', Validators.required],
      dateETA: ['', Validators.required],
      portProvenance: ['', Validators.required],
      portDestination: ['', Validators.required]
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
        this.loading = false;

        // If there's an AD, pre-fill the DAP form with AD data
        if (this.escale.ad) {
          this.dapForm.patchValue({
            dateETA: this.escale.ad.dateETA,
            portProvenance: this.escale.ad.portProvenance,
            portDestination: this.escale.ad.portDestination
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la visite maritime';
        this.loading = false;
        console.error(error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // AD operations
  deleteAD(): void {
    if (!this.escale) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette AD ?')) {
      this.escaleService.deleteAD(this.escale.id).subscribe({
        next: () => {
          if (this.escale) {
            this.escale.ad = undefined;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'AD';
          console.error(error);
        }
      });
    }
  }

  // DAP operations
  submitDAP(): void {
    if (!this.escale || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.escaleService.addDAP(this.escale.id, dapData).subscribe({
      next: (updatedEscale) => {
        this.escale = updatedEscale;
        this.activeTab = 'dap';
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'ajout du DAP';
        console.error(error);
      }
    });
  }

  updateDAP(): void {
    if (!this.escale || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.escaleService.updateDAP(this.escale.id, dapData).subscribe({
      next: (updatedEscale) => {
        this.escale = updatedEscale;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du DAP';
        console.error(error);
      }
    });
  }

  deleteDAP(): void {
    if (!this.escale) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce DAP ?')) {
      this.escaleService.deleteDAP(this.escale.id).subscribe({
        next: () => {
          if (this.escale) {
            this.escale.dap = undefined;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression du DAP';
          console.error(error);
        }
      });
    }
  }

  // Status operations
  annulerEscale(): void {
    if (!this.escale) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette visite maritime ?')) {
      this.escaleService.annulerEscale(this.escale.id).subscribe({
        next: (updatedEscale) => {
          this.escale = updatedEscale;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'annulation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  activerEscale(): void {
    if (!this.escale) return;

    if (confirm('Êtes-vous sûr de vouloir activer cette visite maritime ?')) {
      this.escaleService.activerEscale(this.escale.id).subscribe({
        next: (updatedEscale) => {
          this.escale = updatedEscale;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'activation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  cloturerEscale(): void {
    if (!this.escale) return;

    if (confirm('Êtes-vous sûr de vouloir clôturer cette visite maritime ?')) {
      this.escaleService.cloturerEscale(this.escale.id).subscribe({
        next: (updatedEscale) => {
          this.escale = updatedEscale;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la clôture de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/escales']);
  }
}
