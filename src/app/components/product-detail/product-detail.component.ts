// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { StockStatusPipe } from '../../pipes/stock-status.pipe'; // Importé
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component'; // Importé

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StockStatusPipe, // Doit être utilisé dans le template pour que l'avertissement disparaisse
    ConfirmationModalComponent // Doit être utilisé dans le template
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';
  isDeleting: boolean = false;

  showDeleteConfirmationModal: boolean = false;      // Déclaré
  productToDeleteFromDetail: Product | null = null; // Déclaré

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get('id');
    if (productIdParam) {
      const productId = productIdParam;
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.getProductById(productId).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
          if (!this.product) {
            this.errorMessage = "Le produit demandé n'a pas été trouvé par le service.";
            // this.notificationService.showError(this.errorMessage); // Peut-être redondant si le template l'affiche déjà
          }
        },
        error: (err) => {
          this.errorMessage = err.message || `Impossible de charger le produit avec l'id ${productId}.`;
          this.isLoading = false;
          // this.notificationService.showError(this.errorMessage); // Peut-être redondant
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
}