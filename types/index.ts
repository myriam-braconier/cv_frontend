export interface Synth {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
	note?: number;
	nb_avis?: number;
	specifications?: string;
	url?: string;
	auctionPrice?: number;
}

export interface ApiResponse {
	data: Synth[];
	roles: string[];
	message?: string;
	status?: number;
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

export interface LoginResponse {
	token: string;
	user: {
		id: number;
		email: string;
		role: string[];
	};
}
