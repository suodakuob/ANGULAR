// src/app/models/product.ts
export interface Product {
  id: string; // CHANGEMENT ICI: number -> string
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
}