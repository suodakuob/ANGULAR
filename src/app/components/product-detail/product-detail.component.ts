// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf, *ngFor, etc.
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Pour la navigation et les paramètres
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { CartService } from '../../services/cart.service';
import { StockStatusPipe } from '../../pipes/stock-status.pipe'; // Utilisé dans le template
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component'; // Utilisé dans le template
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Pour routerLink
    FormsModule,    // Pour [(ngModel)]
    StockStatusPipe,
    ConfirmationModalComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';
  isDeleting: boolean = false;
  quantityToAdd: number = 1;

  showDeleteConfirmationModal: boolean = false;
  productToDeleteFromDetail: Product | null = null;

  isAdmin$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get('id');
    if (productIdParam) {
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.getProductById(productIdParam).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
          if (!this.product) {
            this.errorMessage = "Le produit demandé n'a pas été trouvé.";
            this.notificationService.showError(this.errorMessage);
          }
        },
        error: (err) => {
          this.errorMessage = err.message || `Impossible de charger le produit avec l'id ${productIdParam}.`;
          this.isLoading = false;
          this.notificationService.showError(this.errorMessage);
          console.error(err);
        }
      });
    } else {
      this.errorMessage = "ID du produit manquant dans l'URL.";
      this.isLoading = false;
      this.notificationService.showError(this.errorMessage);
      this.router.navigate(['/products']);
    }
  }

  triggerDeleteConfirmation(): void {
    if (this.product) {
      this.productToDeleteFromDetail = this.product;
      this.showDeleteConfirmationModal = true;
    }
  }

  handleDeleteConfirmation(confirmed: boolean): void {
    if (confirmed && this.productToDeleteFromDetail && this.productToDeleteFromDetail.id) {
      this.isDeleting = true;
      this.productService.deleteProduct(this.productToDeleteFromDetail.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Produit "${this.productToDeleteFromDetail?.name}" supprimé.`);
          this.isDeleting = false;
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.notificationService.showError(`Erreur suppression : ${err.message}`);
          this.isDeleting = false;
          console.error(err);
        }
      });
    }
    this.showDeleteConfirmationModal = false;
    this.productToDeleteFromDetail = null;
  }

  addToCartFromDetail(): void {
    if (this.product) {
      if (this.quantityToAdd <= 0) {
        this.notificationService.showWarning("La quantité doit être supérieure à zéro.");
        return;
      }
      this.cartService.addToCart(this.product, this.quantityToAdd);
    }
  }

  increaseQuantity(): void {
    if (this.product && (this.product.stock === undefined || this.product.stock === null || this.quantityToAdd < this.product.stock)) {
      this.quantityToAdd++;
    } else if (this.product) {
        this.notificationService.showWarning(`Stock maximum atteint pour ${this.product.name}`);
    }
  }

  decreaseQuantity(): void {
    if (this.quantityToAdd > 1) {
      this.quantityToAdd--;
    }
  }
}