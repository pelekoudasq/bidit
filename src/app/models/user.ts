export class User {
	_id: number;
	username: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone: string;
	address: {
		street: string;
		city: string;
		country: string;
		zip: number;
	};
	bidderRating: number;
	sellerRating: number;
	admin: boolean;
	approved: boolean;
}