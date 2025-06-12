// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './auth/login/login.component';
import { CartComponent } from './components/cart/cart.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard'; // <--- IMPORTER adminGuard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [authGuard] // Accessible à tous les utilisateurs connectés
  },
  {
    path: 'product/new',
    component: ProductFormComponent,
    canActivate: [authGuard, adminGuard] // Seul un admin connecté peut ajouter
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    canActivate: [authGuard] // Accessible à tous les utilisateurs connectés
  },
  {
    path: 'product/:id/edit',
    component: ProductFormComponent,
    canActivate: [authGuard, adminGuard] // Seul un admin connecté peut modifier
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard] // Accessible à tous les utilisateurs connectés
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products' } // Ou '/login' si non connecté par défaut
];