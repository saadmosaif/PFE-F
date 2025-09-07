import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EscaleService, Escale, EscaleStatus, AD, DAP } from '../../../services/escale.service';
import { VisiteMaritimeService, VisiteMaritime, VisiteMaritimeStatus } from '../../../services/visite-maritime.service';
import { Navire, Client } from '../../../services/navire.service';

@Component({
  selector: 'app-view-escale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-escale.component.html',
  styleUrls: ['./view-escale.component.scss']
})
export class ViewEscaleComponent implements OnInit {
  escale: Escale | null = null;
  visiteMaritime: VisiteMaritime | null = null;
  loading = true;
  errorMessage = '';
  activeTab = 'ad';
  dapForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private escaleService: EscaleService,
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
      this.loadEscale(+id);
    } else {
      this.errorMessage = 'ID de visite maritime non trouvé';
      this.loading = false;
    }
  }

  loadEscale(id: number): void {
    this.visiteMaritimeService.getVisiteMaritimeById(id).subscribe({
      next: (data) => {
        this.visiteMaritime = data;
        // For backward compatibility, also update the escale property
        this.escale = this.visiteMaritime as unknown as Escale;
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
            // For backward compatibility, also update the escale property
            this.escale = this.visiteMaritime as unknown as Escale;
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
        // For backward compatibility, also update the escale property
        this.escale = this.visiteMaritime as unknown as Escale;
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
        // For backward compatibility, also update the escale property
        this.escale = this.visiteMaritime as unknown as Escale;
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
            // For backward compatibility, also update the escale property
            this.escale = this.visiteMaritime as unknown as Escale;
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
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette visite maritime ?')) {
      this.visiteMaritimeService.annulerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          // For backward compatibility, also update the escale property
          this.escale = this.visiteMaritime as unknown as Escale;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'annulation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  activerEscale(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir activer cette visite maritime ?')) {
      this.visiteMaritimeService.activerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          // For backward compatibility, also update the escale property
          this.escale = this.visiteMaritime as unknown as Escale;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'activation de la visite maritime';
          console.error(error);
        }
      });
    }
  }

  cloturerEscale(): void {
    if (!this.visiteMaritime) return;

    if (confirm('Êtes-vous sûr de vouloir clôturer cette visite maritime ?')) {
      this.visiteMaritimeService.cloturerVisiteMaritime(this.visiteMaritime.id).subscribe({
        next: (updatedVisiteMaritime) => {
          this.visiteMaritime = updatedVisiteMaritime;
          // For backward compatibility, also update the escale property
          this.escale = this.visiteMaritime as unknown as Escale;
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

  getStatusLowerCase(status: EscaleStatus | undefined): string {
    return status ? status.toLowerCase() : '';
  }
}
