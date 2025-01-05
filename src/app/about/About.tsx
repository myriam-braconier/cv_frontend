"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useEffect } from "react"; // Ajout des hooks manquants
import { API_URL } from "@/config/constants"; // Assurez-vous d'avoir ce fichier
import api from "@/lib/axios"; // Assurez-vous d'avoir ce fichier
import Waveform from "@/components/Waveform";

export default function AboutPage() {
    const [aboutData, setAboutData] = useState(null);
    // Correction du type d'erreur pour accepter string
    const [error, setError] = useState<string | null>(null);

    const fetchAboutData = useCallback(async () => {
        try {
            const response = await api.get(`${API_URL}/api/about`);
            if (response.data) {
                setAboutData(response.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            setError("Une erreur est survenue");
        }
    }, []);

    // Ajout de useEffect pour appeler fetchAboutData
    useEffect(() => {
        fetchAboutData();
    }, [fetchAboutData]);

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative text-white min-h-[600px] w-full overflow-y-clip"
                id="sectionAccueil"
            >
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src="/images/synthetiseur-analogique-moog-subsequent-37.jpg"
                        alt="Background"
                        fill
                        sizes="100vw"
                        className="object-cover opacity-50"
                        priority
                    />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 to-pink-500/50" />

                {/* Contenu principal */}
                <div className="container mx-auto px-4 py-16 relative z-20">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 mb-4 md:mb-0 mr-5">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-500">
                                A propos
                            </h1>
                            {aboutData && (
                                <>
                                    
                                </>
                            )}
                        </div>
                    </div>
                    <div className="py-11 text-right">
                        <Link
                            href="/synthetisers"
                            className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
                        >
                            Voir les Synthétiseurs
                        </Link>
                    </div>
                </div>

                {/* Waveform Component */}
                <div className="md:w-1/2">
                    <div className="items-center mx-auto">
                        <Waveform initialColor="#FF5733" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-transparent/80 backdrop-blur-sm">
                {/* Vous pouvez ajouter du contenu ici si nécessaire */}
            </section>
        </main>
    );
}

// Définition du type FeatureCard
interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}