import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalService, Terminal} from '../../../services/terminal.service';
import {HttpClientModule} from '@angular/common/http';


@Component({
  selector: 'app-terminals-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './list-terminals.component.html'
})
export class ListTerminalsComponent implements OnInit {
  terminaux: Terminal[] = [];

  constructor(private terminalService: TerminalService) {}

  ngOnInit(): void {
    this.loadTerminaux();
  }

  loadTerminaux(): void {
    this.terminalService.getTerminaux().subscribe({
      next: (data) => {
        console.log('terminaux récupérés:', data);
        this.terminaux = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des terminaux :', err);
      }
    });
  }
}
