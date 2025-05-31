// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product'; // Product.id est string
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';
  isDeleting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ProductDetailComponent: ngOnInit appelé.');
    const productIdParam = this.route.snapshot.paramMap.get('id'); // Récupère l'ID comme string (ou null)
    console.log('ProductDetailComponent: productIdParam de l URL:', productIdParam);

    if (productIdParam) { // productIdParam est déjà une string (ou null)
      this.isLoading = true;
      this.errorMessage = '';
      console.log('ProductDetailComponent: Chargement du produit avec ID:', productIdParam);

      this.productService.getProductById(productIdParam).subscribe({ // Passe la string directement
        next: (data) => {
          this.product = data;
          this.isLoading = false;
          console.log('ProductDetailComponent: Produit chargé:', this.product);
          if (!this.product) {
            console.warn('ProductDetailComponent: Produit non trouvé par le service (données undefined).');
            this.errorMessage = "Le produit demandé n'a pas été trouvé par le service.";
          }
        },
        error: (err) => {
          this.errorMessage = err.message || `Impossible de charger le produit avec l'id ${productIdParam}.`;
          this.isLoading = false;
          console.error('ProductDetailComponent: Erreur lors du chargement du produit:', err);
        },
        complete: () => {
            console.log('ProductDetailComponent: Observable getProductById complété.');
        }
      });
    } else {
      this.errorMessage = "ID du produit manquant dans l'URL.";
      this.isLoading = false;
      console.error('ProductDetailComponent: ID du produit manquant dans l URL.');
      this.router.navigate(['/products']); // Rediriger si pas d'ID
    }
  }

  onDeleteProduct(): void {
    if (this.product && this.product.id) { // product.id est maintenant une string
      if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${this.product.name}" ?`)) {
        this.isDeleting = true;
        this.productService.deleteProduct(this.product.id).subscribe({ // product.id est une string
          next: () => {
            console.log(`Produit ${this.product?.name} supprimé avec succès.`);
            this.isDeleting = false;
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors de la suppression du produit.';
            this.isDeleting = false;
            console.error(err);
          }
        });
      }
    }
  }
}