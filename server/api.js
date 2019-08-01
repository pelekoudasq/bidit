const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://admin:okokokok@83.212.99.101:27017/biditdb');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./user.model');
const Auction = require('./auction.model');
const Bid = require('./bid.model');

async function getById(id) {
	await db.Users.findOne({_id: id}, function(err, user){
		if(user){
			return user;
		}
		return null;
	});
}

async function compareStuff(user, password){
	if(user){
		if (bcrypt.compareSync(password, user.password)){
			const token = jwt.sign({ sub: user.id }, config.secret); // <==== The all-important "jwt.sign" function
			const userObj = new User(user);
			const { password, ...userWithoutHash } = userObj.toObject();
			return {
				...userWithoutHash,
				token
			};
		} else {
			//console.log('Wrong pswd');
		}
	}
}

// get all users
router.get('/users', function(req, res, next) {
	db.Users.find(function(err, users) {
		if (err) {
			res.send(err);
		}
		res.json(users);
	});
});

// find user by id
router.get('/user/:id', function(req, res, next) {
	console.log('api: user by Id');
	db.Users.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
});

// get all auctions
router.get('/auctions', function(req, res, next) {
	console.log("api: auctions");
	db.Auctions.find(function(err, auctions) {
		if (err) {
			res.send(err);
		}
		res.json(auctions);
	});
});

// find auctions by seller_id
router.get('/auctions/:id', function(req, res, next) {
	console.log('api: auction of user');
	db.Auctions.find({ "seller_id": req.params.id }, function(err, auctions) {
		if (err) {
			res.send(err);
		}
		res.json(auctions);
	});
});

// find auction by id
router.get('/auction/:id', function(req, res, next) {
	console.log('api: auction by Id');
	db.Auctions.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, auction) {
		if (err) {
			res.send(err);
		}
		res.json(auction);
	});
});

// find bid by id
router.get('/bid/:id', function(req, res, next) {
	console.log('api: bid by Id '+req.params.id);
	db.Bids.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, bid) {
		if (err) {
			res.send(err);
		}
		res.json(bid);
	});
});

// find bids by bidder_id
router.get('/bids/:id', function(req, res, next) {
	console.log('api: bid of bidder');
	db.Bids.find({ "bidder_id": req.params.id }, function(err, bids) {
		if (err) {
			res.send(err);
		}
		res.json(bids);
	});
});

router.post('/users/authenticate', function(req, res, next) {
	console.log('api: authenticate');
	db.Users.findOne({ username: req.body.username }, function(err, user) {
		compareStuff(user, req.body.password)
			.then(userRes => userRes ? res.json(userRes) : res.status(400).json({ error: 'Username or password is incorrect' }))
			.catch(err => next(err));
	});
});

//Save a new user
router.post('/users/register', function(req, res, next){
	console.log('api: post register');
	var userParam = req.body;
	db.Users.findOne({ email: userParam.email }, function(err, user){
		if (user){
			res.send(user);
			return;
		} else {
			db.Users.findOne({ username: userParam.username }, function(err, user){
				if (user) {
					res.send(user);
					return;
				} else {
					// hash password
					userParam.password = bcrypt.hashSync(userParam.password, 10);
					// save user
					user = db.Users.save({
						username: userParam.username,
						first_name: userParam.firstName,
						last_name: userParam.lastName,
						email: userParam.email,
						password: userParam.password,
						phone: userParam.phone,
						address: {
							street: userParam.address,
							city: userParam.city,
							country: userParam.country,
							zipcode: userParam.zipcode
						},
						bidderRating: 0,
						sellerRating: 0,
						admin: false,
						approved: false
					});
					res.send(user);
					return;
				}
			});
		}
	});
});

//Save a new auction
router.post('/newauction', function(req, res, next){
	console.log('api: new auction register');
	var auctionParams = req.body;	
	// save auction
	auction = new Auction();
	auction = db.Auctions.save({
		name: auctionParams.productName,
		categories: [],
		currently: auctionParams.startingPrice,
		first_bid: auctionParams.startingPrice,
		buy_price: auctionParams.buyPrice,
		number_of_bids: 0,
		bids: [],
		location: auctionParams.location,
		country: auctionParams.country,
		seller_id: req.body.id,
		description: auctionParams.description
	});
	res.send(auction);
	return;
});

router.get('/users/approve/:id', function(req, res, next) {
	console.log('api: post approve');
	db.Users.update({ _id: mongojs.ObjectID(req.params.id) }, { $set: { approved: true } }, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
});

router.get('/users/disapprove/:id', function(req, res, next) {
	console.log('api: post disapprove');
	db.Users.update({ _id: mongojs.ObjectID(req.params.id) }, { $set: { approved: false } }, function(err, user) {
		if (err) {
			res.send(err);
		}
		res.json(user);
	});
});

module.exports = {
	router : router,
	getById: getById
}
