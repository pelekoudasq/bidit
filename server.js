//bring express and body-parser module from node_modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//system module
//const path = require('path');
//const http = require('http');
//const cors = require('cors');

//const jwt = require('./server/routes/jwt');

//Set Port
const port = 3000;

//API file for interacting with mongoDB
const api = require('./server/api');


//Body Parsers middle ware
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(cors());

//app.use(jwt());

//API location
//app.use('/api', api.router);

app.listen(port, function(){
    console.log('Server started on port '+port);
})