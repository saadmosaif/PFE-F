import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { PortService, Port } from './port.service';
import { TerminalService, Terminal } from './terminal.service';
import { NavireService, Navire, Client } from './navire.service';
import { VisiteMaritimeService, VisiteMaritime } from './visite-maritime.service';
import { DeclarationService, Connaissement, Conteneur, RORO, Divers } from './declaration.service';

// Interfaces pour typer les données
interface EntityRelationship {
  entity: string;
  type: string;
  description: string;
  attribute?: string;
}

interface EntityInfo {
  description: string;
  attributes: string[];
  relationships: EntityRelationship[];
}

interface EntityRelationships {
  [key: string]: EntityInfo;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
  description: string;
  attribute?: string;
}

interface ConversationContext {
  lastTopic?: string;
  lastEntity?: string;
  lastQuestion?: string;
  mentionedEntities: string[];
  userPreferences?: {
    language?: string;
    detailLevel?: 'basic' | 'detailed';
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private context: ConversationContext = {
    mentionedEntities: []
  };

  private readonly greetings = [
    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "Salut ! Je suis là pour répondre à vos questions sur le système portuaire.",
    "Bonjour ! Que voulez-vous savoir sur les ports, navires ou marchandises ?",
    "Bienvenue ! Je peux vous aider avec des informations sur la gestion portuaire."
  ];

  private readonly farewells = [
    "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.",
    "À bientôt ! J'espère avoir pu vous aider.",
    "Bonne journée ! Je reste disponible pour toute autre question.",
    "Au plaisir de vous aider à nouveau !"
  ];

  private readonly acknowledgements = [
    "Je comprends votre question.",
    "Bien sûr, je vais vous aider avec ça.",
    "Laissez-moi vous donner cette information.",
    "Voici ce que je peux vous dire à ce sujet."
  ];

  private readonly confusions = [
    "Je ne suis pas sûr de comprendre votre question. Pourriez-vous la reformuler ?",
    "Désolé, je n'ai pas bien saisi. Pouvez-vous préciser votre demande ?",
    "Je ne comprends pas complètement. Pouvez-vous poser votre question différemment ?",
    "Votre question est un peu ambiguë pour moi. Pourriez-vous être plus précis ?"
  ];

  // Entités du projet Spring Boot
  private readonly springBootEntities = [
    'PORT',
    'TERMINAUX',
    'NAVIRE',
    'MARCHANDISE'
  ];

  private readonly entityRelationships: EntityRelationships = {
    'Port': {
      description: 'Un port maritime avec des terminaux',
      attributes: ['id', 'codePort', 'nomPort', 'localisation', 'capacite'],
      relationships: [
        { entity: 'Terminaux', type: 'OneToMany', description: 'Un port peut avoir plusieurs terminaux' }
      ]
    },
    'Terminaux': {
      description: 'Un terminal portuaire',
      attributes: ['id', 'type', 'numero', 'capacite', 'codePort'],
      relationships: [
        { entity: 'Port', type: 'ManyToOne', description: 'Un terminal appartient à un port' }
      ]
    },
    'Navire': {
      description: 'Un navire maritime',
      attributes: ['id', 'nom', 'type', 'numeroIMO', 'capacite'],
      relationships: [
        { entity: 'Client', type: 'ManyToMany', description: 'Un navire peut être associé à plusieurs clients' },
        { entity: 'VisiteMaritime', type: 'OneToMany', description: 'Un navire peut avoir plusieurs visites maritimes' }
      ]
    },
    'Client': {
      description: 'Un client (classe abstraite)',
      attributes: ['id', 'code', 'nom', 'prenom', 'adresse', 'telephone', 'email', 'compagnie'],
      relationships: [
        { entity: 'Navire', type: 'ManyToMany', description: 'Un client peut être associé à plusieurs navires' }
      ]
    },
    'AgentMaritime': {
      description: 'Un agent maritime (sous-classe de Client)',
      attributes: ['codeAgence'],
      relationships: [
        { entity: 'VisiteMaritime', type: 'OneToMany', description: 'Un agent maritime peut gérer plusieurs visites maritimes' },
        { entity: 'Connaissement', type: 'OneToMany', description: 'Un agent maritime peut gérer plusieurs connaissements' }
      ]
    },
    'VisiteMaritime': {
      description: 'Une visite maritime d\'un navire',
      attributes: ['id', 'numeroVisite', 'statut', 'dateETA', 'dateETD'],
      relationships: [
        { entity: 'Navire', type: 'ManyToOne', description: 'Une visite maritime concerne un navire' },
        { entity: 'AgentMaritime', type: 'ManyToOne', description: 'Une visite maritime est gérée par un agent maritime' },
        { entity: 'Terminaux', type: 'ManyToOne', description: 'Une visite maritime a lieu à un terminal' },
        { entity: 'AD', type: 'OneToOne', description: 'Une visite maritime peut avoir un AD' },
        { entity: 'DAP', type: 'OneToOne', description: 'Une visite maritime peut avoir un DAP' },
        { entity: 'Connaissement', type: 'OneToMany', description: 'Une visite maritime peut avoir plusieurs connaissements' },
        { entity: 'RORO', type: 'OneToMany', description: 'Une visite maritime peut avoir plusieurs RORO' },
        { entity: 'Divers', type: 'OneToMany', description: 'Une visite maritime peut avoir plusieurs éléments divers' }
      ]
    },
    'Connaissement': {
      description: 'Un connaissement (bill of lading)',
      attributes: ['id', 'numeroConnaissement', 'sensTrafic', 'typeContenant', 'nombreUnites', 'volume'],
      relationships: [
        { entity: 'AgentMaritime', type: 'ManyToOne', description: 'Un connaissement est géré par un agent maritime' },
        { entity: 'Port', type: 'ManyToOne', description: 'Un connaissement a un port de provenance', attribute: 'portProvenance' },
        { entity: 'Port', type: 'ManyToOne', description: 'Un connaissement a un port de destination', attribute: 'portDestination' },
        { entity: 'VisiteMaritime', type: 'ManyToOne', description: 'Un connaissement est lié à une visite maritime' },
        { entity: 'Conteneur', type: 'OneToMany', description: 'Un connaissement peut avoir plusieurs conteneurs' }
      ]
    },
    'Conteneur': {
      description: 'Un conteneur maritime',
      attributes: ['id', 'numeroConteneur', 'codeISO', 'typeConteneur', 'dimensions'],
      relationships: [
        { entity: 'Connaissement', type: 'ManyToOne', description: 'Un conteneur est lié à un connaissement' }
      ]
    },
    'RORO': {
      description: 'Un véhicule Roll-On/Roll-Off',
      attributes: ['id', 'numeroChassis', 'marque', 'modele', 'poids'],
      relationships: [
        { entity: 'Connaissement', type: 'ManyToOne', description: 'Un RORO est lié à un connaissement' },
        { entity: 'VisiteMaritime', type: 'ManyToOne', description: 'Un RORO est lié à une visite maritime' }
      ]
    },
    'Divers': {
      description: 'Un élément divers',
      attributes: ['id', 'description', 'type', 'poids', 'volume'],
      relationships: [
        { entity: 'Connaissement', type: 'ManyToOne', description: 'Un élément divers est lié à un connaissement' },
        { entity: 'VisiteMaritime', type: 'ManyToOne', description: 'Un élément divers est lié à une visite maritime' }
      ]
    }
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private portService: PortService,
    private terminalService: TerminalService,
    private navireService: NavireService,
    private visiteMaritimeService: VisiteMaritimeService,
    private declarationService: DeclarationService
  ) {}

  /**
   * Obtient la liste de toutes les entités
   */
  getEntities(): string[] {
    return Object.keys(this.entityRelationships);
  }

  /**
   * Obtient les informations sur une entité spécifique
   */
  getEntityInfo(entityName: string): EntityInfo | null {
    return this.entityRelationships[entityName] || null;
  }

  /**
   * Obtient toutes les relations entre les entités
   */
  getAllRelationships(): Relationship[] {
    const relationships: Relationship[] = [];

    Object.entries(this.entityRelationships).forEach(([entityName, info]) => {
      if (info.relationships) {
        info.relationships.forEach((rel: EntityRelationship) => {
          relationships.push({
            from: entityName,
            to: rel.entity,
            type: rel.type,
            description: rel.description,
            attribute: rel.attribute
          });
        });
      }
    });

    return relationships;
  }

  /**
   * Traite une requête utilisateur et renvoie une réponse
   */
  processQuery(query: string): Observable<string> {
    query = query.toLowerCase().trim();

    // Mettre à jour le contexte de la conversation
    this.updateContext(query);

    // Vérifier si c'est une salutation
    if (this.isGreeting(query)) {
      return of(this.getRandomGreeting());
    }

    // Vérifier si c'est un au revoir
    if (this.isFarewell(query)) {
      return of(this.getRandomFarewell());
    }

    // Vérifier si c'est une demande sur les entités du projet Spring Boot
    if (this.isAskingAboutSpringBootProject(query)) {
      return of(this.getSpringBootProjectInfo());
    }

    // Vérifier si c'est une demande de code pour une entité Spring Boot
    if (this.isAskingForEntityCode(query)) {
      const entity = this.extractEntityForCode(query);
      if (entity) {
        return of(this.generateEntityCode(entity));
      }
    }

    // Vérifier si c'est une demande de liste de ports
    if (this.isAskingForPortsList(query)) {
      return this.getPortsList();
    }

    // Vérifier si c'est une demande de liste de navires
    if (this.isAskingForShipsList(query)) {
      return this.getShipsList();
    }

    // Vérifier si c'est une demande de liste de terminaux
    if (this.isAskingForTerminalsList(query)) {
      return this.getTerminalsList();
    }

    // Vérifier si c'est une demande de liste de marchandises
    if (this.isAskingForGoodsList(query)) {
      return this.getGoodsList();
    }

    // Vérifier si c'est une demande de liste de visites
    if (this.isAskingForVisitsList(query)) {
      return this.getVisitsList();
    }

    // Vérifier si c'est une demande sur les terminaux d'un port spécifique (comme Casablanca)
    if (this.isAskingForPortTerminals(query)) {
      const portName = this.extractPortName(query);
      if (portName) {
        return this.getPortTerminals(portName);
      }
    }

    // Vérifier si c'est une question générale sur ce qu'est un port
    if (this.isAskingWhatIsPort(query)) {
      return of(this.getRandomAcknowledgement() + " Un port est une infrastructure maritime qui permet l'accueil des navires et le chargement/déchargement des marchandises. C'est un point d'interface essentiel entre le transport maritime et terrestre. Les ports modernes disposent de terminaux spécialisés pour différents types de marchandises comme les conteneurs, les véhicules ou les marchandises en vrac.");
    }

    // Liste toutes les classes
    if (query.includes('liste') && query.includes('classe')) {
      const entities = this.getEntities();
      return of(this.getRandomAcknowledgement() + ` Voici la liste des classes du système:\n${entities.join(', ')}`);
    }

    // Information sur une classe spécifique
    for (const entity of this.getEntities()) {
      if (query.includes(entity.toLowerCase())) {
        const info = this.getEntityInfo(entity);
        if (info) {
          let response = this.getRandomAcknowledgement() + `\n\n**${entity}**: ${info.description}\n\n`;

          response += "**Attributs:**\n";
          response += info.attributes.join(', ') + "\n\n";

          response += "**Relations:**\n";
          info.relationships.forEach((rel: EntityRelationship) => {
            response += `- ${rel.description} (${rel.type})\n`;
          });

          return of(response);
        }
      }
    }

    // Relations entre deux classes
    if (query.includes('relation') || query.includes('entre')) {
      for (const entity1 of this.getEntities()) {
        if (query.includes(entity1.toLowerCase())) {
          for (const entity2 of this.getEntities()) {
            if (entity1 !== entity2 && query.includes(entity2.toLowerCase())) {
              return this.getRelationshipBetween(entity1, entity2);
            }
          }
        }
      }
    }

    // Requête spécifique sur les navires dans un port
    if (query.includes('navire') && query.includes('port')) {
      return of(this.getRandomAcknowledgement() + " Les navires sont liés aux ports via les visites maritimes. Un navire peut visiter différents ports, et chaque visite est enregistrée comme une VisiteMaritime qui est associée à un terminal spécifique dans un port.");
    }

    // Requête spécifique sur les terminaux d'un port
    if (query.includes('terminal') && query.includes('port')) {
      return of(this.getRandomAcknowledgement() + " Un port peut avoir plusieurs terminaux. Chaque terminal (Terminaux) est associé à un seul port (Port) via une relation ManyToOne.");
    }

    // Vérifier si c'est une question générale (non liée au projet)
    if (this.isGeneralQuestion(query)) {
      return of(this.handleGeneralQuestion(query));
    }

    // Réponse par défaut
    return of(this.getRandomConfusion());
  }

  /**
   * Met à jour le contexte de la conversation
   */
  private updateContext(query: string): void {
    this.context.lastQuestion = query;

    // Extraire les entités mentionnées dans la requête
    for (const entity of this.getEntities()) {
      if (query.toLowerCase().includes(entity.toLowerCase())) {
        this.context.lastEntity = entity;
        if (!this.context.mentionedEntities.includes(entity)) {
          this.context.mentionedEntities.push(entity);
        }
      }
    }

    // Déterminer le sujet de la conversation
    if (query.includes('port')) {
      this.context.lastTopic = 'port';
    } else if (query.includes('navire') || query.includes('bateau')) {
      this.context.lastTopic = 'navire';
    } else if (query.includes('terminal')) {
      this.context.lastTopic = 'terminal';
    } else if (query.includes('marchandise') || query.includes('conteneur') || query.includes('roro') || query.includes('divers')) {
      this.context.lastTopic = 'marchandise';
    } else if (query.includes('visite')) {
      this.context.lastTopic = 'visite';
    }
  }

  /**
   * Vérifie si la requête est une salutation
   */
  private isGreeting(query: string): boolean {
    const greetingPatterns = ['bonjour', 'salut', 'hello', 'coucou', 'hey', 'bonsoir', 'yo'];
    return greetingPatterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête est un au revoir
   */
  private isFarewell(query: string): boolean {
    const farewellPatterns = ['au revoir', 'bye', 'à bientôt', 'adieu', 'à plus', 'ciao'];
    return farewellPatterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande la liste des ports
   */
  private isAskingForPortsList(query: string): boolean {
    const patterns = [
      'liste des ports',
      'quels sont les ports',
      'ports disponibles',
      'tous les ports',
      'montre les ports',
      'affiche les ports',
      'liste-moi les ports',
      'montre-moi les ports',
      'affiche-moi les ports',
      'me liste les ports',
      'me lister les ports',
      'liste port',
      'lister port',
      'liste de port',
      'les port',
      'les ports'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande la liste des navires
   */
  private isAskingForShipsList(query: string): boolean {
    const patterns = [
      'liste des navires',
      'quels sont les navires',
      'navires disponibles',
      'tous les navires',
      'liste des bateaux',
      'quels sont les bateaux',
      'liste-moi les navires',
      'montre-moi les navires',
      'affiche-moi les navires',
      'me liste les navires',
      'me lister les navires',
      'liste navire',
      'lister navire',
      'liste-moi les bateaux',
      'montre-moi les bateaux',
      'affiche-moi les bateaux',
      'me liste les bateaux',
      'me lister les bateaux',
      'liste de navire',
      'les navire',
      'les navires',
      'liste de bateau',
      'les bateau',
      'les bateaux'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande la liste des terminaux
   */
  private isAskingForTerminalsList(query: string): boolean {
    const patterns = [
      'liste des terminaux',
      'quels sont les terminaux',
      'terminaux disponibles',
      'tous les terminaux',
      'liste-moi les terminaux',
      'montre-moi les terminaux',
      'affiche-moi les terminaux',
      'me liste les terminaux',
      'me lister les terminaux',
      'liste terminal',
      'lister terminal',
      'liste des terminal',
      'liste-moi les terminal',
      'liste de terminal',
      'les terminal',
      'les terminaux'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande la liste des marchandises
   */
  private isAskingForGoodsList(query: string): boolean {
    const patterns = [
      'liste des marchandises',
      'quelles sont les marchandises',
      'marchandises disponibles',
      'toutes les marchandises',
      'liste des conteneurs',
      'liste des roro',
      'liste des divers',
      'liste-moi les marchandises',
      'montre-moi les marchandises',
      'affiche-moi les marchandises',
      'me liste les marchandises',
      'me lister les marchandises',
      'liste marchandise',
      'lister marchandise',
      'liste des déclarations de marchandise',
      'liste-moi les déclarations de marchandise',
      'montre-moi les déclarations de marchandise',
      'affiche-moi les déclarations de marchandise',
      'me liste les déclarations de marchandise',
      'me lister les déclarations de marchandise',
      'liste déclaration de marchandise',
      'lister déclaration de marchandise',
      'déclaration de marchandise'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande la liste des visites
   */
  private isAskingForVisitsList(query: string): boolean {
    const patterns = [
      'liste des visites',
      'quelles sont les visites',
      'visites disponibles',
      'toutes les visites',
      'visites maritimes',
      'liste-moi les visites',
      'montre-moi les visites',
      'affiche-moi les visites',
      'me liste les visites',
      'me lister les visites',
      'liste visite',
      'lister visite',
      'liste des visites maritimes',
      'liste-moi les visites maritimes',
      'montre-moi les visites maritimes',
      'affiche-moi les visites maritimes',
      'me liste les visites maritimes',
      'me lister les visites maritimes',
      'liste visite maritime',
      'lister visite maritime',
      'visite maritime'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Vérifie si la requête demande les terminaux d'un port spécifique
   */
  private isAskingForPortTerminals(query: string): boolean {
    const patterns = [
      'terminaux dans',
      'terminaux de',
      'quels terminaux',
      'quels sont les terminaux'
    ];
    return patterns.some(pattern => query.includes(pattern)) && this.extractPortName(query) !== null;
  }

  /**
   * Vérifie si la requête demande ce qu'est un port
   */
  private isAskingWhatIsPort(query: string): boolean {
    const patterns = [
      'c\'est quoi un port',
      'qu\'est-ce qu\'un port',
      'définition de port',
      'définir port',
      'c\'est quoi port'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Extrait le nom du port de la requête
   */
  private extractPortName(query: string): string | null {
    const portNames = ['casablanca', 'tanger', 'agadir', 'jorf lasfar', 'mohammedia', 'safi', 'nador'];
    for (const portName of portNames) {
      if (query.includes(portName)) {
        return portName;
      }
    }
    return null;
  }

  /**
   * Obtient la liste des ports
   */
  private getPortsList(): Observable<string> {
    return this.portService.getPorts().pipe(
      map(ports => {
        if (ports.length === 0) {
          return "Je n'ai pas trouvé de ports dans le système.";
        }

        let response = this.getRandomAcknowledgement() + " Voici la liste des ports disponibles:\n\n";
        ports.forEach(port => {
          response += `- **${port.nomPort}** (Code: ${port.codePort}, Localisation: ${port.localisation})\n`;
        });

        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des ports', error);
        return of("Désolé, je n'ai pas pu récupérer la liste des ports en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient la liste des navires
   */
  private getShipsList(): Observable<string> {
    return this.navireService.getNavires().pipe(
      map(navires => {
        if (navires.length === 0) {
          return "Je n'ai pas trouvé de navires dans le système.";
        }

        let response = this.getRandomAcknowledgement() + " Voici la liste des navires disponibles:\n\n";
        navires.forEach(navire => {
          response += `- **${navire.nom}** (Type: ${navire.type}, IMO: ${navire.numeroIMO})\n`;
        });

        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des navires', error);
        return of("Désolé, je n'ai pas pu récupérer la liste des navires en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient la liste des terminaux
   */
  private getTerminalsList(): Observable<string> {
    return this.terminalService.getTerminaux().pipe(
      map(terminaux => {
        if (terminaux.length === 0) {
          return "Je n'ai pas trouvé de terminaux dans le système.";
        }

        let response = this.getRandomAcknowledgement() + " Voici la liste des terminaux disponibles:\n\n";
        terminaux.forEach(terminal => {
          const portName = terminal.port ? terminal.port.nomPort : 'Non défini';
          response += `- **Terminal ${terminal.numero}** (Type: ${terminal.type}, Port: ${portName})\n`;
        });

        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des terminaux', error);
        return of("Désolé, je n'ai pas pu récupérer la liste des terminaux en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient la liste des marchandises
   */
  private getGoodsList(): Observable<string> {
    return this.declarationService.getConnaissements().pipe(
      map(connaissements => {
        if (connaissements.length === 0) {
          return "Je n'ai pas trouvé de déclarations de marchandises dans le système.";
        }

        let response = this.getRandomAcknowledgement() + " Voici un aperçu des déclarations de marchandises:\n\n";
        connaissements.forEach(connaissement => {
          response += `- **Connaissement ${connaissement.numeroConnaissement}** (Type: ${connaissement.typeContenant}, Sens: ${connaissement.sensTrafic})\n`;
        });

        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des connaissements', error);
        return of("Désolé, je n'ai pas pu récupérer la liste des marchandises en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient la liste des visites maritimes
   */
  private getVisitsList(): Observable<string> {
    return this.visiteMaritimeService.getVisitesMaritimes().pipe(
      map(visites => {
        if (visites.length === 0) {
          return "Je n'ai pas trouvé de visites maritimes dans le système.";
        }

        let response = this.getRandomAcknowledgement() + " Voici la liste des visites maritimes:\n\n";
        visites.forEach(visite => {
          const navireNom = typeof visite.navire === 'object' ? visite.navire.nom : visite.navire;
          const statut = visite.status || visite.statut || 'Non défini';
          response += `- **Visite ${visite.numeroVisite}** (Navire: ${navireNom}, Statut: ${statut})\n`;
        });

        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des visites maritimes', error);
        return of("Désolé, je n'ai pas pu récupérer la liste des visites maritimes en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient les terminaux d'un port spécifique
   */
  private getPortTerminals(portName: string): Observable<string> {
    return this.portService.getPorts().pipe(
      switchMap(ports => {
        const port = ports.find(p => p.nomPort.toLowerCase().includes(portName.toLowerCase()));
        if (!port) {
          return of(`Je ne trouve pas de port nommé "${portName}" dans le système.`);
        }

        return this.terminalService.getTerminaux().pipe(
          map(terminaux => {
            const portTerminals = terminaux.filter(t => t.port && t.port.id === port.id);

            if (portTerminals.length === 0) {
              return `Le port de ${port.nomPort} n'a pas de terminaux enregistrés dans le système.`;
            }

            let response = this.getRandomAcknowledgement() + ` Voici les terminaux du port de ${port.nomPort}:\n\n`;
            portTerminals.forEach(terminal => {
              response += `- **Terminal ${terminal.numero}** (Type: ${terminal.type}, Capacité: ${terminal.capacite})\n`;
            });

            return response;
          })
        );
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des terminaux du port', error);
        return of("Désolé, je n'ai pas pu récupérer les informations sur les terminaux en raison d'une erreur technique.");
      })
    );
  }

  /**
   * Obtient une salutation aléatoire
   */
  private getRandomGreeting(): string {
    return this.greetings[Math.floor(Math.random() * this.greetings.length)];
  }

  /**
   * Obtient un au revoir aléatoire
   */
  private getRandomFarewell(): string {
    return this.farewells[Math.floor(Math.random() * this.farewells.length)];
  }

  /**
   * Obtient une phrase d'acquiescement aléatoire
   */
  private getRandomAcknowledgement(): string {
    return this.acknowledgements[Math.floor(Math.random() * this.acknowledgements.length)];
  }

  /**
   * Obtient une phrase de confusion aléatoire
   */
  private getRandomConfusion(): string {
    return this.confusions[Math.floor(Math.random() * this.confusions.length)];
  }

  /**
   * Obtient la relation entre deux entités
   */
  private getRelationshipBetween(entity1: string, entity2: string): Observable<string> {
    const info1 = this.getEntityInfo(entity1);
    const info2 = this.getEntityInfo(entity2);

    if (!info1 || !info2) {
      return of(`Je ne trouve pas d'information sur ${!info1 ? entity1 : entity2}.`);
    }

    let directRelations: Relationship[] = [];

    // Chercher les relations directes
    info1.relationships.forEach((rel: EntityRelationship) => {
      if (rel.entity === entity2) {
        directRelations.push({
          from: entity1,
          to: entity2,
          type: rel.type,
          description: rel.description
        });
      }
    });

    info2.relationships.forEach((rel: EntityRelationship) => {
      if (rel.entity === entity1) {
        directRelations.push({
          from: entity2,
          to: entity1,
          type: rel.type,
          description: rel.description
        });
      }
    });

    if (directRelations.length > 0) {
      let response = this.getRandomAcknowledgement() + `\n\nRelations entre ${entity1} et ${entity2}:\n\n`;
      directRelations.forEach((rel: Relationship) => {
        response += `- De ${rel.from} vers ${rel.to}: ${rel.description} (${rel.type})\n`;
      });
      return of(response);
    }

    // Si pas de relation directe, chercher des relations indirectes
    return of(this.getRandomAcknowledgement() + `\n\nIl n'y a pas de relation directe entre ${entity1} et ${entity2}. Ils pourraient être liés indirectement via d'autres entités.`);
  }

  /**
   * Vérifie si la requête concerne le projet Spring Boot
   */
  private isAskingAboutSpringBootProject(query: string): boolean {
    const patterns = [
      'projet spring boot',
      'projet spring',
      'entités du projet',
      'entités disponibles',
      'quelles entités',
      'quelles sont les entités',
      'classes du projet',
      'quelles classes',
      'quelles sont les classes',
      'modèles disponibles',
      'quels modèles',
      'quels sont les modèles'
    ];
    return patterns.some(pattern => query.includes(pattern));
  }

  /**
   * Fournit des informations sur le projet Spring Boot
   */
  private getSpringBootProjectInfo(): string {
    return this.getRandomAcknowledgement() +
      "\n\nTon projet Spring Boot contient les entités suivantes :\n\n" +
      this.springBootEntities.join(', ') +
      "\n\nChaque entité a son CRUD complet implémenté (Create, Read, Update, Delete). " +
      "Tu peux me demander des exemples de code pour n'importe laquelle de ces entités.";
  }

  /**
   * Vérifie si la requête demande du code pour une entité
   */
  private isAskingForEntityCode(query: string): boolean {
    const codePatterns = [
      'code pour',
      'code de',
      'exemple de code',
      'exemple pour',
      'montre-moi le code',
      'montre le code',
      'donne-moi le code',
      'donne le code',
      'crud pour',
      'crud de',
      'implémentation de',
      'implémentation pour'
    ];

    // Vérifie si la requête contient à la fois un pattern de code et une entité
    return codePatterns.some(pattern => query.includes(pattern)) &&
           this.springBootEntities.some(entity => query.toUpperCase().includes(entity));
  }

  /**
   * Extrait l'entité pour laquelle le code est demandé
   */
  private extractEntityForCode(query: string): string | null {
    for (const entity of this.springBootEntities) {
      if (query.toUpperCase().includes(entity)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Vérifie si la requête est une question générale
   */
  private isGeneralQuestion(query: string): boolean {
    // Si la requête contient des mots-clés liés au projet ou aux entités, ce n'est pas une question générale
    const projectKeywords = [
      'spring', 'boot', 'projet', 'entité', 'entités', 'entity', 'entities',
      'crud', 'repository', 'service', 'controller', 'rest', 'api',
      'port', 'terminal', 'navire', 'marchandise'
    ];

    // Si la requête contient un mot-clé lié au projet, ce n'est pas une question générale
    if (projectKeywords.some(keyword => query.includes(keyword))) {
      return false;
    }

    // Si la requête est une demande de liste ou d'information sur une entité spécifique, ce n'est pas une question générale
    if (this.isAskingForPortsList(query) ||
        this.isAskingForShipsList(query) ||
        this.isAskingForTerminalsList(query) ||
        this.isAskingForGoodsList(query) ||
        this.isAskingForVisitsList(query) ||
        this.isAskingForPortTerminals(query) ||
        this.isAskingWhatIsPort(query)) {
      return false;
    }

    // Si la requête est une salutation ou un au revoir, ce n'est pas une question générale
    if (this.isGreeting(query) || this.isFarewell(query)) {
      return false;
    }

    // Sinon, c'est probablement une question générale
    return true;
  }

  /**
   * Traite une question générale
   */
  private handleGeneralQuestion(query: string): string {
    // Réponses à des questions générales courantes
    if (query.includes('qui es-tu') || query.includes('qui êtes-vous') || query.includes('qui est-tu')) {
      return "Je suis un assistant virtuel conçu pour répondre à vos questions. Je peux vous aider avec des informations générales ou des questions spécifiques sur votre projet Spring Boot.";
    }

    if (query.includes('comment ça va') || query.includes('comment vas-tu') || query.includes('ça va')) {
      return "Je vais bien, merci de demander ! Comment puis-je vous aider aujourd'hui ?";
    }

    if (query.includes('merci') || query.includes('thanks')) {
      return "De rien ! C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions.";
    }

    if (query.includes('aide') || query.includes('help')) {
      return "Je peux vous aider avec des informations sur votre projet Spring Boot, notamment sur les entités PORT, TERMINAUX, NAVIRE et MARCHANDISE. Je peux aussi générer du code pour ces entités ou répondre à des questions générales.";
    }

    // Pour les questions générales sur l'informatique ou la programmation
    if (query.includes('java') || query.includes('programming') || query.includes('code')) {
      return "Java est un langage de programmation orienté objet très populaire, particulièrement pour le développement d'applications d'entreprise. Spring Boot est un framework qui simplifie le développement d'applications Java en fournissant des configurations par défaut et en réduisant le code boilerplate.";
    }

    // Pour les questions sur le temps ou la date
    if (query.includes('heure') || query.includes('date') || query.includes('jour')) {
      const now = new Date();
      return `Aujourd'hui nous sommes le ${now.toLocaleDateString('fr-FR')} et il est ${now.toLocaleTimeString('fr-FR')}.`;
    }

    // Réponse générique pour les autres questions générales
    return "Je comprends que vous posez une question générale. En tant qu'assistant, je peux vous aider avec des informations sur divers sujets. Si votre question concerne votre projet Spring Boot, n'hésitez pas à me demander des détails sur les entités disponibles ou des exemples de code.";
  }

  private generateEntityCode(entity: string): string {
    const entityName = entity.charAt(0) + entity.slice(1).toLowerCase();
    let response = this.getRandomAcknowledgement() +
      `\n\nVoici un exemple de code CRUD complet pour l'entité ${entityName} :\n\n`;

    // Générer le code de l'entité
    response += `**1. Entity (${entityName}.java)**\n\`\`\`java\npackage com.example.demo.entity;\n\n`;
    response += `import javax.persistence.*;\nimport lombok.Data;\n\n`;
    response += `@Entity\n@Data\npublic class ${entityName} {\n\n`;
    response += `    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n`;

    // Ajouter des attributs spécifiques selon l'entité
    switch (entity) {
      case 'PORT':
        response += `    private String codePort;\n    private String nomPort;\n    private String localisation;\n    private Integer capacite;\n`;
        break;
      case 'TERMINAUX':
        response += `    private String type;\n    private String numero;\n    private Integer capacite;\n    private String codePort;\n\n`;
        response += `    @ManyToOne\n    @JoinColumn(name = "port_id")\n    private Port port;\n`;
        break;
      case 'NAVIRE':
        response += `    private String nom;\n    private String type;\n    private String numeroIMO;\n    private Integer capacite;\n`;
        break;
      case 'MARCHANDISE':
        response += `    private String type;\n    private String description;\n    private Double poids;\n    private Double volume;\n`;
        break;
      default:
        response += `    // Ajoutez vos attributs ici\n    private String nom;\n    private String description;\n`;
    }

    response += `}\n\`\`\`\n\n`;

    // Générer le code du repository
    response += `**2. Repository (${entityName}Repository.java)**\n\`\`\`java\npackage com.example.demo.repository;\n\n`;
    response += `import com.example.demo.entity.${entityName};\nimport org.springframework.data.jpa.repository.JpaRepository;\nimport org.springframework.stereotype.Repository;\n\n`;
    response += `@Repository\npublic interface ${entityName}Repository extends JpaRepository<${entityName}, Long> {\n    // Vous pouvez ajouter des méthodes de requête personnalisées ici\n}\n\`\`\`\n\n`;

    // Générer le code du service
    response += `**3. Service (${entityName}Service.java)**\n\`\`\`java\npackage com.example.demo.service;\n\n`;
    response += `import com.example.demo.entity.${entityName};\nimport com.example.demo.repository.${entityName}Repository;\n`;
    response += `import org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.stereotype.Service;\n\n`;
    response += `import java.util.List;\nimport java.util.Optional;\n\n`;
    response += `@Service\npublic class ${entityName}Service {\n\n`;
    response += `    private final ${entityName}Repository ${entityName.toLowerCase()}Repository;\n\n`;
    response += `    @Autowired\n    public ${entityName}Service(${entityName}Repository ${entityName.toLowerCase()}Repository) {\n`;
    response += `        this.${entityName.toLowerCase()}Repository = ${entityName.toLowerCase()}Repository;\n    }\n\n`;
    response += `    public List<${entityName}> findAll() {\n        return ${entityName.toLowerCase()}Repository.findAll();\n    }\n\n`;
    response += `    public Optional<${entityName}> findById(Long id) {\n        return ${entityName.toLowerCase()}Repository.findById(id);\n    }\n\n`;
    response += `    public ${entityName} save(${entityName} ${entityName.toLowerCase()}) {\n        return ${entityName.toLowerCase()}Repository.save(${entityName.toLowerCase()});\n    }\n\n`;
    response += `    public void deleteById(Long id) {\n        ${entityName.toLowerCase()}Repository.deleteById(id);\n    }\n`;
    response += `}\n\`\`\`\n\n`;

    // Générer le code du controller
    response += `**4. Controller (${entityName}Controller.java)**\n\`\`\`java\npackage com.example.demo.controller;\n\n`;
    response += `import com.example.demo.entity.${entityName};\nimport com.example.demo.service.${entityName}Service;\n`;
    response += `import org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\n`;
    response += `import org.springframework.web.bind.annotation.*;\n\n`;
    response += `import java.util.List;\nimport java.util.Optional;\n\n`;
    response += `@RestController\n@RequestMapping("/api/${entityName.toLowerCase()}s")\npublic class ${entityName}Controller {\n\n`;
    response += `    private final ${entityName}Service ${entityName.toLowerCase()}Service;\n\n`;
    response += `    @Autowired\n    public ${entityName}Controller(${entityName}Service ${entityName.toLowerCase()}Service) {\n`;
    response += `        this.${entityName.toLowerCase()}Service = ${entityName.toLowerCase()}Service;\n    }\n\n`;
    response += `    @GetMapping\n    public ResponseEntity<List<${entityName}>> getAll${entityName}s() {\n`;
    response += `        List<${entityName}> ${entityName.toLowerCase()}s = ${entityName.toLowerCase()}Service.findAll();\n`;
    response += `        return new ResponseEntity<>(${entityName.toLowerCase()}s, HttpStatus.OK);\n    }\n\n`;
    response += `    @GetMapping("/{id}")\n    public ResponseEntity<${entityName}> get${entityName}ById(@PathVariable Long id) {\n`;
    response += `        Optional<${entityName}> ${entityName.toLowerCase()} = ${entityName.toLowerCase()}Service.findById(id);\n`;
    response += `        return ${entityName.toLowerCase()}.map(value -> new ResponseEntity<>(value, HttpStatus.OK))\n`;
    response += `                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));\n    }\n\n`;
    response += `    @PostMapping\n    public ResponseEntity<${entityName}> create${entityName}(@RequestBody ${entityName} ${entityName.toLowerCase()}) {\n`;
    response += `        ${entityName} saved${entityName} = ${entityName.toLowerCase()}Service.save(${entityName.toLowerCase()});\n`;
    response += `        return new ResponseEntity<>(saved${entityName}, HttpStatus.CREATED);\n    }\n\n`;
    response += `    @PutMapping("/{id}")\n    public ResponseEntity<${entityName}> update${entityName}(@PathVariable Long id, @RequestBody ${entityName} ${entityName.toLowerCase()}) {\n`;
    response += `        Optional<${entityName}> existing${entityName} = ${entityName.toLowerCase()}Service.findById(id);\n`;
    response += `        if (existing${entityName}.isPresent()) {\n`;
    response += `            ${entityName.toLowerCase()}.setId(id);\n`;
    response += `            ${entityName} updated${entityName} = ${entityName.toLowerCase()}Service.save(${entityName.toLowerCase()});\n`;
    response += `            return new ResponseEntity<>(updated${entityName}, HttpStatus.OK);\n`;
    response += `        } else {\n`;
    response += `            return new ResponseEntity<>(HttpStatus.NOT_FOUND);\n`;
    response += `        }\n    }\n\n`;
    response += `    @DeleteMapping("/{id}")\n    public ResponseEntity<Void> delete${entityName}(@PathVariable Long id) {\n`;
    response += `        Optional<${entityName}> ${entityName.toLowerCase()} = ${entityName.toLowerCase()}Service.findById(id);\n`;
    response += `        if (${entityName.toLowerCase()}.isPresent()) {\n`;
    response += `            ${entityName.toLowerCase()}Service.deleteById(id);\n`;
    response += `            return new ResponseEntity<>(HttpStatus.NO_CONTENT);\n`;
    response += `        } else {\n`;
    response += `            return new ResponseEntity<>(HttpStatus.NOT_FOUND);\n`;
    response += `        }\n    }\n`;
    response += `}\n\`\`\`\n\n`;

    response += `Ce code implémente un CRUD complet pour l'entité ${entityName} avec Spring Boot, suivant les bonnes pratiques de développement.`;

    return response;
  }
}
