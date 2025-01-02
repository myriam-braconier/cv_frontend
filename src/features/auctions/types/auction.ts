export interface Auction {
	id: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	updatedAt?: string;
	createdAt?: number;  
}