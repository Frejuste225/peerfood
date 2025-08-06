<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import { useRoute } from 'vue-router'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const isInitializing = ref(true)
const initError = ref(null)

onMounted(async () => {
  // Initialiser l'authentification au démarrage de l'application
  try {
    isInitializing.value = true
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
    initError.value = 'Erreur lors de l\'initialisation de l\'application'
  } finally {
    isInitializing.value = false
  }
})

const handleSearch = (query) => {
  searchQuery.value = query
}

const handleToggleCart = () => {
  cartStore.toggleCart()
}
</script>

<template>
  <div class="app-container">
    <!-- Loading initial de l'application -->
    <div v-if="isInitializing" class="app-loading">
      <LoadingSpinner size="large" message="Initialisation de l'application..." full-screen />
    </div>
    
    <!-- Erreur d'initialisation -->
    <div v-else-if="initError" class="app-error">
      <div class="error-content">
        <h1>Erreur d'initialisation</h1>
        <p>{{ initError }}</p>
        <button @click="window.location.reload()" class="retry-button">
          Recharger la page
        </button>
      </div>
    </div>
    
    <!-- Application normale -->
    <ErrorBoundary>
      <NavBar
        :cart-item-count="cartStore.itemCount"
        @search="handleSearch"
        @toggle-cart="handleToggleCart"
      />
      
      <main :class="['main-content', { 'main-content--with-navbar': !['/login', '/register'].includes(route.path) }]">
        <RouterView />
      </main>
      
      <!-- Container pour les notifications globales -->
      <NotificationContainer />
      
      <!-- Overlay pour le panier mobile -->
      <Transition name="overlay">
        <div 
          v-if="cartStore.showCart" 
          class="cart-overlay"
          @click="cartStore.toggleCart()"
        />
      </Transition>
    </ErrorBoundary>
  </div>
</template>

<style>
/* Reset CSS de base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: var(--line-height-normal);
  color: var(--gray-700);
  background-color: var(--gray-50);
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-loading {
  position: fixed;
  inset: 0;
  background: white;
  z-index: var(--z-modal);
}

.app-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--gray-50);
}

.error-content {
  text-align: center;
  background: white;
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
}

.error-content h1 {
  color: var(--red-600);
  margin-bottom: var(--spacing-md);
}

.error-content p {
  color: var(--gray-600);
  margin-bottom: var(--spacing-lg);
}

.retry-button {
  background: var(--orange-500);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast) var(--transition-timing);
}

.retry-button:hover {
  background: var(--orange-600);
  transform: translateY(-1px);
}

.main-content {
  flex: 1;
  min-height: 100vh;
}

.main-content--with-navbar {
  margin-top: 72px;
  min-height: calc(100vh - 72px);
}

.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: calc(var(--z-modal) - 1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

@media (max-width: 768px) {
  .main-content--with-navbar {
    margin-top: 60px; /* Hauteur réduite sur mobile */
    min-height: calc(100vh - 60px);
  }
}

/* Styles globaux pour les composants */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal) var(--transition-timing);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-normal) var(--transition-timing);
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--transition-fast) var(--transition-timing);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mode sombre (préparation) */
@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--gray-900);
    color: var(--gray-100);
  }
}
</style>
