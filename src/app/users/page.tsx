// app/users/page.tsx
import { Synth } from "@/features/synthetisers/types/synth";
import { UsersList } from "@/features/users/components/list/UsersList";
import { getSynthetisers } from "@/features/synthetisers/api/getSynthetisers";
import { apiFetch } from '@/config/api';

type SynthMap = { [key: number]: Synth };

export default async function UsersPage() {
  try {
    console.log('Starting data fetch...');

    // Récupération directe des users depuis l'API
    const [users, synthetisers] = await Promise.all([
      apiFetch(`/api/users`),
      getSynthetisers(1, 100)
    ]);


    console.log('Data fetched:', {
      usersCount: users.length,
      sampleUserPosts: users[0]?.posts?.length,
      synthetisersCount: synthetisers.length
    });

    const synthetisersMap: SynthMap = synthetisers.reduce<SynthMap>((acc, synth) => {
      if (synth?.id) {
        acc[synth.id] = synth;
      }
      return acc;
    }, {});

    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Users</h1>
        <UsersList users={users} synthetisers={synthetisersMap} />
      </div>
    );
  } catch (error) {
    console.error('Error in UsersPage:', error);
    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Users</h1>
        <div className="text-red-500">Failed to load data</div>
      </div>
    );
  }
}