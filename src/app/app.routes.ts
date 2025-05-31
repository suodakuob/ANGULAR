// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component'; // Importe le composant

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'product/new', component: ProductFormComponent },         // Route pour ajouter
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'product/:id/edit', component: ProductFormComponent }, // Route pour modifier
  { path: '', redirectTo: '/products', pathMatch: 'full' },
];