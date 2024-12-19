import ListSynthetisers from "@/features/synthetisers/components/ListSynthetisers";
import { Suspense } from "react";

export const metadata = {
  title: 'Synthétiseurs | MaMusiqueApp',
  description: 'Liste des synthétiseurs disponibles'
};

export default function SynthetisersPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Liste des Synthétiseurs</h1>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-pulse text-gray-600">
            Chargement...
          </div>
        </div>
      }>
        <ListSynthetisers />
      </Suspense>
    </main>
  );
}