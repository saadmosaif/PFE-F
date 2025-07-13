import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VisiteMaritimeService, VisiteMaritime, VisiteMaritimeStatus, AD, DAP } from '../../../services/visite-maritime.service';
import { Navire, Client } from '../../../services/navire.service';

@Component({
  selector: 'app-view-visite-maritime',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-visite-maritime.component.html',
  styleUrl: './view-visite-maritime.component.scss'
})
export class ViewVisiteMaritimeComponent implements OnInit {
  visiteMaritime: VisiteMaritime | null = null;
  loading = true;
  errorMessage = '';
  activeTab = 'ad';
  dapForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visiteMaritimeService: VisiteMaritimeService,
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
      this.loadVisiteMaritime(+id);
    } else {
      this.errorMessage = 'ID de visite maritime non trouvé';
      this.loading = false;
    }
  }

  loadVisiteMaritime(id: number): void {
    this.visiteMaritimeService.getVisiteMaritimeById(id).subscribe({
      next: (data) => {
        this.visiteMaritime = data;
        this.loading = false;

        // If there's an AD, pre-fill the DAP form with AD data
        if (this.visiteMaritime.ad) {
          this.dapForm.patchValue({
            dateETA: this.visiteMaritime.ad.dateETA,
            portProvenance: this.visiteMaritime.ad.portProvenance,
            portDestination: this.visiteMaritime.ad.portDestination
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
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette AD ?')) {
      this.visiteMaritimeService.deleteAD(this.visiteMaritime.id).subscribe({
        next: () => {
          if (this.visiteMaritime) {
            this.visiteMaritime.ad = undefined;
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
    if (!this.visiteMaritime || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.visiteMaritimeService.addDAP(this.visiteMaritime.id, dapData).subscribe({
      next: (updatedVisiteMaritime) => {
        this.visiteMaritime = updatedVisiteMaritime;
        this.activeTab = 'dap';
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'ajout du DAP';
        console.error(error);
      }
    });
  }

  updateDAP(): void {
    if (!this.visiteMaritime || this.dapForm.invalid) return;

    const dapData: DAP = this.dapForm.value;

    this.visiteMaritimeService.updateDAP(this.visiteMaritime.id, dapData).subscribe({
      next: (updatedVisiteMaritime) => {
        this.visiteMaritime = updatedVisiteMaritime;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du DAP';
        console.error(error);
      }
    });
  }

  deleteDAP(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce DAP ?')) {
      this.visiteMaritimeService.deleteDAP(this.visiteMaritime.id).subscribe({
        next: () => {
          if (this.visiteMaritime) {
            this.visiteMaritime.dap = undefined;
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
  annulerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette visite maritime ?')) {
      this.visiteMaritimeService.annulerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'annulation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  activerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir activer cette visite maritime ?')) {
      this.visiteMaritimeService.activerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'activation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  cloturerVisiteMaritime(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir clôturer cette visite maritime ?')) {
      this.visiteMaritimeService.cloturerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la clôture de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/visites-maritimes']);
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
