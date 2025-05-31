// src/app/components/product-form/product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product'; // Product.id est string
import { ProductService } from '../../services/product.service';

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
  productIdToEdit: string | null = null; // CHANGEMENT ICI: number | null -> string | null
  isLoading: boolean = true;
  pageTitle: string = 'Chargement...';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // id est une string ou null
      if (id) {
        this.isEditMode = true;
        this.productIdToEdit = id; // Assigner la string directement
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

  loadProductDataForEdit(id: string): void { // CHANGEMENT ICI: id: number -> id: string
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({ // id est une string
      next: (product) => {
        if (product) {
          this.productForm.patchValue(product);
        } else {
          console.error('Produit non trouvé pour modification ! ID:', id);
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
      },
      error: (err) => {
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
      return;
    }

    this.isLoading = true;
    const formValues = this.productForm.value;

    if (this.isEditMode && this.productIdToEdit !== null) { // productIdToEdit est une string
      const productToUpdate: Product = {
        id: this.productIdToEdit, // C'est une string
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
          this.router.navigate(['/product', this.productIdToEdit]); // productIdToEdit est une string
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour', err);
          this.isLoading = false;
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
        next: (newProduct) => { // newProduct.id sera une string
          this.isLoading = false;
          if (newProduct && newProduct.id) {
            this.router.navigate(['/product', newProduct.id]); // newProduct.id est une string
          } else {
            console.error('Formulaire: ID du nouveau produit manquant après ajout ! Redirection vers la liste.');
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          console.error('Erreur lors de ajout', err);
          this.isLoading = false;
        }
      });
    }
  }
}