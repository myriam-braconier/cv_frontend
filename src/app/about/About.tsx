// pages/about.tsx
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

interface TeamMember {
  id: number
  name: string
  role: string
  image: string
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Doe",
    role: "CEO",
    image: "/team/john.jpg"
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "CTO",
    image: "/team/jane.jpg"
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Lead Developer",
    image: "/team/mike.jpg"
  }
]

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>À propos - Mon Site</title>
        <meta name="description" content="Découvrez notre histoire et notre équipe" />
      </Head>

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">À propos de nous</h1>
          <p className="text-lg text-gray-600">
            Notre mission est de créer des solutions innovantes pour nos clients
          </p>
        </section>

        {/* Histoire Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
            <p className="text-gray-600">
              Fondée en 2020, notre entreprise s&apos;est développée avec la vision 
              de transformer l&apos;industrie grâce à des solutions technologiques innovantes.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "500+", label: "Clients" },
              { number: "10+", label: "Années d'expérience" },
              { number: "50+", label: "Projets" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h3 className="text-3xl font-bold text-blue-600">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default About