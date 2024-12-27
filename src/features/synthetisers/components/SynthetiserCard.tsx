import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CardImage } from "@/features/synthetisers/components/card/CardImage";
import { CardHeader } from "@/features/synthetisers/components/card/CardHeader";
import CardPricing from "@/features/synthetisers/components/card/CardPricing";
import { CardActions } from "@/features/synthetisers/components/card/CardActions";
import { PostList } from "@/features/synthetisers/components/posts/PostList";
import { EditorDialog } from "@/features/synthetisers/components/dialogs/EditorDialog";
import { useSynths } from "@/hooks/useSynths";
import { Synth } from "@/features/synthetisers/types/synth";






interface SynthetiserCardProps {
  synth: Synth;
  userRoles?: string[];
  onUpdateSuccess?: () => void;
  isAuthenticated: () => boolean;
}

export const SynthetiserCard = ({ 
  synth, 
  userRoles = [], 
  onUpdateSuccess 
}: SynthetiserCardProps) => {
  const [showPosts, setShowPosts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { updateSynth, isUpdating, updateError } = useSynths();
  
  const { 
    id, 
    image_url, 
    marque, 
    modele, 
    note, 
    nb_avis, 
    specifications, 
    price, 
    posts = [],
    auctionPrices = []
  } = synth;

  const fullTitle = `${marque} ${modele}`;

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        // Stockage de l'userId décodé
        localStorage.setItem('userId', tokenData.userId);
        return true;
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        return false;
      }
    }
    return false;
  }, []);
  

  const handleTogglePost = useCallback(() => 
    setShowPosts(prev => !prev), 
  []);

  const handleImageError = useCallback(() => 
    console.error("Erreur de chargement d'image"), 
  []);

  const handleEdit = useCallback(() => 
    setIsEditing(true), 
  []);

  const handleDelete = useCallback(() => 
    console.log("Suppression du synthétiseur:", id), 
  [id]);

  const handleEditSubmit = async (updatedData: Partial<Synth>) => {
    setIsLoading(true);
    try {
      await updateSynth(id, updatedData);
      toast.success("Mise à jour réussie");
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
        return;
      }
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };


// gestion des données utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('userId', tokenData.userId.toString());
    }
  }, []);




  console.log({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    price,
    auctionPrices
  });




  return (
    <article className="bg-white rounded-lg shadow-lg h-full w-full">
      <div className="flex flex-col h-full space-y-4 p-4">
        <div className="relative h-48 w-full">
          <CardImage
            image_url={image_url}
            title={fullTitle}
            onError={handleImageError}
          />
        </div>
        
        <CardHeader
          title={fullTitle}
          note={note}
          nb_avis={nb_avis}
          specifications={specifications}
        />

        <CardPricing
          price={price}
          auctionPrices={auctionPrices}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          synthId={id.toString()}
          onUpdateSuccess={onUpdateSuccess}
        />

        <PostList
          posts={posts}
          showPosts={showPosts}
          onToggle={handleTogglePost}
        />

        {userRoles?.includes("admin") && (
          <CardActions 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        )}
      </div>

      {userRoles?.includes("admin") && (
        <EditorDialog 
          isOpen={isEditing}
          onOpenChange={(open) => {
            setIsEditing(open);
            if (!open) router.refresh();
          }}
          synth={synth}
          onSubmit={handleEditSubmit}
          isLoading={isUpdating}
          error={updateError}
          onCancel={() => setIsEditing(false)}
        />
      )}






      
    </article>




  );
};