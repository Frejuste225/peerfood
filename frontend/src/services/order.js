import { apiMethods } from './api.js';

export default class OrderService {
  static baseURL = '/orders';

  /**
   * Récupère toutes les commandes de l'utilisateur connecté
   * @returns {Promise<Array>} Liste des commandes
   */
  static async getUserOrders() {
    try {
      const response = await apiMethods.get(`${this.baseURL}/user`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw new Error(error.message || 'Impossible de récupérer les commandes');
    }
  }

  /**
   * Récupère toutes les commandes (admin seulement)
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} Liste des commandes
   */
  static async getAllOrders(filters = {}) {
    try {
      const response = await apiMethods.get(this.baseURL, filters);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les commandes:', error);
      throw new Error(error.message || 'Impossible de récupérer les commandes');
    }
  }

  /**
   * Récupère une commande par son ID
   * @param {string} orderId - ID de la commande
   * @returns {Promise<Object>} Détails de la commande
   */
  static async getOrderById(orderId) {
    try {
      const response = await apiMethods.get(`${this.baseURL}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la commande ${orderId}:`, error);
      throw new Error(error.message || 'Commande non trouvée');
    }
  }

  /**
   * Crée une nouvelle commande
   * @param {Object} orderData - Données de la commande
   * @returns {Promise<Object>} Commande créée
   */
  static async createOrder(orderData) {
    try {
      const response = await apiMethods.post(this.baseURL, orderData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw new Error(error.message || 'Impossible de créer la commande');
    }
  }

  /**
   * Met à jour le statut d'une commande
   * @param {string} orderId - ID de la commande
   * @param {string} status - Nouveau statut
   * @returns {Promise<Object>} Commande mise à jour
   */
  static async updateOrderStatus(orderId, status) {
    try {
      const response = await apiMethods.patch(`${this.baseURL}/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error(error.message || 'Impossible de mettre à jour le statut');
    }
  }

  /**
   * Annule une commande
   * @param {string} orderId - ID de la commande
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise<Object>} Commande annulée
   */
  static async cancelOrder(orderId, reason = 'Annulée par l\'utilisateur') {
    try {
      const response = await apiMethods.patch(`${this.baseURL}/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      throw new Error(error.message || 'Impossible d\'annuler la commande');
    }
  }

  /**
   * Ajoute un avis sur une commande
   * @param {string} orderId - ID de la commande
   * @param {Object} reviewData - Données de l'avis
   * @returns {Promise<Object>} Avis créé
   */
  static async addOrderReview(orderId, reviewData) {
    try {
      const response = await apiMethods.post(`${this.baseURL}/${orderId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      throw new Error(error.message || 'Impossible d\'ajouter l\'avis');
    }
  }

  /**
   * Récupère les statistiques des commandes
   * @param {Object} filters - Filtres pour les statistiques
   * @returns {Promise<Object>} Statistiques
   */
  static async getOrderStats(filters = {}) {
    try {
      const response = await apiMethods.get(`${this.baseURL}/stats`, filters);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.message || 'Impossible de récupérer les statistiques');
    }
  }

  /**
   * Formate le prix en devise locale
   * @param {number} price - Prix à formater
   * @returns {string} Prix formaté
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  }

  /**
   * Formate une date en français
   * @param {string|Date} date - Date à formater
   * @returns {string} Date formatée
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Valide les données d'une commande
   * @param {Object} orderData - Données à valider
   * @returns {Array} Liste des erreurs
   */
  static validateOrderData(orderData) {
    const errors = [];
    
    if (!orderData.plat) {
      errors.push('Le plat est requis');
    }
    
    if (!orderData.customer) {
      errors.push('Le client est requis');
    }
    
    if (!orderData.category) {
      errors.push('La catégorie est requise');
    }
    
    if (!orderData.price || orderData.price <= 0) {
      errors.push('Le prix doit être supérieur à 0');
    }
    
    if (!orderData.deliveryDate) {
      errors.push('La date de livraison est requise');
    } else {
      const deliveryDate = new Date(orderData.deliveryDate);
      const today = new Date();
      if (deliveryDate <= today) {
        errors.push('La date de livraison doit être dans le futur');
      }
    }
    
    if (orderData.payMethod && !['MTN MoMo', 'Orange Money', 'Wave'].includes(orderData.payMethod)) {
      errors.push('Méthode de paiement invalide');
    }
    
    return errors;
  }

  /**
   * Calcule le total d'une commande avec les taxes
   * @param {Array} items - Articles de la commande
   * @param {number} taxRate - Taux de taxe (défaut: 0)
   * @returns {Object} Détails du total
   */
  static calculateOrderTotal(items, taxRate = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    return {
      subtotal,
      tax,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0)
    };
  }
}