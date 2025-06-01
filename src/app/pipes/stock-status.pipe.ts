// src/app/pipes/stock-status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockStatus',
  standalone: true // Important pour les pipes standalone
})
export class StockStatusPipe implements PipeTransform {

  transform(stock: number | undefined | null, lowStockThreshold: number = 5): string {
    if (stock === null || stock === undefined) {
      return 'N/A';
    }
    if (stock === 0) {
      return 'Rupture de stock';
    }
    if (stock > 0 && stock <= lowStockThreshold) {
      return `Stock faible (${stock})`;
    }
    if (stock > lowStockThreshold) {
      return `Disponible (${stock})`;
    }
    return 'Statut inconnu'; // Au cas où
  }
}