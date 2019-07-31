const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    auction_id: { type: Number, required: true },
    bidder_id: { type: Number, required: true },
    time: { type: Date, default: Date.now },
    amount :{ type: Number, required: true }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Bid', schema);