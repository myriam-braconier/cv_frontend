// utils/api.js


export const fetchPosts = async (synthetiserId) => {
  const response = await fetch(`/api/posts?synthetiserId=${synthetiserId}`);
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