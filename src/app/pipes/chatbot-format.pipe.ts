import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatbotFormat',
  standalone: true
})
export class ChatbotFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remplacer les sauts de ligne par des balises <br>
    let formattedText = value.replace(/\n/g, '<br>');

    // Formater le texte en gras (**texte**)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Formater le texte en italique (*texte*)
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Formater les listes (- item)
    formattedText = formattedText.replace(/- (.*?)(?:<br>|$)/g, '<li>$1</li>');

    // Entourer les listes avec <ul>
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/<li>(.*?)<\/li>(?:<br>|$)/g, '<li>$1</li>');
      formattedText = '<ul>' + formattedText + '</ul>';
      formattedText = formattedText.replace(/<ul>(.*?)<br><li>/g, '<ul><li>');
      formattedText = formattedText.replace(/<\/li><br>(.*?)<\/ul>/g, '</li></ul>');
    }

    return formattedText;
  }
}
