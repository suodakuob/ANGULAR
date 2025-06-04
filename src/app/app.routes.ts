// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './auth/login/login.component'; // Importer LoginComponent
import { authGuard } from './auth/auth.guard'; // Importer le garde de route fonctionnel

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [authGuard] // Appliquer le garde ici
  },
  {
    path: 'product/new',
    component: ProductFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'product/:id/edit',
    component: ProductFormComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Ou '/products' si tu préfères une 404 gérée autrement
];