const mongoose = require('mongoose');
const Bid = require('./bid.model');
const Schema = mongoose.Schema;

const schema = new Schema({
	name: { type: String, unique: true, required: true },
    currently: { type: Number, required: true },
    first_bid: { type: Number, required: true },
    buy_price: { type: Number, required: false },
    number_of_bids: { type: Number, default: 0 },
    bids: { type: [mongoose.Schema.Types.Bid], required: false },
    location: { type: String, required: true },
    country: { type: String, required: true },
    started: { type: Date, required: false },
    ends: { type: Date, required: false },
    seller_id: { type: Number, required: true },
    description: { type: String, required: false }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Auction', schema);