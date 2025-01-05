export default function AboutPage() {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            À propos de Concrete Vibes
          </h1>
          
          <div className="space-y-6 text-lg">
            <p>
              Bienvenue sur Concrete Vibes, une plateforme dédiée aux passionnés de synthétiseurs.
              Notre mission est de créer un espace où les amateurs et collectionneurs peuvent
              échanger leurs instruments dans un environnement sécurisé et convivial.
            </p>
  
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Notre Projet</h2>
              <p>
                Concrete Vibes est né d&apos;une passion pour les synthétiseurs et de l&apos;envie
                de créer une communauté active autour de ces instruments mythiques.
                Notre plateforme permet aux utilisateurs de participer à des enchères,
                découvrir des pièces rares et échanger avec d&apos;autres passionnés.
              </p>
            </section>
  
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p>
                Vous pouvez me contacter à l&apos;adresse suivante : 
                <a href="mailto:votre@email.com" className="text-blue-600 hover:underline ml-1">
                  votre@email.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    );
  }