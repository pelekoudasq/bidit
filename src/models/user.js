import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	phone: { type: Number, required: true },
	address: [{
		street: { type: String, required: true },
		city: { type: String, required: true },
		country: { type: String, required: true },
		zip: { type: Number, required: true },
	}],
	sellerRating: { type: Number, default: 0 },
	bidderRating: { type: Number, default: 0 },
	admin: { type: Boolean, default: false },
	seller: { type: Boolean, required: true },
	bidder: { type: Boolean, required: true },
	approved: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

export default User;
