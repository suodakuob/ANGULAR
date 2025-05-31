// src/app/components/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product'; // Product.id est string
import { ProductService } from '../../services/product.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Impossible de charger les produits.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onDeleteProductFromList(productId: string, productName: string): void { // CHANGEMENT ICI: productId: number -> productId: string
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productName}" ?`)) {
      this.productService.deleteProduct(productId).subscribe({ // productId est une string
        next: () => {
          console.log(`Produit ${productName} supprimé avec succès depuis la liste.`);
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.message || `Erreur lors de la suppression du produit ${productName}.`;
          console.error(err);
        }
      });
    }
  }
}