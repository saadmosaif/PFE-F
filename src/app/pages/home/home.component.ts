import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="content">
    <h2>Bienvenue dans la page d'accueil</h2>
  </div>
  `,
  styles: [`
    .content {
      padding: 2rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {}
}
