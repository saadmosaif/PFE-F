import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortService, Port } from '../../../services/port.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-list-ports',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './list-ports.component.html',
  styleUrls: ['./list-ports.component.scss']
})
export class ListPortsComponent implements OnInit {
  ports: Port[] = [];
  editingPort: Port | null = null;

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    this.loadPorts();
  }

  loadPorts(): void {
    this.portService.getPorts().subscribe({
      next: (data) => {
        this.ports = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ports :', err);
      }
    });
  }

  editPort(port: Port): void {
    this.editingPort = { ...port }; // copie pour l'édition
  }

  savePort(): void {
    if (this.editingPort && this.editingPort.id != null) {
      this.portService.updatePort(this.editingPort.id, this.editingPort).subscribe({
        next: () => {
          this.loadPorts();
          this.editingPort = null;
        },
        error: (err) => {
          console.error('Erreur lors de la modification du port :', err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingPort = null;
  }

  deletePort(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce port ?')) {
      this.portService.deletePort(id).subscribe({
        next: () => {
          this.loadPorts();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du port :', err);
        }
      });
    }
  }
}
