<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Meal from '../services/meal.js';
import OrderForm from '../components/OrderForm.vue';
import MealModal from '../components/MealModal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import Button from '../components/ui/Button.vue';
import Alert from '../components/ui/Alert.vue';
import checkoutService from '../services/checkout.js';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { globalNotifications } from '../composables/useNotifications';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const meals = ref([]);
const filteredMeals = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showOrderForm = ref(false);
const selectedMeal = ref(null);
const showMealModal = ref(false);
const searchQuery = ref('');

// Nouvelles variables pour les filtres et favoris
const selectedCategory = ref('all');
const favorites = ref([]);
const showFavoritesOnly = ref(false);
const sortBy = ref('name'); // 'name', 'price-asc', 'price-desc', 'popularity'

// Catégories de repas (à adapter selon vos besoins)
const categories = [
  { id: 'all', name: 'Tous les plats' },
  { id: 'main', name: 'Plats principaux' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'drink', name: 'Boissons' },
  { id: 'starter', name: 'Entrées' }
];

const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popularity', label: 'Popularité' }
];

// Chargement des repas et des favoris depuis le localStorage
onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    meals.value = await Meal.getAll();
    
    // Simuler des catégories pour les repas (à remplacer par des données réelles)
    meals.value.forEach((meal, index) => {
      // Assigner des catégories aléatoires pour la démonstration
      const categoryIds = ['main', 'dessert', 'drink', 'starter'];
      meal.category = categoryIds[index % categoryIds.length];
      meal.isFavorite = false;
      meal.popularity = Math.floor(Math.random() * 100); // Simuler la popularité
    });
    
    // Charger les favoris depuis localStorage
    const storedFavorites = localStorage.getItem('mealFavorites');
    if (storedFavorites) {
      favorites.value = JSON.parse(storedFavorites);
      // Marquer les repas favoris
      meals.value.forEach(meal => {
        meal.isFavorite = favorites.value.includes(meal.id);
      });
    }
    
    applyFilters();
    globalNotifications.success('Menu chargé avec succès');
  } catch (error) {
    console.error('Erreur lors du chargement des repas:', error);
    error.value = 'Erreur lors du chargement du menu. Veuillez réessayer.';
    globalNotifications.error('Erreur lors du chargement du menu');
  } finally {
    isLoading.value = false;
  }
});

// Fonction pour appliquer tous les filtres (recherche, catégorie, favoris)
const applyFilters = () => {
  let result = meals.value;
  
  // Filtre par texte de recherche
  if (searchQuery.value) {
    result = result.filter(meal =>
      meal.designation.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Filtre par catégorie
  if (selectedCategory.value !== 'all') {
    result = result.filter(meal => meal.category === selectedCategory.value);
  }
  
  // Filtre par favoris
  if (showFavoritesOnly.value) {
    result = result.filter(meal => meal.isFavorite);
  }
  
  // Tri
  result = applySorting(result);
  
  filteredMeals.value = result;
};

// Fonction de tri
const applySorting = (meals) => {
  const sorted = [...meals];
  
  switch (sortBy.value) {
    case 'name':
      return sorted.sort((a, b) => a.designation.localeCompare(b.designation));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'popularity':
      return sorted.sort((a, b) => b.popularity - a.popularity);
    default:
      return sorted;
  }
};

// Fonction pour changer le tri
const changeSorting = (newSort) => {
  sortBy.value = newSort;
  applyFilters();
};

// Fonction de recherche mise à jour
const searchMeals = (query) => {
  searchQuery.value = query;
  applyFilters();
};

// Fonction pour changer de catégorie
const changeCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  applyFilters();
};

// Fonction pour basculer l'affichage des favoris uniquement
const toggleFavoritesFilter = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value;
  applyFilters();
};

// Fonction pour ajouter/retirer un repas des favoris
const toggleFavorite = (meal) => {
  meal.isFavorite = !meal.isFavorite;
  
  if (meal.isFavorite) {
    if (!favorites.value.includes(meal.id)) {
      favorites.value.push(meal.id);
    }
    globalNotifications.success(`${meal.designation} ajouté aux favoris`);
  } else {
    const index = favorites.value.indexOf(meal.id);
    if (index !== -1) {
      favorites.value.splice(index, 1);
    }
    globalNotifications.info(`${meal.designation} retiré des favoris`);
  }
  
  // Sauvegarder dans localStorage
  localStorage.setItem('mealFavorites', JSON.stringify(favorites.value));
  
  // Réappliquer les filtres si on affiche uniquement les favoris
  if (showFavoritesOnly.value) {
    applyFilters();
  }
};

const formatPrice = cartStore.formatPrice;

const addToCart = (meal) => {
  if (meal.availability === 0) {
    globalNotifications.warning('Ce plat n\'est pas disponible actuellement');
    return;
  }
  cartStore.addItem(meal);
  globalNotifications.success(`${meal.designation} ajouté au panier`);
};

const view = (meal) => {
  selectedMeal.value = meal;
  showMealModal.value = true;
};

const handleOrderSubmit = async (orderDetails) => {
  try {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
      return;
    }
    globalNotifications.info('Redirection vers le paiement...');
    await checkoutService.createCheckoutSession(cartStore.total);
  } catch (error) {
    console.error('Erreur lors du processus de paiement:', error);
    globalNotifications.error('Erreur lors du paiement');
    router.push('/payment/error');
  }
};

const retryLoadMeals = async () => {
  error.value = null;
  await onMounted();
};
</script>

<template>
  <div class="home">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner size="large" message="Chargement du menu..." />
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <Alert
        variant="error"
        :message="error"
        :dismissible="false"
      />
      <Button @click="retryLoadMeals" variant="primary" class="retry-button">
        Réessayer
      </Button>
    </div>
    
    <!-- Main content -->
    <div v-else class="home-content">
      <!-- Cart Panel -->
    <div v-if="cartStore.showCart" class="cart-panel">
        <div class="cart-header">
          <h3>Mon Panier</h3>
          <button @click="cartStore.toggleCart()" class="cart-close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
      <div v-if="cartStore.items.length > 0" class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.imagePath" :alt="item.designation" class="cart-item-image">
          <div class="cart-item-details">
            <h4>{{ item.designation }}</h4>
            <div class="cart-item-price">
              <span class="price">{{ formatPrice(item.price) }}</span>
              <span class="quantity">x {{ item.quantity }}</span>
            </div>
            <div class="cart-item-total">
              {{ formatPrice(item.price * item.quantity) }}
            </div>
          </div>
          <button @click="cartStore.decreaseItemQuantity(item.id)" class="remove-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          </div>
        </div>
        <div class="cart-total">
          <div class="total-line">
            <span>Total:</span>
            <span class="total-amount">{{ formatPrice(cartStore.total) }}</span>
          </div>
          <Button
            variant="success"
            full-width
            @click="authStore.isAuthenticated ? (showOrderForm = true, cartStore.toggleCart()) : router.push({ name: 'login', query: { redirect: $route.fullPath } })"
          >
            Commander maintenant
          </Button>
        </div>
      </div>
      <div v-else class="empty-cart">
        <div class="empty-cart-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <p>Votre panier est vide</p>
        <p class="empty-cart-subtitle">Découvrez nos délicieux plats</p>
      </div>
    </div>

    <OrderForm
      v-if="showOrderForm"
      :cart-items="cartStore.items"
      :total="cartStore.total"
      @submit-order="handleOrderSubmit"
      @close="showOrderForm = false"
    />

    <MealModal
      v-if="showMealModal"
      :meal="selectedMeal"
      :show="showMealModal"
      @close="showMealModal = false"
    />

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Découvrez nos délicieux plats</h1>
          <p class="hero-subtitle">Une cuisine authentique préparée avec amour pour votre plaisir</p>
        </div>
      </section>

      <!-- Filtres et catégories améliorés -->
      <section class="filters-section">
        <div class="filters-container">
          <div class="filters-row">
            <div class="categories-filter">
              <h3 class="filter-title">Catégories</h3>
              <div class="category-buttons">
                <button 
                  v-for="category in categories" 
                  :key="category.id"
                  @click="changeCategory(category.id)"
                  :class="['category-button', { 'category-button--active': selectedCategory === category.id }]"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>
            
            <div class="filter-controls">
              <div class="sort-filter">
                <label for="sort-select" class="filter-label">Trier par:</label>
                <select 
                  id="sort-select"
                  v-model="sortBy" 
                  @change="applyFilters"
                  class="sort-select"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              
              <button 
                @click="toggleFavoritesFilter"
                :class="['favorites-button', { 'favorites-button--active': showFavoritesOnly }]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span v-if="showFavoritesOnly">Tous les plats</span>
                <span v-else>Favoris uniquement</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Résultats -->
      <section class="results-section">
        <div class="results-header">
          <h2 class="results-title">
            {{ filteredMeals.length }} plat{{ filteredMeals.length > 1 ? 's' : '' }} 
            {{ selectedCategory !== 'all' ? `dans "${categories.find(c => c.id === selectedCategory)?.name}"` : '' }}
          </h2>
          <div class="results-count">
            {{ filteredMeals.length }} résultat{{ filteredMeals.length > 1 ? 's' : '' }}
          </div>
        </div>
      </section>

      <!-- Message si aucun résultat -->
      <div v-if="filteredMeals.length === 0" class="no-results">
        <div class="no-results-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3>Aucun plat trouvé</h3>
        <p>Essayez de modifier vos critères de recherche ou explorez d'autres catégories.</p>
        <Button @click="selectedCategory = 'all'; showFavoritesOnly = false; searchQuery = ''; applyFilters()" variant="outline-primary">
          Voir tous les plats
        </Button>
      </div>

      <!-- Menu des plats -->
      <section class="menu-section">
        <div class="menu-grid">
          <div 
            v-for="(meal, index) in filteredMeals" 
            :key="meal.id"
            class="menu-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="menu-card">
              <div class="menu-card-image">
                <img :src="meal.imagePath" :alt="meal.designation" class="meal-image">
                <button @click="toggleFavorite(meal)" class="favorite-toggle">
                  <svg v-if="meal.isFavorite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <div v-if="meal.availability === 0" class="unavailable-overlay">
                  <span>Non disponible</span>
                </div>
              </div>     
              <div class="menu-card-content">
                <div class="product-header">
                  <h3 class="product-title">{{ meal.designation }}</h3>
                  <span class="category-tag">{{ categories.find(c => c.id === meal.category)?.name }}</span>
                </div>
                <p class="product-description">{{ meal.description }}</p>
                <div class="product-footer">
                  <span class="product-price">{{ formatPrice(meal.price) }}</span>
                  <div v-if="meal.popularity" class="popularity-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>{{ meal.popularity }}%</span>
                  </div>
                </div>
              </div>  
              <div class="menu-card-actions">
                <Button
                  @click="addToCart(meal)"
                  variant="primary"
                  size="medium"
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
                <Button
                  @click="view(meal)"
                  variant="outline-primary"
                  size="medium"
                  full-width
                >
                  Voir les détails
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--orange-50) 0%, var(--gray-50) 100%);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--spacing-lg);
}

.retry-button {
  margin-top: var(--spacing-md);
}

.home-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Hero Section */
.hero-section {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  text-align: center;
  background: linear-gradient(135deg, var(--orange-100) 0%, var(--orange-200) 100%);
  margin: 0 calc(-1 * var(--spacing-lg));
  margin-bottom: var(--spacing-2xl);
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--gray-900);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--gray-600);
  line-height: var(--line-height-relaxed);
}

/* Filters Section */
.filters-section {
  margin-bottom: var(--spacing-2xl);
}

.filters-container {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
}

.filter-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-700);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.category-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-600);
}

.category-button:hover {
  background-color: var(--orange-100);
  border-color: var(--orange-200);
  color: var(--orange-700);
  transform: translateY(-1px);
}

.category-button--active {
  background-color: var(--orange-500);
  border-color: var(--orange-500);
  color: white;
  box-shadow: var(--shadow-sm);
}

.filter-controls {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-lg);
}

.sort-filter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  background-color: white;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
}

.sort-select:focus {
  outline: none;
  border-color: var(--orange-300);
  box-shadow: 0 0 0 3px rgba(var(--orange-300-rgb), 0.1);
}

.favorites-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-600);
}

.favorites-button:hover {
  background-color: var(--red-50);
  border-color: var(--red-200);
  color: var(--red-600);
}

.favorites-button--active {
  background-color: var(--red-500);
  border-color: var(--red-500);
  color: white;
}

.favorites-button svg {
  width: 16px;
  height: 16px;
}

/* Results Section */
.results-section {
  margin-bottom: var(--spacing-xl);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.results-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
  background-color: var(--gray-100);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.menu-item {
  animation: fadeIn 0.6s ease-out both;
}

.menu-card {
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-normal) var(--transition-timing);
  border: 1px solid var(--gray-200);
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--orange-200);
}

.menu-card-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.meal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--transition-timing);
}

.menu-card:hover .meal-image {
  transform: scale(1.1);
}

.favorite-toggle {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--border-radius-full);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);
  z-index: 2;
  backdrop-filter: blur(10px);
}

.favorite-toggle:hover {
  transform: scale(1.1);
  background: white;
  box-shadow: var(--shadow-md);
}

.favorite-toggle svg {
  width: 20px;
  height: 20px;
  color: var(--red-500);
}

.unavailable-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.menu-card-content {
  padding: var(--spacing-xl);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.product-title {
  margin: 0;
  color: var(--gray-900);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.category-tag {
  background-color: var(--orange-100);
  color: var(--orange-700);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.product-description {
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--orange-600);
}

.popularity-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.popularity-indicator svg {
  width: 12px;
  height: 12px;
  fill: var(--yellow-400);
}

.menu-card-actions {
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background-color: var(--gray-50);
}

/* No Results */
.no-results {
  text-align: center;
  padding: var(--spacing-3xl);
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  margin: var(--spacing-2xl) 0;
}

.no-results-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  color: var(--gray-300);
}

.no-results-icon svg {
  width: 100%;
  height: 100%;
}

.no-results h3 {
  font-size: var(--font-size-xl);
  color: var(--gray-700);
  margin-bottom: var(--spacing-md);
}

.no-results p {
  color: var(--gray-500);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Cart Panel amélioré */
.cart-panel {
  position: fixed;
  top: 72px;
  right: var(--spacing-lg);
  background: white;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 350px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: var(--z-modal);
  animation: slideInRight 0.3s var(--transition-timing);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--gray-200);
}

.cart-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.cart-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  color: var(--gray-400);
  transition: all var(--transition-fast) var(--transition-timing);
}

.cart-close:hover {
  background-color: var(--gray-100);
  color: var(--gray-600);
}

.cart-close svg {
  width: 20px;
  height: 20px;
}

.cart-items {
  padding: var(--spacing-lg);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast) var(--transition-timing);
  margin-bottom: var(--spacing-md);
}

.cart-item:last-child {
  margin-bottom: 0;
}

.cart-item:hover {
  background-color: var(--gray-50);
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.cart-item-details {
  flex: 1;
  min-width: 0;
}

.cart-item-details h4 {
  margin: 0;
  color: var(--gray-900);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.cart-item-price {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  margin-bottom: var(--spacing-xs);
}

.cart-item-total {
  font-weight: var(--font-weight-semibold);
  color: var(--orange-600);
  font-size: var(--font-size-sm);
}

.remove-item {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  color: var(--gray-400);
  transition: all var(--transition-fast) var(--transition-timing);
  flex-shrink: 0;
}

.remove-item:hover {
  background-color: var(--red-50);
  color: var(--red-500);
}

.remove-item svg {
  width: 16px;
  height: 16px;
}

.cart-total {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
}

.total-amount {
  color: var(--orange-600);
}

.empty-cart {
  padding: var(--spacing-3xl);
  text-align: center;
}

.empty-cart-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-md);
  color: var(--gray-300);
}

.empty-cart-icon svg {
  width: 100%;
  height: 100%;
}

.empty-cart p {
  color: var(--gray-500);
  margin-bottom: var(--spacing-xs);
}

.empty-cart-subtitle {
  font-size: var(--font-size-sm);
  color: var(--gray-400);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .home-content {
    padding: 0 var(--spacing-md);
  }
  
  .hero-section {
    padding: var(--spacing-2xl) 0 var(--spacing-xl);
    margin: 0 calc(-1 * var(--spacing-md));
    margin-bottom: var(--spacing-xl);
  }
  
  .hero-title {
    font-size: var(--font-size-2xl);
  }
  
  .filters-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .cart-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 0;
    z-index: var(--z-modal);
  }

  .menu-card-image {
    height: 180px;
  }

  .menu-card-content {
    padding: var(--spacing-lg);
  }

  .menu-card-actions {
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: var(--font-size-xl);
  }

  .filters-container {
    padding: var(--spacing-lg);
  }

  .category-buttons {
    justify-content: center;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}

/* Animation d'apparition progressive */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .menu-item {
    animation: none;
  }

  .menu-card,
  .cart-panel,
  .favorite-toggle {
    transition: none;
  }
}
    </div>
</style>
