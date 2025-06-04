// src/app/components/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms'; // FormsModule n'est pas utilisé si searchControl est Reactive
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, startWith } from 'rxjs/operators'; // Ajout de startWith

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { StockStatusPipe } from '../../pipes/stock-status.pipe'; // Utilisé dans le template
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe'; // Utilisé dans le template
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component'; // Utilisé dans le template

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Garder ReactiveFormsModule pour FormControl
    StockStatusPipe,     // Doit être utilisé dans le template pour ne pas avoir d'avertissement
    TruncateTextPipe,    // Doit être utilisé dans le template
    ConfirmationModalComponent // Doit être utilisé dans le template
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  productsToDisplay: Product[] = []; // Ce qui est affiché après tri/filtre/pagination
  allProductsMaster: Product[] = []; // La liste complète venant du service
  isLoading: boolean = true;
  errorMessage: string = ''; // Pour les erreurs de chargement

  // Recherche
  searchControl = new FormControl('');
  private searchTermSub!: Subscription;

  // Tri
  currentSortProperty: keyof Product | '' = ''; // '' ou une clé de Product
  currentSortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8; // Nombre de produits par page
  totalPages: number = 0;
  pages: number[] = [];

  // Pour la modale de confirmation
  showDeleteConfirmationModal: boolean = false;
  productToDelete: Product | null = null;


  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();

    this.searchTermSub = this.searchControl.valueChanges.pipe(
      startWith(''), // Pour appliquer le filtre initial (ou aucun filtre)
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => console.log('Terme de recherche:', term))
    ).subscribe(term => {
      this.currentPage = 1; // Réinitialiser à la première page lors d'une nouvelle recherche
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
        this.applyFiltersAndSort(); // Appliquer les filtres/tris/pagination initiaux
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

    // Filtrage
    if (searchTerm) {
      filteredProducts = this.allProductsMaster.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }

    // Tri
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

    // Pagination
    this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.productsToDisplay = filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);

    console.log('Produits à afficher (après filtre/tri/pagination):', this.productsToDisplay);
    if (this.productsToDisplay.length === 0 && this.allProductsMaster.length > 0 && searchTerm) {
        // Tu peux mettre un message spécifique si la recherche ne donne rien
    }
  }

  setSort(property: keyof Product | ''): void {
    if (this.currentSortProperty === property) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortProperty = property;
      this.currentSortDirection = 'asc';
    }
    this.currentPage = 1; // Réinitialiser à la première page lors d'un nouveau tri
    this.applyFiltersAndSort();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id; // Utiliser un ID unique pour *ngFor trackBy
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
          this.loadProducts(); // Recharge tous les produits et réapplique les filtres/tris
        },
        error: (err) => {
          this.notificationService.showError(`Erreur suppression : ${err.message}`);
        }
      });
    }
    this.showDeleteConfirmationModal = false;
    this.productToDelete = null;
  }
}