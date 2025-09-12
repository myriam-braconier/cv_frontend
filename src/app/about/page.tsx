import BackgroundRotator from "@/components/BackgroundRotator";

export default function AboutPage() {
	const images = [
		"/images/iStock-1477817772.webp",
		"/images/login2.webp",
		// autres images...
	];

	return (
		<main className="min-h-screen relative">
			{/* Background en premier avec z-index négatif */}
			<div className="fixed inset-0 -z-10">
				<BackgroundRotator images={images} />
			</div>
			<div className="max-w-[800px] mx-auto">
				<div className="space-y-4 space-x-6 text-lg text-blue-900 text-bold mt-10 pb-10 border-2 border-white rounded-xl">
					<h1 className="text-3xl font-bold mt-8 mb-6 text-center">
						À propos de Concrete Vibes
					</h1>
					<p>
						Bienvenue sur Concrete Vibes, une plateforme dédiée aux passionnés
						de synthétiseurs. Notre mission est de créer un espace où les
						amateurs et collectionneurs peuvent échanger leurs instruments dans
						un environnement sécurisé et convivial.
					</p>
						<h2 className="text-2xl font-semibold mb-4">Notre Projet</h2>
						<p>
							Concrete Vibes est né d&apos;une passion pour la musique
							électronique et de l&apos;envie de créer une communauté active
							autour de ces instruments mythiques. Notre plateforme permet aux
							utilisateurs de participer à des enchères, découvrir des pièces
							rares et échanger avec d&apos;autres passionnés.
						</p>
				

					{/* <section className="mt-8">
						<h2 className="text-2xl font-semibold mb-4">Contact</h2>
						<p>
							Vous pouvez me contacter à l&apos;adresse suivante :
							<a
								href=""
								className="text-blue-600 hover:underline ml-1"
							>
								
							</a>
						</p>
					</section> */}
				</div>
			</div>
		</main>
	);
}
