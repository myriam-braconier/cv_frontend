"use client"; // Ajout nécessaire pour utiliser useState et useEffect dans Next.js
import Image from "next/image";
import Link from "next/link";
// import { useEffect } from "react"; // on ote le usestate car pas auth
import Waveform from "@/components/Waveform";

export default function AboutPage() {
	// const [isAdmin, setIsAdmin] = useState(false);

	// SI AUTH
	// useEffect(() => {
	// 	const token = localStorage.getItem("token");
	// 	if (token) {
	// 		try {
	// 			const payload = JSON.parse(atob(token.split(".")[1]));
	// 			setIsAdmin(payload.role === "admin");
	// 		} catch (error) {
	// 			console.error("Erreur lors du décodage du token:", error);
	// 		}
	// 	}
	// }, []);

	return (
		<main className="min-h-screen">
			{/* Hero Section */}

			<section
				className="relative  text-white  min-h-[600px] w-full overflow-y-clip"
				id="sectionAccueil"
			>
				<div className="absolute inset-0 w-full h-full">
					<Image
						src="/images/synthetiseur-analogique-moog-subsequent-37.jpg"
						alt="Background"
						fill
						sizes="100vw"
						className="object-cover  opacity-50"
						priority
					/>
				</div>

				{/* Overlay gradient pour améliorer la lisibilité */}
				<div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 to-pink-500/50" />

				{/* Contenu existant avec z-index pour le placer au-dessus du fond */}
				<div className="container mx-auto px-4 py-16 relative z-20">
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div className="md:w-1/2 mb-4 md:mb-0 mr-5">
							<h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-500">
								A propos
							</h1>
							<p className="text-xl mb-2">Mon projet :</p>
							<p className="text-sm italic">Son histoire</p>
						</div>
					</div>
					<div className="py-11 text-right">
						<Link
							href="/synthetisers"
							className=" bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
						>
							Voir les Synthétiseurs
						</Link>
					</div>
				</div>

				{/* image gif */}
				<div className="md:w-1/2">
					{/* <div className="relative w-full h-[400px] z-30">
								<Image
									src="/images/sound.gif"
									alt="Sound"
									unoptimized
									fill
									className="object-cover rounded-lg hue-rotate-90 saturate-150"
									 priority
								/>
							</div> */}
					<div className="items-center mx-auto">
						<Waveform initialColor="#FF5733" />
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-transparent/80 backdrop-blur-sm"></section>

			{/* CTA Section - Conditionnel basé sur isAdmin */}
			{/* {!isAdmin && (
				<section className=" bg-gradient-to-b from-blue-500/50 to-pink-500/50">
					<div className="container mx-auto px-4 text-center">
						<h2 className="text-3xl font-bold mb-8">
							Prêt à rejoindre la communauté ?
						</h2>
						<div className="flex justify-center gap-4">
							<Link
								href="/register"
								className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
							>
								Inscription
							</Link>
							<Link
								href="/login"
								className="bg-red-600 text-white px-8 py-3 rounded-full font-bold border border-blue-600 hover:bg-blue-50 transition-colors"
							>
								Se connecter
							</Link>
						</div>
					</div>
				</section>
			)} */}

			{/* Section Admin */}
			{/* {isAdmin && (
				<section className="bg-gray-100 py-16">
					<div className="container mx-auto px-4 text-center">
						<h2 className="text-3xl font-bold mb-8">Panel Administrateur</h2>
						<Link
							href="/admin/dashboard"
							className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
						>
							Accéder au Dashboard
						</Link>
					</div>
				</section>
			)} */}
		</main>
	);
}
// Composant FeatureCard
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
