// src/app/components/product-form/product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service'; // IMPORTÉ

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode: boolean = false;
  productIdToEdit: string | null = null;
  isLoading: boolean = true;
  pageTitle: string = 'Chargement...';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService // INJECTÉ
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productIdToEdit = id;
        this.pageTitle = 'Modifier le produit';
        this.loadProductDataForEdit(this.productIdToEdit);
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Ajouter un nouveau produit';
        this.isLoading = false;
      }
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      imageUrl: ['', [Validators.pattern('https?://.+')]],
      category: [''],
      stock: [null, [Validators.min(0)]]
    });
  }

  loadProductDataForEdit(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue(product);
        } else {
          this.notificationService.show(`Produit avec ID ${id} non trouvé.`, 'error');
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.show(`Erreur chargement produit: ${err.message}`, 'error');
        console.error('Erreur lors du chargement du produit pour édition', err);
        this.router.navigate(['/products']);
        this.isLoading = false;
      }
    });
  }

  get f() { return this.productForm.controls; }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notificationService.show('Veuillez corriger les erreurs du formulaire.', 'warning');
      return;
    }

    this.isLoading = true;
    const formValues = this.productForm.value;

    if (this.isEditMode && this.productIdToEdit !== null) {
      const productToUpdate: Product = {
        id: this.productIdToEdit,
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        imageUrl: formValues.imageUrl || undefined,
        category: formValues.category || undefined,
        stock: (formValues.stock !== null && formValues.stock !== undefined) ? formValues.stock : undefined,
      };
      this.productService.updateProduct(productToUpdate).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.show('Produit mis à jour avec succès !', 'success');
          this.router.navigate(['/product', this.productIdToEdit]);
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.show(`Erreur lors de la mise à jour: ${err.message}`, 'error');
          console.error('Erreur lors de la mise à jour', err);
        }
      });
    } else {
      const productToAdd: Omit<Product, 'id'> = {
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        imageUrl: formValues.imageUrl || undefined,
        category: formValues.category || undefined,
        stock: (formValues.stock !== null && formValues.stock !== undefined) ? formValues.stock : undefined,
      };
      this.productService.addProduct(productToAdd).subscribe({
        next: (newProduct) => {
          this.isLoading = false;
          this.notificationService.show('Produit ajouté avec succès !', 'success');
          if (newProduct && newProduct.id) {
            this.router.navigate(['/product', newProduct.id]);
          } else {
            this.notificationService.show("Erreur: L'ID du nouveau produit n'a pas été retourné.", "error");
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.show(`Erreur lors de l'ajout: ${err.message}`, 'error');
          console.error('Erreur lors de ajout', err);
        }
      });
    }
  }
}