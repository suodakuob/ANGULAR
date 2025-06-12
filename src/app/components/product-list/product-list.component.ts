// src/app/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, startWith, map } from 'rxjs/operators';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service'; // <--- IMPORTER
import { StockStatusPipe } from '../../pipes/stock-status.pipe';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    StockStatusPipe,
    TruncateTextPipe,
    ConfirmationModalComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  productsToDisplay: Product[] = [];
  allProductsMaster: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  searchControl = new FormControl('');
  private searchTermSub!: Subscription;

  currentSortProperty: keyof Product | '' = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  pages: number[] = [];

  showDeleteConfirmationModal: boolean = false;
  productToDelete: Product | null = null;

  isAdmin$: Observable<boolean>; // <--- DÉCLARER

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private cartService: CartService,
    private authService: AuthService // <--- INJECTER
  ) {
    this.isAdmin$ = this.authService.isAdmin$; // <--- INITIALISER
  }

  // ... (le reste du code de ProductListComponent reste le même que dans la version précédente que tu as) ...
  // (ngOnInit, ngOnDestroy, loadProducts, applyFiltersAndSort, setSort, goToPage, trackBy, delete methods, addToCart)

  ngOnInit(): void {
    this.loadProducts();
    this.searchTermSub = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => console.log('Terme de recherche:', term))
    ).subscribe(term => {
      this.currentPage = 1;
      this.applyFiltersAndSort();
    });
  }

  ngOnDestroy(): void {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProductsMaster = data;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Impossible de charger les produits.';
        this.notificationService.showError(this.errorMessage);
        console.error(err);
      }
    });
  }

  applyFiltersAndSort(): void {
    let filteredProducts = [...this.allProductsMaster];
    const searchTerm = this.searchControl.value?.toLowerCase() || '';

    if (searchTerm) {
      filteredProducts = this.allProductsMaster.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    if (this.currentSortProperty) {
      filteredProducts.sort((a, b) => {
        const valA = a[this.currentSortProperty as keyof Product];
        const valB = b[this.currentSortProperty as keyof Product];
        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return this.currentSortDirection === 'asc' ? comparison : comparison * -1;
      });
    }

    this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.productsToDisplay = filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  setSort(property: keyof Product | ''): void {
    if (this.currentSortProperty === property) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortProperty = property;
      this.currentSortDirection = 'asc';
    }
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  triggerDeleteConfirmationFromList(product: Product): void {
    this.productToDelete = product;
    this.showDeleteConfirmationModal = true;
  }

  handleDeleteConfirmationFromList(confirmed: boolean): void {
    if (confirmed && this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Produit "${this.productToDelete?.name}" supprimé.`);
          this.loadProducts();
        },
        error: (err) => {
          this.notificationService.showError(`Erreur suppression : ${err.message}`);
        }
      });
    }
    this.showDeleteConfirmationModal = false;
    this.productToDelete = null;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}