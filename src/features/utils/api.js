// utils/api.js
import { apiFetch } from '../../config/api.js';

/**
 * Récupérer les posts pour un synthétiseur donné
 */
export const fetchPosts = async (synthetiserId) => {
  try {
    const data = await apiFetch(`/api/posts?synthetiserId=${synthetiserId}`);
    return data;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des posts: ${error.message}`);
  }
};

/**
 * Gérer l'ajout d'un post et recharger la page
 */
export const handlePostAdded = async (synthetiserId) => {
  try {
    await fetchPosts(synthetiserId);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des posts:", error);
    throw error;
  }
};

/**
 * Récupérer les données utilisateur
 */
export const fetchUserData = async () => {
  try {
    const data = await apiFetch('/api/users');
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
};

/**
 * Récupérer les synthétiseurs avec pagination
 */
export const fetchSynthetisers = async (page = 1, limit = 100) => {
  try {
    const data = await apiFetch(`/api/synthetisers?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error('Error fetching synthetisers:', error);
    throw error;
  }
};

/**
 * Créer un nouveau post
 */
export const createPost = async (postData) => {
  try {
    const data = await apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return data;
  } catch (error) {
    throw new Error(`Erreur lors de la création du post: ${error.message}`);
  }
};

/**
 * Mettre à jour un post existant
 */
export const updatePost = async (postId, postData) => {
  try {
    const data = await apiFetch(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
    return data;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du post: ${error.message}`);
  }
};

/**
 * Supprimer un post
 */
export const deletePost = async (postId) => {
  try {
    const data = await apiFetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression du post: ${error.message}`);
  }
};