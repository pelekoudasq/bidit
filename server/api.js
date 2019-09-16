const config = require('./config.json');
const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs(config.dburi);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require("fs");
const redis = require("redis");

const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

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

//Get all users
router.get('/users', function(req, res, next) {
	db.Users.find(function(err, users) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(users);
	});
});

//Find user by id
router.get('/user/:id', function(req, res, next) {
	console.log('api: user by Id ' + req.params.id);
	db.Users.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, user) {
		if (err) {
			// console.log(err);
			res.send(err);
			return;
		}
		// console.log(user);
		res.json(user);
	});
});

//Get all auctions
router.get('/auctions', function(req, res, next) {
	console.log("api: auctions");
	db.Auctions.find(function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(auctions);
	});
});

//Get active auctions
router.get('/activeauctions', function(req, res, next) {
	console.log("api: active auctions");
	db.Auctions.find({ started: true }, function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(auctions);
	});
});

//Get auctions by category
router.get('/auctionscat/:cat', function(req, res, next) {
	console.log("api: auctions by category");
	db.Auctions.find({ "categories": { $in: [req.params.cat]} },function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		// console.log(auctions)
		res.json(auctions);
	});
});

//Get x most famous active
router.get('/topauctions', function(req, res, next) {
	console.log('api: top auctions');
	db.Auctions.find({ started: true }).sort({ visits: -1 }).limit(3, function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(auctions);
	})
});

//Get auctions by search text
router.get('/auctionstext/:text', function(req, res, next) {
	console.log("api: auctions by search text");
	db.Auctions.find({ $text: { $search: req.params.text}, started: true },function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		// console.log(auctions)
		res.json(auctions);
	});
});

//Get auctions by filters
router.post('/auctionsfilter', function(req, res, next) {
	console.log("api: auctions by filters");
	let query = {};
	query['$and'] = [];
	if(req.body.params.text != null)
		query['$and'].push({ $text: { $search: req.body.params.text }});
	if(req.body.params.region != null)
		query['$and'].push({ location: { name: req.body.params.region }});
	if(req.body.params.minprice != null && req.body.params.maxprice != null)
		query['$and'].push({ currently: { $gt: Number(req.body.params.minprice), $lt: Number(req.body.params.maxprice) }});
	else if(req.body.params.minprice != null)
		query['$and'].push({ currently: { $gt: Number(req.body.params.minprice) }});
	else if(req.body.params.maxprice != null)
		query['$and'].push({ currently: { $lt: Number(req.body.params.maxprice) }});
	if (req.body.params.category != null)
		query['$and'].push({ categories: { $in: [req.body.params.category] }});
	query['$and'].push({ started: true});
	console.log(query);
	db.Auctions.find(query,
	function(err, auctions) {
		if (err) {
			console.log(err);
			res.send(err);
			return;
		}
		console.log(auctions.length);
		res.json(auctions);
	});
});

//Find auctions by seller_id
router.get('/auctions/:id', function(req, res, next) {
	console.log('api: auction of user');
	db.Auctions.find({ "seller_id": req.params.id }, function(err, auctions) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(auctions);
	});
});

function cacheAuction(req, res, next) {
  const { id } = req.params.id;

  client.get(req.params.id, (err, auction) => {
    if (err) throw err;

    if (auction !== null) {
    	console.log("found auction in cache");
      res.send(JSON.parse(auction));
    } else {
      next();
    }
  });
}

//Find auction by id
router.get('/auction/:id', cacheAuction, function(req, res, next) {
	console.log('api: auction by Id');
	db.Auctions.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, auction) {
		if (err) {
			res.send(err);
			return;
		}
		client.setex(req.params.id, 2, JSON.stringify(auction));
		res.json(auction);
	});
});

//auction visited
router.post('/auctionvisit', function(req, res, next) {
	console.log('api: auction visited');
	db.Visits.findAndModify({
		query: { user: req.body.userid },
		update: { $push: { auctions: req.body.auctionid } },
		upsert: true
	}, function(err, visit) {
		if (err) {
			res.send(err);
			return;
		}
		db.Auctions.findAndModify({
			query: { _id: mongojs.ObjectID(req.body.auctionid) },
			update: { $inc: { visits: 1 } }
		}, function(err, auction){
			if (err) {
				res.send(err);
				return;
			}
		});
		res.json(visit);
	});
});

function cacheBid(req, res, next) {
  const { id } = req.params.id;

  client.get(req.params.id, (err, bid) => {
    if (err) throw err;

    if (bid !== null) {
    	console.log("found bid in cache");
      res.send(JSON.parse(bid));
    } else {
      next();
    }
  });
}

//Find bid by id
router.get('/bid/:id', cacheBid, function(req, res, next) {
	console.log('api: bid by Id '+req.params.id);
	db.Bids.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, bid) {
		if (err) {
			res.send(err);
			return;
		}
		// console.log(JSON.stringify(bid));
		client.setex(req.params.id, 3600, JSON.stringify(bid));
		res.json(bid);
	});
});

//Find bids by bidder_id
router.get('/bids/:id', function(req, res, next) {
	console.log('api: bid of bidder');
	db.Bids.find({ "bidder_id": req.params.id }, function(err, bids) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(bids);
	});
});

//Authenticate user
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
					zipcode: updUser.zipcode,
					longitude: updUser.longitude,
					latitude: updUser.latitude
				},
				afm: updUser.afm
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
			res.status(400).json({ error: 'This email is already in use' });
			return;
		} else {
			db.Users.findOne({ username: userParam.username }, function(err, user){
				if (user) {
					res.status(400).json({ error: 'This username is already in use' });
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
							zipcode: userParam.zipcode,
							longitude: userParam.longitude,
							latitude: userParam.latitude
						},
						afm: userParam.afm,
						bidderRating: 0,
						sellerRating: 0,
						admin: false,
						approved: false,
						chats: []
					});
					res.send(user);
					return;
				}
			});
		}
	});
});

//Start auction
router.post('/startauction', function(req, res, next) {
	console.log('api: start auction');
	const today = new Date();
	const enddate = new Date(req.body.enddate);
	if (today>enddate){
		res.status(400).json({ error: 'End date must be later of today' });
		return;
	} else {
		db.Auctions.update({ _id: mongojs.ObjectID(req.body.auctionid) }, { $set: { started: true, startingDate: today, endingDate: enddate } }, function(err, auction) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(auction);
		});
	}
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
				location: {
					name: updAuct.location,
					longitude: updAuct.longitude,
					latitude: updAuct.latitude
				},
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

//Delete auction
router.delete('/auctiondelete/:id', function(req, res, next) {
	console.log('api: delete auction');
	db.Auctions.remove({ _id: mongojs.ObjectID(req.params.id) }, function(err, auction) {
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
	// console.log(auctionParams);
	// const base64Data = auctionParams.image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
	// fs.writeFile("arghhhh.jpg", Buffer.from(base64Data, "base64"), function(err) {});
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
		location: {
			name: auctionParams.location,
			longitude: auctionParams.longitude,
			latitude: auctionParams.latitude
		},
		country: auctionParams.country,
		seller_id: req.body.userid,
		description: auctionParams.description,
		photos: auctionParams.photos,
		started: false,
		bought: false,
		visits: 0
	});
	res.send(auction);
	return;
});

//Approve user
router.get('/users/approve/:id', function(req, res, next) {
	console.log('api: post approve');
	db.Users.update({ _id: mongojs.ObjectID(req.params.id) }, { $set: { approved: true } }, function(err, user) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(user);
	});
});

//Disapprove user
router.get('/users/disapprove/:id', function(req, res, next) {
	console.log('api: post disapprove');
	db.Users.update({ _id: mongojs.ObjectID(req.params.id) }, { $set: { approved: false } }, function(err, user) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(user);
	});
});

//Add bid
router.post('/addbid', function(req, res, next) {
	console.log('api: add bid to auction '+ req.body.auctionid);
	const today = new Date();
	db.Auctions.findOne({ _id: mongojs.ObjectID(req.body.auctionid) }, function(err, auction) {
		if (err) {
			res.send(err);
			return;
		}
		if (today > auction.endingDate) {
			res.status(400).json({ error: 'This auction has already been completed' });
			return;
		} else {
			db.Bids.save({
				auction_id : req.body.auctionid,
				bidder_id : req.body.userid,
				time : today,
				amount : req.body.price
			}, function(err, bid) {
				if (err) {
					res.send(err);
					return;
				}
				db.Auctions.update({ _id: mongojs.ObjectID(req.body.auctionid) }, { $push: { bids: bid._id }, $inc: { number_of_bids : 1 }, $set: { currently: bid.amount } }, function(err, user) {
					if (err) {
						res.send(err);
						return;
					}
					res.json(user);
				});
			});
		}
	});
});

//Update chat notify
router.get('/closeauction/:id', function(req, res, next) {
	console.log('api: close auction ' + req.params.id);
	db.Auctions.findAndModify({
		query: { _id: mongojs.ObjectID(req.params.id) },
		update: { $set: { bought: true } }
	}, function(err, auction) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(auction);
	});
});

//Get chat with certain participants
router.post('/getchat', function(req, res, next) {
	console.log('api: chat');
	const participant1 = req.body.participant1id;
	const participant2 = req.body.participant2id;
	db.Chats.findOne({ participants: { $all: [participant1, participant2] } }, function(err, chat) {
		if (err || chat == null) {
			db.Chats.save({
				participants: [participant1, participant2],
			}, function(err, chat) {
				if (err) {
					res.send(err);
					return;
				}
				db.Users.findAndModify({
					query: { _id: mongojs.ObjectID(participant1) },
					update: { $push: { chats: chat._id } }
				}, function(err, user) {
						if (err) {
							res.send(err);
							return;
						}
					});
				db.Users.findAndModify({
					query: { _id: mongojs.ObjectID(participant2) },
					update: { $push: { chats: chat._id } }
				}, function(err, user) {
						if (err) {
							res.send(err);
							return;
						}
					});
				res.json(chat);
			})
		} else {
			res.json(chat);
		}
	});
});

//Send message
router.post('/sendmessage', function(req, res, next) {
	console.log('api: send message');
	const today = new Date();
	db.Chats.findAndModify({
		query: { _id: mongojs.ObjectID(req.body.chat) },
		update: { $set: { notify: null } }
	}, function(err, chat) {
		if (err) {
			res.send(err);
			return;
		}
		db.Messages.save({
			chat : chat._id,
			sender_id : req.body.sender,
			receiver_id: req.body.receiver,
			message : req.body.message,
			read: false,
			time : today
		}, function(err, message) {
			if (err) {
				res.send(err);
				return;
			}
			db.Chats.update({ _id: mongojs.ObjectID(req.body.chat) }, { $push: { messages: message._id } }, function(err, chat) {
				if (err) {
					res.send(err);
					return;
				}
				res.json(chat);
			});
		});
	});
});

function cacheMessage(req, res, next) {
	const { id } = req.body.message_id;

	client.get(req.body.message_id, (err, message) => {
		if (err) throw err;

		if (message !== null) {
			console.log("found message in cache");
			res.send(JSON.parse(message));
		} else {
			next();
		}
	});
}

//Find message by id, change read status
router.post('/message', function(req, res, next) {
	console.log('api: message by Id ' + req.body.message_id);
	db.Messages.findOne({ _id: mongojs.ObjectID(req.body.message_id)}, function(err, message) {
		if (err) {
			res.send(err);
			return;
		}
		if ((req.body.open_id == message.receiver_id) && (message.read == false)) {
			db.Messages.findAndModify({ 
				query: { _id: mongojs.ObjectID(req.body.message_id) },
				update: { $set: { read: true } }
			}, function(err, message) {
				if (err) {
					res.send(err);
					return;
				}
				// // client.setex(req.body.message_id, 3600, JSON.stringify(message));
			});
		}
		// client.setex(req.body.message_id, 3600, JSON.stringify(message));
		res.json(message);
		return;
	});
});

function cacheChat(req, res, next) {
	const { id } = req.params.id;

	client.get(req.params.id, (err, chat) => {
		if (err) throw err;

		if (chat !== null) {
			console.log("found chat in cache");
			res.send(JSON.parse(chat));
		} else {
			next();
		}
	});
}

//Find chat by id
router.get('/chat/:id', function(req, res, next) {
	console.log('api: chat by Id ' + req.params.id);
	db.Chats.findOne({ _id: mongojs.ObjectID(req.params.id) }, function(err, chat) {
		if (err) {
			res.send(err);
			return;
		}
		// console.log(JSON.stringify(chat));
		client.setex(req.params.id, 3600, JSON.stringify(chat));
		res.json(chat);
	});
});

//Update chat notify
router.get('/chatnotified/:id', function(req, res, next) {
	console.log('api: chat notified ' + req.params.id);
	db.Chats.findAndModify({
		query: { _id: mongojs.ObjectID(req.params.id) },
		update: { $set: { notify: null } }
	}, function(err, chat) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(chat);
	});
});

//Find chats by participant's id
router.get('/messages/:id', function(req, res, next) {
	console.log('api: messages by user');
	db.Chats.find({ participants: { $in: [req.params.id] } }, function(err, chats) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(chats);
	});
});

//Find inbox by receiver's id
router.get('/inbox/:id', function(req, res, next) {
	console.log('api: inbox by user');
	db.Messages.find({ receiver_id: { $in: [req.params.id] } }, function(err, messages) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(messages);
	});
});

//Find sent by sender's id
router.get('/sent/:id', function(req, res, next) {
	console.log('api: sent by user');
	db.Messages.find({ sender_id: { $in: [req.params.id] } }, function(err, messages) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(messages);
	});
});

//get notifications
router.get('/notifications/:id', function(req, res, next) {
	console.log('api: notifications by user');
	db.Messages.find({ receiver_id: { $in: [req.params.id] }, read: false }, function(err, messages) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(messages.length);
	});
});

//Get all categories
router.get('/categories', function(req, res, next) {
	console.log('api: categories');	
	db.Categories.find(function(err, cats) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(cats);
	});
});

//Find category by name
router.get('/category/:name', function(req, res, next) {
	console.log('api: category by name ' + req.params.name);
	db.Categories.findOne({ "name": req.params.name }, function(err, cat) {
		if (err) {
			res.send(err);
			return;
		}
		client.setex(req.params.name, 3600, JSON.stringify(cat));
		res.json(cat);
	});
});

module.exports = {
	router : router,
	getById: getById
}
