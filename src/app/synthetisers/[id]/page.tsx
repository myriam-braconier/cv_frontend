import { Suspense } from "react";
import SynthetiserDetailPage from "@/features/synthetisers/components/SynthetiserDetailPage";

export const metadata = {
  title: 'Détail du synthétiseur | MaMusiqueApp',
  description: 'Détails et caractéristiques du synthétiseur'
};

// Typage des props avec l'id
interface Props {
  params: {
    id: string;
  };
}

export default function SynthetiserPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
          </div>
        </div>
      }>
        <SynthetiserDetailPage params={params} />
      </Suspense>
    </main>
  );
}