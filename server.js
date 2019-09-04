const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//system module

const jwt = require('./server/jwt');
app.use(jwt());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://localhost:4200");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
	next();
});

//Set Port
const port = 3000;

//API file for interacting with mongoDB
const api = require('./server/api');

//Body Parsers middle ware
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));

//API location
app.use('/api', api.router);

app.listen(port, function(){
    console.log(`Server started on port ${port}`);
})