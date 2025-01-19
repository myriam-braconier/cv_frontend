import React from 'react';
import { User, Profile, Role } from "@/features/users/types/types";
import { Synth, Post } from "@/features/synthetisers/types/synth";
import { UserCard } from './cards//UserCard';

interface FilteredUsersProps {
    users: User[];
    profiles: { [key: number]: Profile };
    posts: { [key: number]: Post[] };
    synthetisers: { [key: number]: Synth };
}

const USER_ROLES = {
    ADMIN: "ADMIN" as unknown as Role,
    USER: "USER" as unknown as Role
};

const FilteredUsers = ({ users, profiles, posts, synthetisers }: FilteredUsersProps) => {
    // Filtrer pour garder uniquement les utilisateurs avec un rôle défini qui n'est pas ADMIN
    const filteredUsers = users.filter(user => {
        return user.role !== undefined && user.role !== USER_ROLES.ADMIN;
    });

    return (
        <div className="space-y-8" key="filtered-users-container">
            {filteredUsers.map((user, index) => (
                <div key={`user-card-wrapper-${user.id || index}`}>
                    <UserCard
                        user={user}
                        profile={profiles[user.id]}
                        posts={posts[user.id]}
                        synthetisers={synthetisers}
                        role={user.role} // Add the missing role prop
                    />
                </div>
            ))}
        </div>
    );
};

export default FilteredUsers;