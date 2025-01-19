export interface User {
	id: number;
	username: string;
	email: string;
	first_name?: string;
	last_name?: string;
	has_instrument?: boolean;
	roleId?: number;
    role: Role;
	profile?: {
	  id: number;
	  // autre champs à rajouter
	};
	posts?: Array<{
	  id: number;
	  // autre champs à rajouter
	}>;
  }
  

// Les roles sotn des objets
export interface Role {
	id: number;
	name: string;
	permission: string;
  }


export interface Profile {
	id: number;
	bio: string | null;
	location: string | null;
	birthDate: Date | null;
	avatarUrl: string | null;
	userId: number; // Ajouté à cause de la relation belongsTo
	createdAt: Date; // Ajouté car timestamps: true
	updatedAt: Date; // Ajouté car timestamps: true
}

export interface Post {
	id: number;
	titre?: string;
	commentaire?: string;
	contenu?: string; // Remplacé `Text` par `string`, car `Text` n'est pas défini
	type_contenu?: "texte" | "video" | "audio" | "lien"; // Types de contenu autorisés
	url_contenu?: string;
	format?: string;
	statut?: "brouillon" | "publié" | "archivé"; // Statuts possibles
	userId?: number;
	// Ajout de la relation avec l'utilisateur
	author?: {
		id: number;
		username: string;
	};
	synthetiserId: number; // ID du synthétiseur associé
	createdAt?: number; // Date de création
	updatedAt?: string; // Date de mise à jour
}




export type CreateProfile = Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
	id?: number;
	createdAt?: Date;
	updatedAt?: Date;
};

export type UpdateProfile = Partial<CreateProfile>;
