const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs('mongodb://admin:okokokok@83.212.99.101:27017/admin');

router.get('/users', function(req,res,next){
    console.log('api: get users');
    db.Users.find(function(err,users){
        if(err){
            res.send(err);
        }
        res.json(users);
    });
});

module.exports = {
    router : router
}