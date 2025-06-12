// src/app/components/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service'; // Pas besoin d'importer CartItem ici
import { CartItem } from '../../models/cart-item'; // <--- CORRECTION: Importer depuis models
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  totalPrice: number = 0;
  private cartSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService // Injecté mais pas utilisé ici, peut être enlevé si pas d'appels directs
    ) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartItems$.subscribe(items => {
      this.totalPrice = this.cartService.getTotalPrice();
    });
    // S'assurer que le total est calculé au chargement initial
    this.totalPrice = this.cartService.getTotalPrice();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  // Pour l'input de type number qui émet un (change) event
  updateQuantityFromInput(productId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let quantity = parseInt(inputElement.value, 10);

    if (isNaN(quantity) || quantity < 0) {
        quantity = 1; // Ou récupérer la valeur précédente
        const item = this.cartService['cartItems'].find(i => i.product.id === productId);
        if(item) inputElement.value = item.quantity.toString();
        this.notificationService.showWarning("La quantité doit être un nombre positif."); // Utilisation de NotificationService ici
        return;
    }
    this.cartService.updateQuantity(productId, quantity);
  }

  // Pour les boutons +/- qui envoient directement la nouvelle quantité
  updateQuantityFromButton(productId: string, newQuantity: number): void {
    if (newQuantity < 0) { // Ne devrait pas arriver avec les disabled mais sécurité
        this.notificationService.showWarning("La quantité ne peut pas être négative.");
        return;
    }
    this.cartService.updateQuantity(productId, newQuantity);
  }


  clearCart(): void {
    if (confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    this.notificationService.showSuccess("Commande passée avec succès ! (Simulation)");
    this.cartService.clearCart();
  }

  trackByProductIdInCart(index: number, item: CartItem): string {
    return item.product.id;
  }
}