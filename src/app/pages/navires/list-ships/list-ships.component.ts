import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {Navire, NavireService} from "../../../services/navire.service";

@Component({
  selector: 'app-list-ships',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './list-ships.component.html',
  styleUrl: './list-ships.component.scss'
})
export class ListShipsComponent implements OnInit {
  ships: Navire[] = [];
  editingNavire: Navire | null = null;

  constructor(private navireService: NavireService) {}

  ngOnInit(): void {
    this.loadNavires();
  }

  loadNavires(): void {
    this.navireService.getNavires().subscribe({
      next: (data) => {
        this.ships = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des navires :', err);
      }
    });
  }

  editNavire(nav: Navire): void {
    this.editingNavire = { ...nav };
  }

  saveNavire(): void {
    if (this.editingNavire && this.editingNavire.id != null) {
      this.navireService.updateNavire(this.editingNavire.id, this.editingNavire).subscribe({
        next: () => {
          this.loadNavires();
          this.editingNavire = null;
        },
        error: (err) => {
          console.error('Erreur lors de la modification du navire :', err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingNavire = null;
  }

  deleteNavire(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce navire ?')) {
      this.navireService.deleteNavire(id).subscribe({
        next: () => {
          this.loadNavires();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du navire :', err);
        }
      });
    }
  }
}
