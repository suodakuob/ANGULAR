// src/app/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { StockStatusPipe } from '../../pipes/stock-status.pipe';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
  filteredAndSortedProducts: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  searchControl = new FormControl('');
  private searchTermSub!: Subscription;
  currentSortProperty: keyof Product | '' = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  showDeleteConfirmationModal: boolean = false;
  // modalMessage: string = ''; // SUPPRIMÉ
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.searchTermSub = this.searchControl.valueChanges.pipe(
      tap(term => console.log('Terme de recherche:', term)),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.currentPage = 1;
      this.applyFiltersSortAndPagination();
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
        this.currentPage = 1;
        this.applyFiltersSortAndPagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Impossible de charger les produits.';
        this.notificationService.showError(this.errorMessage);
      }
    });
  }

  filterProducts(searchTerm: string): Product[] {
    const lowerCaseTerm = searchTerm.toLowerCase();
    if (!lowerCaseTerm) return [...this.allProductsMaster];
    return this.allProductsMaster.filter(p => p.name.toLowerCase().includes(lowerCaseTerm) || (p.category && p.category.toLowerCase().includes(lowerCaseTerm)) || (p.description && p.description.toLowerCase().includes(lowerCaseTerm)));
  }

  setSort(property: keyof Product): void {
    if (this.currentSortProperty === property) this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    else { this.currentSortProperty = property; this.currentSortDirection = 'asc'; }
    this.currentPage = 1;
    this.applyFiltersSortAndPagination();
  }

  applyFiltersSortAndPagination(): void {
    let processedProducts = this.filterProducts(this.searchControl.value || '');
    if (this.currentSortProperty) {
      const sortKey = this.currentSortProperty as keyof Product;
      processedProducts.sort((a, b) => {
        const valA = a[sortKey]; const valB = b[sortKey];
        if ((valA === undefined || valA === null) && (valB === undefined || valB === null)) return 0;
        if (valA === undefined || valA === null) return this.currentSortDirection === 'asc' ? 1 : -1;
        if (valB === undefined || valB === null) return this.currentSortDirection === 'asc' ? -1 : 1;
        let comp = 0; if (typeof valA === 'string' && typeof valB === 'string') comp = valA.localeCompare(valB);
        else if (typeof valA === 'number' && typeof valB === 'number') comp = valA - valB;
        return this.currentSortDirection === 'asc' ? comp : comp * -1;
      });
    }
    this.filteredAndSortedProducts = processedProducts;
    this.totalPages = Math.ceil(this.filteredAndSortedProducts.length / this.itemsPerPage);
    if (this.totalPages > 0 && this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    else if (this.totalPages === 0) this.currentPage = 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.productsToDisplay = this.filteredAndSortedProducts.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
     if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.applyFiltersSortAndPagination(); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }
  }
  get pages(): number[] { const arr = []; for (let i = 1; i <= this.totalPages; i++) arr.push(i); return arr; }
  trackByProductId(index: number, product: Product): string { return product.id; }

 triggerDeleteConfirmationFromList(product: Product): void {
   this.productToDelete = product; // Toujours utile pour le message projeté
   this.showDeleteConfirmationModal = true;
 }

 handleDeleteConfirmationFromList(confirmed: boolean): void {
   this.showDeleteConfirmationModal = false;
   if (confirmed && this.productToDelete) {
     const productName = this.productToDelete.name;
     const productId = this.productToDelete.id;
     this.productService.deleteProduct(productId).subscribe({
       next: () => {
         this.notificationService.showSuccess(`Produit "${productName}" supprimé.`);
         if (this.productsToDisplay.length === 1 && this.currentPage > 1) {
           this.currentPage--;
         }
         this.loadProducts();
       },
       error: (err) => {
         this.notificationService.showError(`Erreur suppression de "${productName}": ${err.message}`);
       }
     });
   }
   this.productToDelete = null;
 }
}