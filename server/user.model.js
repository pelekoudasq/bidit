const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: Number, required: true },
    bidderRating: { type: Number, required: true },
    sellerRating: { type: Number, required: true },
    admin: { type: Boolean, required: true },
    approved: { type: Boolean, required: true },
	address: {
		street: { type: String, required: true },
		city: { type: String, required: true },
		country: { type: String, required: true },
        zipcode: { type: Number, required: true },
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
    },
    afm: { type: Number, required: true },
    chats: { type: Array, required: false }
//    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);