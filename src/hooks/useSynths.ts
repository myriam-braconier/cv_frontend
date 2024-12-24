import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Synth } from "@/types/synth";
import { useRouter } from "next/navigation";
import { api } from "@/services/axios";

interface UseSynthsReturn {
  synths: Synth[];
  userRoles: string[];
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  updateError: string | null;
  fetchSynths: () => void;
  updateSynth: (id: number, data: Partial<Synth>) => Promise<void>;
}

export function useSynths(): UseSynthsReturn {
  const router = useRouter();
  const [synths, setSynths] = useState<Synth[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(true);

  const fetchSynths = useCallback(async (): Promise<void> => {
    if (!shouldFetch) return;

    try {
      setIsLoading(true);
      setError(null);
      setShouldFetch(false); // Empêche les appels répétés

      // Récupération des rôles utilisateur
      const roleResponse = await api.get("/auth/me");
      const userRole = roleResponse.data.role;
      setUserRoles(userRole === "admin" ? ["admin"] : [userRole]);

      // Récupération des synthétiseurs
      const { data } = await api.get("/api/synthetisers");
      setSynths(data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError("Une erreur est survenue lors de la récupération des données.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, shouldFetch]);

  const refreshData = useCallback(() => {
    setShouldFetch(true);
  }, []);

  const updateSynth = useCallback(
    async (id: number, data: Partial<Synth>): Promise<void> => {
      try {
        setIsUpdating(true);
        setUpdateError(null);

        const requestData = {
          ...data,
          price: data.price ?? null,
          auctionPrice: data.auctionPrice ?? null,
        };

        console.log("📤 Données à envoyer :", {
          id,
          data: JSON.stringify(requestData, null, 2),
        });

        const response = await api.put(`/api/synthetisers/${id}`, requestData);

        if (!response?.data) {
          throw new Error("Réponse invalide");
        }

        setSynths((prevSynths) =>
          prevSynths.map((synth) =>
            synth.id === id ? { ...synth, ...response.data.data } : synth
          )
        );
      } catch (error) {
        console.error("❌ Erreur détaillée :", error);

        let errorMessage = "Erreur lors de la mise à jour";

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401) {
            errorMessage = "Session expirée";
            localStorage.removeItem("token");
            router.push("/login");
            return;
          } else if (status === 403) {
            errorMessage = "Accès non autorisé";
          } else if (status === 404) {
            errorMessage = "Synthétiseur non trouvé";
          } else {
            errorMessage = error.response?.data?.message || errorMessage;
          }
        }

        setUpdateError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchSynths();
  }, [fetchSynths]);

  useEffect(() => {
    if (error === "Non authentifié") {
      router.push("/login");
    }
  }, [error, router]);

  return {
    synths,
    userRoles,
    isLoading,
    error,
    isUpdating,
    updateError,
    fetchSynths: refreshData,
    updateSynth,
  };
}
