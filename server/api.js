const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://admin:okokokok@83.212.99.101:27017/biditdb');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./user.model');

router.get('/users', function(req, res, next) {
    console.log('api: get users');
    db.Users.find(function(err, users) {
        if(err) {
            res.send(err);
        }
        //console.log(users);
        res.json(users);
    });
});

async function compareStuff(user, password){
	if(user){
		console.log('User with this username found');
		console.log(password + ' ' + user.password);
		if (bcrypt.compareSync(password, user.password)){
			console.log('Correct password ' );
			const token = jwt.sign({ sub: user.id }, config.secret); // <==== The all-important "jwt.sign" function
			const userObj = new User(user);
			const { password, ...userWithoutHash } = userObj.toObject();
			//console.log('TOKEN: '+token);
			//console.log(userObj);
			//console.log(userWithoutHash);
			return {
				...userWithoutHash,
				token
			};
		} else {
			console.log('Wrong pswd');
		}
	}
}

router.post('/users/authenticate', function(req, res, next) {
	console.log('api: authenticate');
	db.Users.findOne({ username: req.body.username }, function(err, user) {
		compareStuff(user, req.body.password)
			.then(userRes => userRes ? res.json(userRes) : res.status(400).json({ message: 'Username or password is incorrect' }))
			.catch(err => next(err));
	});
});

module.exports = {
    router : router
}