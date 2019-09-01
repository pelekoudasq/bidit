export class User {
	_id: string;
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
		zipcode: string;
		longitude: number;
		latitude: number;
	};
	afm: number;
	bidderRating: number;
	sellerRating: number;
	admin: boolean;
	approved: boolean;
	chats: any[];
}
