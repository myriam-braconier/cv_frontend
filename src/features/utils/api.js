// utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchPosts = async (synthetiserId) => {
  const response = await fetch(`${API_URL}/api/posts?synthetiserId=${synthetiserId}`);
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des posts');
  }
  return response.json();
};

export const handlePostAdded = async (synthetiserId) => {
  try {
    await fetchPosts(synthetiserId);
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des posts:", error);
  }
};