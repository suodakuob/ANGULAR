// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';
import { CartItem } from '../models/cart-item'; // Importe depuis le modèle
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemCount = new BehaviorSubject<number>(0);
  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);

  cartItemCount$: Observable<number> = this.cartItemCount.asObservable();
  cartItems$: Observable<CartItem[]> = this.cartItemsSource.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadCartFromLocalStorage();
  }

  private updateCartState(): void {
    let count = 0;
    this.cartItems.forEach(item => count += item.quantity);
    this.cartItemCount.next(count);
    this.cartItemsSource.next([...this.cartItems]);
    this.saveCartToLocalStorage();
    console.log('Cart updated:', this.cartItems, 'Total items:', count);
  }

  addToCart(product: Product, quantity: number = 1): void {
    if (product.stock === undefined || product.stock === null) {
        this.notificationService.showError(`Information de stock manquante pour "${product.name}".`);
        return;
    }
    if (quantity <= 0) {
        this.notificationService.showWarning("La quantité doit être positive.");
        return;
    }
    if (product.stock < quantity && quantity > 0) {
        this.notificationService.showError(`Stock insuffisant pour "${product.name}". Demandé: ${quantity}, Disponible: ${product.stock}`);
        return;
    }

    const existingItemIndex = this.cartItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
      const newQuantity = this.cartItems[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        this.notificationService.showError(`Impossible d'ajouter plus de "${product.name}". Stock max (${product.stock}) atteint ou dépassé dans le panier.`);
        return;
      }
      this.cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Pour un nouvel ajout, la vérification de stock initiale suffit
      this.cartItems.push({ product, quantity });
    }
    this.updateCartState();
    this.notificationService.showSuccess(`"${product.name}" (${quantity}) ajouté au panier.`);
  }

  removeFromCart(productId: string): void {
    const product = this.cartItems.find(item => item.product.id === productId)?.product;
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCartState();
    if (product) {
        this.notificationService.showInfo(`"${product.name}" retiré du panier.`);
    }
  }

  updateQuantity(productId: string, newQuantity: number): void { // Modifié pour prendre newQuantity directement
    const itemIndex = this.cartItems.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
      const productStock = this.cartItems[itemIndex].product.stock;
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else if (productStock !== undefined && productStock !== null && newQuantity > productStock) {
        this.notificationService.showError(`Stock insuffisant. Max disponible : ${productStock} pour "${this.cartItems[itemIndex].product.name}".`);
        this.cartItems[itemIndex].quantity = productStock;
      } else {
        this.cartItems[itemIndex].quantity = newQuantity;
      }
      this.updateCartState();
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCartState();
    this.notificationService.showInfo('Panier vidé.');
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  private saveCartToLocalStorage(): void {
    localStorage.setItem('myAppCart', JSON.stringify(this.cartItems));
  }

  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem('myAppCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsedCart) && parsedCart.every(item => item.hasOwnProperty('product') && item.hasOwnProperty('quantity'))) {
           this.cartItems = parsedCart;
        } else {
            this.cartItems = [];
            localStorage.removeItem('myAppCart');
        }
      } catch (e) {
        console.error("Erreur lors du chargement du panier depuis localStorage:", e);
        this.cartItems = [];
        localStorage.removeItem('myAppCart');
      }
      this.updateCartState();
    }
  }
}