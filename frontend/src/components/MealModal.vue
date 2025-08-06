<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  meal: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
      
          <div class="meal-details">
            <div class="meal-image-container">
              <img :src="meal.imagePath" :alt="meal.designation" class="meal-image">
              <div class="meal-badges">
                <span v-if="meal.availability === 0" class="badge badge--unavailable">
                  Non disponible
                </span>
                <span v-if="meal.isPopular" class="badge badge--popular">
                  Populaire
                </span>
              </div>
            </div>
        
            <div class="meal-info">
              <div class="meal-header">
                <h2 class="meal-title">{{ meal.designation }}</h2>
                <div class="meal-price">{{ formatPrice(meal.price) }}</div>
              </div>
              
              <p class="meal-description">{{ meal.description }}</p>
              
              <div class="meal-meta">
                <div class="meta-item">
                  <span class="meta-label">Catégorie:</span>
                  <span class="meta-value">{{ getCategoryName(meal.category) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Disponibilité:</span>
                  <span :class="['meta-value', meal.availability ? 'text-success' : 'text-danger']">
                    {{ meal.availability ? 'Disponible' : 'Non disponible' }}
                  </span>
                </div>
              </div>
              
              <div class="modal-actions">
                <Button
                  @click="addToCart"
                  variant="primary"
                  size="large"
                  :disabled="meal.availability === 0"
                  full-width
                >
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </template>
                  {{ meal.availability === 0 ? 'Non disponible' : 'Ajouter au panier' }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { useCartStore } from '@/stores/cart'
import { globalNotifications } from '@/composables/useNotifications'
import Button from './ui/Button.vue'

export default {
  name: 'MealModal',
  components: {
    Button
  },
  setup(props, { emit }) {
    const cartStore = useCartStore()
    
    const categories = [
      { id: 'all', name: 'Tous les plats' },
      { id: 'main', name: 'Plats principaux' },
      { id: 'dessert', name: 'Desserts' },
      { id: 'drink', name: 'Boissons' },
      { id: 'starter', name: 'Entrées' }
    ]
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF'
      }).format(price)
    }
    
    const getCategoryName = (categoryId) => {
      return categories.find(c => c.id === categoryId)?.name || 'Non catégorisé'
    }
    
    const addToCart = () => {
      if (props.meal.availability === 0) {
        globalNotifications.warning('Ce plat n\'est pas disponible actuellement')
        return
      }
      
      cartStore.addItem(props.meal)
      globalNotifications.success(`${props.meal.designation} ajouté au panier`)
      emit('close')
    }
    
    return {
      formatPrice,
      getCategoryName,
      addToCart
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--white);
  border-radius: var(--border-radius-2xl);
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--gray-200);
}

.modal-close {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all var(--transition-fast) var(--transition-timing);
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.modal-close:hover {
  background: var(--gray-100);
  color: var(--gray-700);
  transform: scale(1.1);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.meal-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
}

.meal-image-container {
  position: relative;
  background: var(--gray-100);
}

.meal-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  min-height: 400px;
}

.meal-badges {
  position: absolute;
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--unavailable {
  background-color: var(--red-500);
  color: white;
}

.badge--popular {
  background-color: var(--yellow-400);
  color: var(--yellow-900);
}

.meal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meal-info {
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.meal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--gray-900);
  line-height: var(--line-height-tight);
  margin: 0;
}

.meal-price {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--orange-600);
  white-space: nowrap;
}

.meal-description {
  color: var(--gray-600);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
  margin: 0;
}

.meal-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--gray-50);
  border-radius: var(--border-radius-lg);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  font-weight: var(--font-weight-medium);
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--gray-900);
  font-weight: var(--font-weight-semibold);
}

.text-success {
  color: var(--green-600) !important;
}

.text-danger {
  color: var(--red-600) !important;
}

.modal-actions {
  margin-top: auto;
}

.meal-info h2 {
  color: var(--gray-500);
  margin-bottom: var(--spacing-md);
  font-size: 1.5rem;
}

.description {
  color: var(--gray-400);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.price {
  font-size: 1.2rem;
  color: var(--primary);
  font-weight: 600;
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

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
  
  .meal-details {
    grid-template-columns: 1fr;
    flex: 1;
    min-height: auto;
  }
  
  .meal-image-container {
    height: 250px;
  }
  
  .meal-image {
    min-height: 250px;
  }
  
  .meal-info {
    padding: var(--spacing-xl);
    flex: 1;
  }
  
  .meal-title {
    font-size: var(--font-size-xl);
  }
  
  .meal-price {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 640px) {
  .meal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .meal-info {
    padding: var(--spacing-lg);
  }
  
  .modal-close {
    top: var(--spacing-md);
    right: var(--spacing-md);
    width: 36px;
    height: 36px;
  }
}

/* Animation d'entrée personnalisée */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content {
  animation: modalSlideIn 0.4s var(--transition-timing);
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .modal-content {
    animation: none;
  }
  
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .modal-enter-from .modal-content,
  .modal-leave-to .modal-content {
    transform: none;
  }
}
</style>