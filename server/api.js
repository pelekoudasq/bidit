const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://admin:okokokok@83.212.99.101:27017/biditdb');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./user.model');

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

router.get('/users', function(req, res, next) {
	db.Users.find(function(err, users) {
		if(err) {
			res.send(err);
		}
		res.json(users);
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

module.exports = {
	router : router,
	getById: getById
}
