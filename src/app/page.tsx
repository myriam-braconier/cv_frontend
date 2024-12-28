import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-500">
                Bienvenue sur Concrete Vibes
              </h1>
              <p className="text-xl mb-8">
                Découvrez notre collection de synthétiseurs et partagez votre passion
              </p>
              <Link 
                href="/synthetisers" 
                className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
              >
                Voir les Synthétiseurs
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-[400px]">
                <Image
                  src="/images/sound.gif"
                  alt="Sound"
                  unoptimized
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nos Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Collection Unique"
              description="Découvrez une sélection soignée de synthétiseurs"
              icon="🎹"
            />
            <FeatureCard
              title="Communauté Active"
              description="Partagez votre expérience avec d'autres passionnés"
              icon="👥"
            />
            <FeatureCard
              title="Ressources"
              description="Accédez à des tutoriels et des guides"
              icon="📚"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Prêt à rejoindre la communauté ?
          </h2>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors"
            >
             Inscription
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Composant FeatureCard
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

