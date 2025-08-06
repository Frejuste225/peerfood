<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import Search from './ui/Search.vue';
import Button from './ui/Button.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const searchQuery = ref('');
const showMobileMenu = ref(false);

const props = defineProps({});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const cartItemCount = computed(() => cartStore.itemCount);
const showNavbar = computed(() => !["/login", "/register"].includes(route.path));

const emit = defineEmits(['search', 'toggle-cart']);

const handleSearch = () => {
  emit('search', searchQuery.value);
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
</script>

<template>
  <nav v-if="showNavbar" class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <img src="../assets/logo.png" alt="PeerFood" class="navbar-logo" />
          <span class="brand-text">PeerFood</span>
        </router-link>
      </div>
      
      <div class="navbar-search">
        <Search
          v-model="searchQuery"
          placeholder="Rechercher un plat..."
          @search="handleSearch"
          :clearable="true"
        />
      </div>
      
      <div class="navbar-actions">
        <button 
          class="cart-button"
          @click="cartStore.toggleCart()"
          :aria-label="`Panier (${cartItemCount} articles)`"
        >
          <div class="cart-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span v-if="cartItemCount > 0" class="cart-count">{{ cartItemCount }}</span>
          </div>
        </button>
        
        <div v-if="isAuthenticated" class="user-menu">
          <div class="user-avatar" @click="toggleMobileMenu">
            <span>{{ authStore.user?.firstname?.charAt(0) || 'U' }}</span>
          </div>
          <div :class="['user-dropdown', { 'user-dropdown--open': showMobileMenu }]">
            <router-link to="/profile" class="dropdown-item" @click="showMobileMenu = false">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Mon profil
            </router-link>
            <router-link to="/orders" class="dropdown-item" @click="showMobileMenu = false">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Mes commandes
            </router-link>
            <button @click="handleLogout" class="dropdown-item dropdown-item--danger">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
        
        <div v-else class="auth-buttons">
          <Button
            variant="outline-primary"
            size="medium"
            @click="router.push('/login')"
          >
            Se connecter
          </Button>
        </div>
        
        <button 
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
          :aria-label="showMobileMenu ? 'Fermer le menu' : 'Ouvrir le menu'"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: var(--shadow-sm);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gray-200);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  height: 72px;
}

.navbar-brand {
  flex: 0 0 auto;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform var(--transition-fast) var(--transition-timing);
}

.brand-link:hover {
  transform: scale(1.05);
}

.navbar-logo {
  height: 40px;
  width: auto;
}

.brand-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--orange-500);
  letter-spacing: -0.025em;
}

.navbar-search {
  flex: 1;
  max-width: 500px;
  margin: 0 var(--spacing-lg);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.cart-button {
  padding: var(--spacing-sm);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast) var(--transition-timing);
  position: relative;
}

.cart-button:hover {
  background-color: var(--gray-100);
  transform: scale(1.05);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--gray-600);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--orange-500);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 0.125rem 0.375rem;
  border-radius: var(--border-radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  background: linear-gradient(135deg, var(--orange-400), var(--orange-500));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
  box-shadow: var(--shadow-sm);
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--gray-200);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast) var(--transition-timing);
  z-index: var(--z-dropdown);
}

.user-dropdown--open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--gray-700);
  text-decoration: none;
  transition: all var(--transition-fast) var(--transition-timing);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background-color: var(--gray-50);
  color: white;
}

.dropdown-item--danger:hover {
  background-color: var(--red-50);
  color: var(--red-600);
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast) var(--transition-timing);
}

.mobile-menu-toggle:hover {
  background-color: var(--gray-100);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background-color: var(--gray-600);
  transition: all var(--transition-fast) var(--transition-timing);
}

.auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 1024px) {
  .navbar-search {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 1rem;
  }
  
  .navbar-search {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .auth-buttons {
    display: none;
  }
  
  .user-dropdown {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    border-radius: 0;
    box-shadow: var(--shadow-lg);
  }
}

@media (max-width: 640px) {
  .brand-text {
    display: none;
  }
  
  .navbar-logo {
    height: 32px;
  }
  
  .cart-button {
    padding: var(--spacing-xs);
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-sm);
  }
}

/* Animation pour le menu mobile */
@media (max-width: 768px) {
  .mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  
  .mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
}

/* Overlay pour fermer le menu mobile */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast) var(--transition-timing);
}

.mobile-overlay--open {
  opacity: 1;
  visibility: visible;
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .navbar *,
  .navbar *::before,
  .navbar *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mode sombre (préparation) */
@media (prefers-color-scheme: dark) {
  .navbar {
    background-color: var(--gray-900);
    border-bottom-color: var(--gray-700);
  }
  
  .brand-text {
    color: var(--orange-400);
  }
  
  .cart-icon-wrapper {
    color: var(--gray-300);
  }
  
  .user-dropdown {
    background-color: var(--gray-800);
    border-color: var(--gray-700);
  }
  
  .dropdown-item {
    color: var(--gray-200);
  }
  
  .dropdown-item:hover {
    background-color: var(--gray-700);
  color: white;
  }
}
</style>