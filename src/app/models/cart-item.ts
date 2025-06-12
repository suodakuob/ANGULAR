// src/app/models/cart-item.ts
import { Product } from './product';

export interface CartItem { // S'assurer que 'export' est présent
  product: Product;
  quantity: number;
}