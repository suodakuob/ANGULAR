// src/app/pipes/stock-status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockStatus', // Le nom qu'on utilisera dans le template: {{ value | stockStatus }}
  standalone: true    // Important pour les pipes utilisés dans des composants standalone
})
export class StockStatusPipe implements PipeTransform {

  transform(value: number | undefined | null, lowStockThreshold: number = 5): string {
    if (value === null || typeof value === 'undefined') {
      return 'N/A'; // Ou 'Indisponible', 'Non spécifié'
    }
    if (value === 0) {
      return 'Épuisé';
    }
    if (value > 0 && value <= lowStockThreshold) {
      return `Stock faible (${value})`;
    }
    if (value > lowStockThreshold) {
      return `En stock (${value})`;
    }
    return 'Inconnu'; // Cas par défaut, ne devrait pas arriver si la logique est bonne
  }
}