// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product } from '../models/product'; // S'assure que Product.id est bien string ici

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(data => console.log('Service: Produits récupérés', data)),
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product | undefined> { // CHANGEMENT ICI: id: number -> id: string
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Product>(url).pipe(
      tap(data => console.log('Service: Produit récupéré par ID', data)),
      catchError(this.handleError)
    );
  }

  addProduct(productData: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData).pipe(
      tap(newProduct => console.log('Service: Produit ajouté, réponse API:', newProduct)), // newProduct.id sera une string
      catchError(this.handleError)
    );
  }

  updateProduct(updatedProduct: Product): Observable<Product | null> { // updatedProduct.id sera une string
    const url = `${this.apiUrl}/${updatedProduct.id}`;
    return this.http.put<Product>(url, updatedProduct).pipe(
      tap(() => console.log('Service: Produit mis à jour', updatedProduct)),
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<{}> { // CHANGEMENT ICI: id: number -> id: string
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<{}>(url).pipe(
      tap(() => console.log(`Service: Produit avec ID=${id} supprimé`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue !';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur serveur : ${error.status}, message : ${error.message}`;
    }
    console.error('Erreur dans ProductService handleError:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}