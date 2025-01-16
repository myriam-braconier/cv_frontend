export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
    has_instrument: boolean;
    role: string[];
}

export interface Profile {
    id: number;
    bio: string | null;
    location: string | null;
    birthDate: Date | null;
    avatarUrl: string | null;
    userId: number;  // Ajouté à cause de la relation belongsTo
    createdAt: Date; // Ajouté car timestamps: true
    updatedAt: Date; // Ajouté car timestamps: true
  }

  export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string[];
	password: string;
}
  
  export type CreateProfile = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  
  export type UpdateProfile = Partial<CreateProfile>;