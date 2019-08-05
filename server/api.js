const config = require('./config.json');
const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs(config.dburi);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require("fs");
// const multer = require('multer');
// const Grid = require('gridfs-stream');
// const mongo = require('mongodb');
// const crypto = require('crypto');
// const path = require('path');
// const GridFsStorage = require('multer-gridfs-storage');

const User = require('./user.model');
const Auction = require('./auction.model');
const Bid = require('./bid.model');

// // stream
// const gfs = Grid(db, mongo);
// gfs.collection('Uploads');

// // storage engine
// const storage = new GridFsStorage({
// 	url: config.dburi,
// 	file: (req, file) => {
// 		return new Promise((resolve, reject) => {
// 			crypto.randomBytes(16, (err, buf) => {
// 				if (err) {
// 					return reject(err);
// 				}
// 				const filename = buf.toString('hex') + path.extname(file.originalname);
// 				const fileInfo = {
// 					filename: filename,
// 					bucketName: 'Uploads'
// 				};
// 				resolve(fileInfo);
// 			});
// 		});
// 	}
// });
// const upload = multer({ storage });

// router.post('/upload', upload.single('file'), (req, res) => {
// 	res.json({ file: req.file });
// })

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

//Update user
router.post('/userupdate', function(req, res, next) {
	console.log('api: update user');
	const updUser = req.body.user;
	updUser.password = bcrypt.hashSync(updUser.password, 10);
	db.Users.update({ _id: mongojs.ObjectID(req.body.userid) }, { 
			$set: {
				username: updUser.username,
				email: updUser.email,
				password: updUser.password,
				first_name: updUser.firstName,
				last_name: updUser.lastName,
				phone: updUser.phone,
				address: {
					street: updUser.address,
					city: updUser.city,
					country: updUser.country,
					zipcode: updUser.zipcode
				}
			} 
		}, function(err, user) {
		if (user) {
			res.send(user);
			return;
		}
	});
});

//Save a new user
router.post('/users/register', function(req, res, next){
	console.log('api: post register');
	const userParam = req.body;
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

router.get('/startauction/:id', function(req, res, next) {
	console.log('api: start auction');
	const today = new Date();
	db.Auctions.update({ _id: mongojs.ObjectID(req.params.id) }, { $set: { started: true, startingDate: today } }, function(err, auction) {
		if (err) {
			res.send(err);
		}
		res.json(auction);
	});
})

//Update auction
router.post('/auctionupdate', function(req, res, next) {
	console.log('api: update auction');
	const updAuct = req.body.auction;
	db.Auctions.update({ _id: mongojs.ObjectID(req.body.auctionid) }, { 
			$set: {
				name: updAuct.productName,
				categories: updAuct.categories,
				first_bid: updAuct.startingPrice,
				buy_price: updAuct.buyPrice,
				location: updAuct.location,
				country: updAuct.country,
				description: updAuct.description,
				image: updAuct.image
			} 
		}, function(err, auction) {
		if (auction) {
			res.send(auction);
			return;
		}
	});
});

//Save a new auction
router.post('/newauction', function(req, res, next) {
	console.log('api: new auction register');
	// console.log(req.body.userid);
	const auctionParams = req.body.auction;
	// console.log(auctionParams);
	const base64Data = auctionParams.image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
	fs.writeFile("arghhhh.jpg", Buffer.from(base64Data, "base64"), function(err) {});
	// save auction
	// auction = new Auction();
	auction = db.Auctions.save({
		name: auctionParams.productName,
		categories: auctionParams.categories,
		currently: auctionParams.startingPrice,
		first_bid: auctionParams.startingPrice,
		buy_price: auctionParams.buyPrice,
		number_of_bids: 0,
		bids: [],
		location: auctionParams.location,
		country: auctionParams.country,
		seller_id: req.body.userid,
		description: auctionParams.description,
		image: auctionParams.image,
		started: false
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
