// src/app/components/product-form/product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

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
  originalProductDataForEdit: Partial<Product> | null = null; // Pour stocker les données originales en mode édition

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
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
        this.productForm.reset(); // Assurer que le formulaire est vide en mode ajout
        this.originalProductDataForEdit = null; // Pas de données originales en mode ajout
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
          // Stocker les données originales avant de patcher le formulaire
          this.originalProductDataForEdit = {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            stock: product.stock
          };
          this.productForm.patchValue(this.originalProductDataForEdit);
        } else {
          this.notificationService.showError(`Produit avec ID ${id} non trouvé.`);
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError(`Erreur chargement produit: ${err.message}`);
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
      this.notificationService.showWarning('Veuillez corriger les erreurs du formulaire.');
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
          this.notificationService.showSuccess('Produit mis à jour avec succès !');
          this.router.navigate(['/product', this.productIdToEdit]);
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(`Erreur lors de la mise à jour: ${err.message}`);
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
          this.notificationService.showSuccess('Produit ajouté avec succès !');
          if (newProduct && newProduct.id) {
            this.router.navigate(['/product', newProduct.id]);
          } else {
            this.notificationService.showError("Erreur: L'ID du nouveau produit n'a pas été retourné.");
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(`Erreur lors de l'ajout: ${err.message}`);
        }
      });
    }
  }

  // NOUVELLE MÉTHODE POUR RÉINITIALISER LE FORMULAIRE
  onResetForm(): void {
    if (this.isEditMode && this.originalProductDataForEdit) {
      // Si en mode édition, réinitialiser avec les données originales du produit
      this.productForm.reset(this.originalProductDataForEdit);
      this.notificationService.showInfo("Champs réinitialisés aux valeurs d'origine.");
    } else {
      // Si en mode ajout, réinitialiser à un formulaire vide
      this.productForm.reset();
      // Tu peux aussi explicitement remettre des valeurs par défaut si besoin:
      // this.productForm.reset({
      //   name: '',
      //   description: '',
      //   price: null,
      //   imageUrl: '',
      //   category: '',
      //   stock: null
      // });
      this.notificationService.showInfo("Formulaire vidé.");
    }
    // Optionnel: Si tu veux aussi "nettoyer" l'état "touched" des champs pour cacher les erreurs de validation
    // Object.keys(this.productForm.controls).forEach(key => {
    //   this.productForm.get(key)?.markAsUntouched();
    //   this.productForm.get(key)?.markAsPristine();
    // });
  }
}