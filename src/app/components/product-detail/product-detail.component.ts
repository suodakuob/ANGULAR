// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { StockStatusPipe } from '../../pipes/stock-status.pipe';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StockStatusPipe,
    ConfirmationModalComponent,
    TruncateTextPipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';
  isDeleting: boolean = false;

  showDeleteConfirmationModal: boolean = false;
  // modalMessage: string = ''; // SUPPRIMÉ, le message est dans le template parent
  productToDeleteName: string = ''; // Gardé pour construire le message dans le template parent

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

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
            this.notificationService.showWarning(this.errorMessage, 5000);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || `Impossible de charger le produit avec l'id ${productIdParam}.`;
          this.notificationService.showError(this.errorMessage);
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = "ID du produit manquant dans l'URL.";
      this.notificationService.showError(this.errorMessage);
      this.router.navigate(['/products']);
    }
  }

  triggerDeleteConfirmation(): void {
    if (this.product) {
      this.productToDeleteName = this.product.name; // Toujours utile pour le message projeté
      this.showDeleteConfirmationModal = true;
    }
  }

  handleDeleteConfirmation(confirmed: boolean): void {
    this.showDeleteConfirmationModal = false;
    if (confirmed && this.product && this.product.id) {
      this.isDeleting = true;
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.isDeleting = false;
          this.notificationService.showSuccess(`Produit "${this.productToDeleteName}" supprimé avec succès.`);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.isDeleting = false;
          const deleteErrorMessage = err.message || `Erreur lors de la suppression du produit "${this.productToDeleteName}".`;
          this.notificationService.showError(deleteErrorMessage);
          this.errorMessage = deleteErrorMessage;
        }
      });
    }
  }
}