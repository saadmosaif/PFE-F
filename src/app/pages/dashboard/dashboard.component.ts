import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';
import { AnalyticsDashboardComponent } from '../../components/analytics-dashboard/analytics-dashboard.component';

interface Particle {
  x: number;
  y: number;
  delay: number;
}

interface Stat {
  icon: string;
  value: string;
  label: string;
}

interface DashboardAction {
  label: string;
  route: string;
  icon: string;
}

interface DashboardCard {
  title: string;
  icon: string;
  progress: number;
  actions: DashboardAction[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatbotComponent, AnalyticsDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  particles: Particle[] = [];
  hoveredCard: number | null = null;
  scrollProgress: number = 0;

  stats: Stat[] = [
    { icon: '🚢', value: '247', label: 'Navires' },
    { icon: '⚓', value: '12', label: 'Ports' },
    { icon: '🏗️', value: '35', label: 'Terminaux' },
    { icon: '📋', value: '1,543', label: 'Déclarations' }
  ];

  dashboardCards: DashboardCard[] = [
    {
      title: 'Gestion des ports',
      icon: '🏭',
      progress: 85,
      actions: [
        { label: 'Créer Port', route: '/ports/create', icon: '➕' },
        { label: 'Consulter Ports', route: '/ports', icon: '📋' }
      ]
    },
    {
      title: 'Gestion des terminaux',
      icon: '🏗️',
      progress: 72,
      actions: [
        { label: 'Créer Terminal', route: '/terminaux/create', icon: '➕' },
        { label: 'Consulter Terminaux', route: '/terminaux', icon: '📋' }
      ]
    },
    {
      title: 'Gestion des navires',
      icon: '🚢',
      progress: 91,
      actions: [
        { label: 'Créer Navire', route: '/navires/create', icon: '➕' },
        { label: 'Consulter Navires', route: '/navires', icon: '📋' }
      ]
    },
    {
      title: 'Visites Maritimes',
      icon: '⚓',
      progress: 67,
      actions: [
        { label: 'Créer Avis d\'arrivée', route: '/visites-maritimes/create', icon: '📝' },
        { label: 'Consulter Visite Maritime', route: '/visites-maritimes', icon: '📊' }
      ]
    },
    {
      title: 'Déclarations de Marchandises',
      icon: '📦',
      progress: 88,
      actions: [
        { label: 'Consulter Déclarations', route: '/declarations', icon: '📋' }
      ]
    }
  ];

  private animationFrameId: number = 0;

  ngOnInit(): void {
    this.generateParticles();
    this.startParticleAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = (scrollTop / scrollHeight) * 100;
  }

  generateParticles(): void {
    const particleCount = window.innerWidth < 768 ? 15 : 25;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 20
      });
    }
  }

  startParticleAnimation(): void {
    const animateParticles = () => {
      this.particles.forEach(particle => {
        // Animation continue des particules
        particle.y -= 0.5;
        if (particle.y < -10) {
          particle.y = window.innerHeight + 10;
          particle.x = Math.random() * window.innerWidth;
        }
      });

      this.animationFrameId = requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  onCardHover(index: number): void {
    this.hoveredCard = index;
    this.addHoverEffect(index);
  }

  onCardLeave(): void {
    this.hoveredCard = null;
  }

  private addHoverEffect(cardIndex: number): void {
    // Ajout d'effets visuels supplémentaires au hover
    const card = document.querySelectorAll('.dashboard-card')[cardIndex] as HTMLElement;
    if (card) {
      // Création d'un effet de particules au hover
      this.createHoverParticles(card);
    }
  }

  private createHoverParticles(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const particleCount = 5;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.backgroundColor = '#0073e6';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.left = rect.left + Math.random() * rect.width + 'px';
      particle.style.top = rect.top + Math.random() * rect.height + 'px';
      particle.style.zIndex = '1000';
      particle.style.opacity = '0.7';

      document.body.appendChild(particle);

      // Animation des particules
      const animation = particle.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          opacity: '0.7'
        },
        {
          transform: `translate(${(Math.random() - 0.5) * 100}px, ${-50 - Math.random() * 50}px) scale(0)`,
          opacity: '0'
        }
      ], {
        duration: 800 + Math.random() * 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      animation.addEventListener('finish', () => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      });
    }
  }

  toggleHelp(): void {
    // Logique pour afficher l'aide
    this.showHelpModal();
  }

  private showHelpModal(): void {
    // Création d'une modale d'aide avec animation
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                  background: rgba(0, 0, 0, 0.7); z-index: 10000;
                  display: flex; align-items: center; justify-content: center;
                  backdrop-filter: blur(5px);" id="help-modal">
        <div style="background: white; padding: 2rem; border-radius: 15px;
                    max-width: 500px; margin: 1rem; position: relative;
                    animation: modalSlideIn 0.3s ease-out;">
          <button style="position: absolute; top: 10px; right: 15px;
                         background: none; border: none; font-size: 1.5rem;
                         cursor: pointer; color: #666;" onclick="this.closest('#help-modal').remove()">×</button>
          <h2 style="color: #0073e6; margin-bottom: 1rem;">Aide - Gestion Portuaire</h2>
          <p style="margin-bottom: 1rem; line-height: 1.6;">
            Bienvenue dans votre tableau de bord de gestion portuaire.
            Utilisez les cartes ci-dessus pour naviguer entre les différents modules :
          </p>
          <ul style="margin-left: 1rem; line-height: 1.8;">
            <li><strong>Ports :</strong> Créez et gérez vos ports</li>
            <li><strong>Terminaux :</strong> Administration des terminaux</li>
            <li><strong>Navires :</strong> Suivi de la flotte maritime</li>
            <li><strong>Visites :</strong> Gestion des arrivées</li>
            <li><strong>Déclarations :</strong> Suivi des marchandises</li>
          </ul>
          <div style="margin-top: 1.5rem; text-align: center;">
            <button style="background: #0073e6; color: white; border: none;
                           padding: 0.8rem 1.5rem; border-radius: 8px;
                           cursor: pointer; font-weight: 500;"
                    onclick="this.closest('#help-modal').remove()">
              Compris !
            </button>
          </div>
        </div>
      </div>
      <style>
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.7) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      </style>
    `;

    document.body.appendChild(modal);

    // Fermeture au clic sur le fond
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Fermeture avec Escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  // Méthode utilitaire pour ajouter des effets sonores (optionnel)
  private playSound(type: 'hover' | 'click' = 'hover'): void {
    // Vous pouvez ajouter des sons si souhaité
    // const audio = new Audio(`assets/sounds/${type}.mp3`);
    // audio.volume = 0.1;
    // audio.play().catch(() => {}); // Ignore les erreurs de lecture
  }

  // Méthode pour animer l'entrée des éléments
  animateOnScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observer tous les éléments animables
    document.querySelectorAll('.dashboard-card, .stat-bubble').forEach(el => {
      observer.observe(el);
    });
  }

  // Méthode pour optimiser les performances
  private optimizePerformance(): void {
    // Réduction du nombre de particules sur mobile
    if (window.innerWidth < 768) {
      this.particles = this.particles.slice(0, 10);
    }

    // Désactivation des animations complexes si nécessaire
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01s');
    }
  }

  // Gestion du redimensionnement de la fenêtre
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Regénération des particules lors du redimensionnement
    this.particles = [];
    this.generateParticles();
  }

  // Méthode pour le tracking des interactions (analytics)
  trackInteraction(action: string, cardTitle?: string): void {
    // Intégration possible avec Google Analytics ou autre
    console.log(`User interaction: ${action}`, cardTitle || '');

    // Exemple d'implémentation :
    // gtag('event', action, {
    //   event_category: 'Dashboard',
    //   event_label: cardTitle
    // });
  }
}
