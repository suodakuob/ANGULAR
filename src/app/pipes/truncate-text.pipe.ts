// src/app/pipes/truncate-text.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText', // Le nom que tu utiliseras dans les templates: {{ myText | truncateText }}
  standalone: true    // Important pour les pipes standalone
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string | null | undefined, maxLength: number = 100, suffix: string = '...'): string {
    if (!value) { // Gère les cas où la valeur est null, undefined ou une chaîne vide
      return '';
    }

    if (value.length <= maxLength) {
      return value; // Pas besoin de tronquer
    }

    // Tronquer la chaîne et ajouter le suffixe
    // On essaie de ne pas couper en milieu de mot si possible, mais pour simplifier on va juste slicer.
    // Pour une troncature plus intelligente (par mot), la logique serait plus complexe.
    return value.slice(0, maxLength) + suffix;
  }
}