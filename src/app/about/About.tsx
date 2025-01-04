import Image from "next/image";
import Link from "next/link";
// import { useState, useEffect } from "react";
// import Waveform from "@/components/Waveform";

export default function AboutPage() {
	return (
		<main className="min-h-screen">
			{/* Hero Section */}

			{/* ABOUT */}

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
						<div className="md:w-1/2 mb-4 md:mb-0">
							<h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-500">
								A propos de mon parcours
							</h1>
							<p className="text-xl mb-2">Mes projets</p>
							<p className="text-sm italic">Mes points forts et softs skills</p>
							<p className="text-sm italic">Mon repository général </p>
							<p>
								<br />
							</p>
							<div className="italic text-sm">
								<div className="mt-2 ml-10">
									<span className="inline-block hover:scale-110 transition-transform">
										👆
									</span>
									<span>
										<Link href="https" className="">
											Mon profil GitHub
										</Link>
									</span>
								</div>
							</div>
						</div>

						{/* image gif */}
						<div className="md:w-1/2">
							<div className="relative w-full h-[400px] z-30">
								<Image
									src="/images/sound.gif"
									alt="Sound"
									unoptimized
									fill
									className="object-cover rounded-lg hue-rotate-90 saturate-150"
									priority
								/>
							</div>
							{/* <Waveform initialColor="#FF5733" /> */}
						</div>
					</div>
				</div>
			</section>

			
		</main>
	);
}
