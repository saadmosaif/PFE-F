import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatbotFormatPipe } from '../../pipes/chatbot-format.pipe';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatbotFormatPipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    // Ajouter un message de bienvenue
    this.addBotMessage(
      "Bonjour ! Je suis votre assistant pour le système de gestion portuaire. " +
      "Je peux vous aider avec des informations sur les ports, navires, terminaux, marchandises et visites maritimes. " +
      "Je peux également répondre à des questions générales et vous aider avec votre projet Spring Boot.\n\n" +
      "Essayez de me demander par exemple :\n" +
      "- Liste des ports\n" +
      "- Quels sont les terminaux dans Casablanca ?\n" +
      "- C'est quoi un port ?\n" +
      "- Liste des navires\n" +
      "- Relation entre Navire et Port\n" +
      "- Information sur la classe Conteneur\n" +
      "- Quelles sont les entités du projet Spring Boot ?\n" +
      "- Donne-moi le code CRUD pour NAVIRE\n" +
      "- Quelle est la capitale de la France ?"
    );
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Ajouter le message de l'utilisateur
    this.addUserMessage(this.newMessage);
    const userQuery = this.newMessage;
    this.newMessage = '';

    // Simuler la réponse du bot avec un délai variable pour plus de réalisme
    this.isTyping = true;

    // Calculer un délai basé sur la longueur de la requête (plus la requête est complexe, plus le bot "réfléchit")
    const baseDelay = 1000;
    const variableDelay = Math.min(userQuery.length * 50, 2000); // Max 2 secondes supplémentaires
    const totalDelay = baseDelay + variableDelay;

    setTimeout(() => {
      this.processUserQuery(userQuery);
      this.isTyping = false;

      // Faire défiler automatiquement vers le bas pour voir la nouvelle réponse
      setTimeout(() => {
        const messagesContainer = document.querySelector('.chatbot-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }, totalDelay);
  }

  private processUserQuery(query: string): void {
    this.chatbotService.processQuery(query).subscribe(response => {
      this.addBotMessage(response);
    });
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      isUser: false,
      timestamp: new Date()
    });
  }

  /**
   * Utilise une question rapide suggérée
   */
  useQuickQuestion(question: string): void {
    this.newMessage = question;
    this.sendMessage();
  }
}
