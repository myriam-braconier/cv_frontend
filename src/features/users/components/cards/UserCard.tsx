// components/UserCard.tsx
import { User, Profile, Role } from "@/features/users/types/types";
import { Synth, Post } from "@/features/synthetisers/types/synth";
import { MainInfoCard } from "@/features/users/components/cards/MainInfoCard";
import { ProfileCard } from "@/features/users/components/cards/ProfileCard";
import { SynthetiserCard } from "@features/users/components/cards/SynthetiserCard";

interface UserCardContainerProps {
    user: User;
    profile?: Profile;
    posts?: Post[];
    synthetisers?: { [key: number]: Synth };
	role: Role;
}

// Définition des IDs de rôle
const ROLE_IDS = {
    ADMIN: 2,
    USER: 1
};

export function UserCard({
    user,
    profile,
    posts,
    synthetisers,
}: UserCardContainerProps) {
    // Ne montrer que les utilisateurs non-admin
    if (user.roleId=== ROLE_IDS.ADMIN) {
        return null;
    }

    // Initialize postsBySynth as an empty object if posts or synthetisers are undefined
    const postsBySynth =
        posts && synthetisers
            ? posts.reduce((acc, post) => {
                    if (post.synthetiserId && synthetisers[post.synthetiserId]) {
                        const synthId = post.synthetiserId.toString();
                        if (!acc[synthId]) {
                            acc[synthId] = {
                                synth: synthetisers[post.synthetiserId],
                                posts: [],
                            };
                        }
                        acc[synthId].posts.push(post);
                    }
                    return acc;
            }, {} as { [key: string]: { synth: Synth; posts: Post[] } })
            : {};

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <MainInfoCard user={user} role={user.role}/>
            {profile && <ProfileCard profile={profile} />}
            {Object.entries(postsBySynth).length > 0 &&
                Object.entries(postsBySynth).map(([synthId, { synth, posts }]) => (
                    <SynthetiserCard key={synthId} synth={synth} posts={posts} />
                ))}
        </div>
    );
}