<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

const props = defineProps({
  cartItems: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['submit-order', 'close']);

const removeItem = (itemId) => {
  cartStore.decreaseItemQuantity(itemId);
  // If cart becomes empty after removing item, close the modal
  if (cartStore.itemCount === 0) {
    emit('close');
  }
};

const cancelOrder = () => {
  cartStore.clearCart();
  emit('close');
};

const submitOrder = () => {
  emit('submit-order', {
    items: props.cartItems,
    total: props.total
  });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div class="order-form-overlay" @click="cancelOrder">
        <div class="order-form" @click.stop>
          <div class="order-form-header">
            <h2>Finaliser ma commande</h2>
            <button @click="cancelOrder" class="close-button" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
      
          <div class="order-form-content">
            <div class="order-summary">
              <h3>Résumé de votre commande</h3>
              <div class="order-items">
                <div v-if="cartItems.length === 0" class="empty-cart-message">
                  <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  <p>Votre panier est vide</p>
                </div>
                <div v-for="item in cartItems" :key="item.id" class="order-item">
                  <div class="item-image">
                    <img :src="item.imagePath" :alt="item.designation">
                  </div>
                  <div class="item-details">
                    <h4 class="item-name">{{ item.designation }}</h4>
                    <div class="item-price-info">
                      <span class="item-price">{{ cartStore.formatPrice(item.price) }}</span>
                      <span class="item-quantity">x {{ item.quantity }}</span>
                    </div>
                    <div class="item-total">{{ cartStore.formatPrice(item.price * item.quantity) }}</div>
                  </div>
                  <button @click="removeItem(item.id)" class="remove-item-button" aria-label="Retirer cet article">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="order-total">
                <div class="total-breakdown">
                  <div class="total-line">
                    <span>Sous-total</span>
                    <span>{{ cartStore.formatPrice(total) }}</span>
                  </div>
                  <div class="total-line">
                    <span>Frais de service</span>
                    <span>Gratuit</span>
                  </div>
                </div>
                <div class="total-final">
                  <span>Total à payer</span>
                  <span class="total-amount">{{ cartStore.formatPrice(total) }}</span>
                </div>
              </div>
            </div>

            <div class="payment-section">
              <h3>Méthode de paiement</h3>
              <div class="payment-methods">
                <div class="payment-method selected">
                  <div class="payment-icon">
                    <img src="https://wave.com/img/wave-logo.png" alt="Wave" style="width: 24px; height: 24px;">
                  </div>
                  <div class="payment-info">
                    <span class="payment-name">Wave</span>
                    <span class="payment-description">Paiement mobile sécurisé</span>
                  </div>
                  <div class="payment-check">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="order-form-footer">
            <div class="form-actions">
              <Button
                @click="cancelOrder"
                variant="secondary"
                size="large"
              >
                Annuler
              </Button>
              <Button
                @click="submitOrder"
                variant="success"
                size="large"
                :disabled="cartItems.length === 0"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <path d="m16 8 2 2-2 2"/>
                    <path d="M11 12H21"/>
                  </svg>
                </template>
                Payer avec Wave
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.order-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.order-form {
  background-color: white;
  border-radius: var(--border-radius-2xl);
  width: 95%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.order-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.order-form-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  color: var(--gray-500);
  transition: all var(--transition-fast) var(--transition-timing);
}

.close-button:hover {
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.order-form-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.order-summary {
  background-color: var(--gray-50);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.order-summary h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.order-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-fast) var(--transition-timing);
}

.order-item:hover {
  box-shadow: var(--shadow-sm);
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.item-price-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-bottom: var(--spacing-xs);
}

.item-total {
  font-weight: var(--font-weight-semibold);
  color: var(--orange-600);
  font-size: var(--font-size-sm);
}

.remove-item-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  color: var(--gray-400);
  transition: all var(--transition-fast) var(--transition-timing);
  flex-shrink: 0;
}

.remove-item-button:hover {
  background-color: var(--red-50);
  color: var(--red-500);
}

.remove-item-button svg {
  width: 16px;
  height: 16px;
}

.empty-cart-message {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray-400);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-md);
  color: var(--gray-300);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.order-total {
  border-top: 1px solid var(--gray-200);
  padding-top: var(--spacing-lg);
}

.total-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--gray-600);
}

.total-final {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius);
  border: 2px solid var(--orange-200);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--gray-900);
}

.total-amount {
  color: var(--orange-600);
}

.payment-section {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--gray-200);
}

.payment-section h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.payment-method {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
}

.payment-method.selected {
  border-color: var(--orange-300);
  background-color: var(--orange-50);
}

.payment-method:hover {
  border-color: var(--orange-200);
  background-color: var(--orange-25);
}

.payment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.payment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.payment-name {
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.payment-description {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
}

.payment-check {
  width: 20px;
  height: 20px;
  color: var(--orange-500);
}

.order-form-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s var(--transition-timing);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .order-form,
.modal-leave-to .order-form {
  transform: scale(0.95) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .order-form {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .order-form-content {
    padding: var(--spacing-lg);
    gap: var(--spacing-xl);
  }
  
  .order-summary,
  .payment-section {
    padding: var(--spacing-lg);
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .item-image {
    width: 100%;
    height: 120px;
  }
  
  .remove-item-button {
    align-self: flex-end;
  }
  
  .total-final {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
}

/* Animation pour les éléments de la liste */
.order-item {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .order-item {
    animation: none;
  }
  
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .modal-enter-from .order-form,
  .modal-leave-to .order-form {
    transform: none;
  }
}

/* États de chargement */
.order-form--loading {
  pointer-events: none;
}

.order-form--loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.remove-item-button {
  background-color: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8em;
  margin-left: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.remove-item-button:hover {
  background-color: var(--danger);
  color: var(--white);
}

.empty-cart-message {
  text-align: center;
  padding: 1rem;
  color: var(--gray-500);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1.1em;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  color: var(--gray-500);
  font-size: 0.9em;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: background-color var(--transition-duration) var(--transition-timing);
}

.cancel-button {
  background-color: var(--gray-200);
  color: var(--gray-500);
}

.item-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.remove-item-button {
  background-color: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8em;
  margin-left: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.remove-item-button:hover {
  background-color: var(--danger);
  color: var(--white);
}

.empty-cart-message {
  text-align: center;
  padding: 1rem;
  color: var(--gray-500);
}

.cancel-button:hover {
  background-color: var(--gray-300);
}

.submit-button {
  background-color: var(--success);
  color: var(--white);
}

.submit-button:hover {
  background-color: var(--green-400);
}

.submit-button:disabled {
  background-color: var(--gray-300);
  cursor: not-allowed;
}
</style>