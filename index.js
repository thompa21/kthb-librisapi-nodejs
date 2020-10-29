require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const VerifyToken = require('./VerifyToken');

const app = express();

const config = {}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS

app.use(function (req, res, next) {
	var whitelist = ['kth.se', 'lib.kth.se', 'apps.lib.kth.se', 'apps-ref.lib.kth.se']
	/*  
	var origin = req.get('origin');
	whitelist.forEach(function(val, key){
		if (origin.indexOf(val) > -1){
			res.setHeader('Access-Control-Allow-Origin', origin);
		}
	});
	*/
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization, x-access-token");
	next();
});


var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res) {
	res.send('Hello! The API is at https://lib.kth.se/libris/api/v1');
});

apiRoutes.get("/librisholding/", VerifyToken, function(req , res, next){

	
	
	for (let k = 0; k < req.body.bib.network_number.length; k++) {
		if(req.body.bib.network_number[k] != '') {
			if(req.body.bib.network_number[k].indexOf('(LIBRIS)') !== -1 ) {
				//sök på librismärkt id i första hand
				currentid = req.body.bib.network_number[k].substr(8, req.body.bib.network_number[k].length)
				/*
				response4 = await libris.findHoldinguri(req.body.bib.network_number[k].substr(8, req.body.bib.network_number[k].length),'bibid')
				if(response4.data.totalItems > 0){
					break;
				}
				*/
				res.json({"currenbibid" : currentid});
				//break;
			} else {
				if(req.body.bib.network_number[k].indexOf('(') === -1 ) {
					currentid = req.body.bib.network_number[k]
					res.json({"currentlibrisid" : currentid});
					//break;
				}
				//response4 = await libris.findHoldinguri(librisidarr[k],'libris3')
			}
		}
	}
	

	/*
    if ((error)) {
        res.status(400).send({ 'result': 'Error: ' + err});
        return;
    }
    if ((!noresult)) {
        res.status(201).send({ 'result': 'kthid ' + req.params.kthid + ' not found'});
        return;
    }
    if(result) {
        res.json({"ugusers" : results.users});
    } else {
        res.json({'result': 'nothing'});
	}
	*/
});

apiRoutes.get("/librisholding/:librisid/", VerifyToken, function(req, res, next){
    
});

apiRoutes.post("/librisholding", VerifyToken, function(req, res) {
	
});

apiRoutes.delete("/librisholding", VerifyToken, function(req, res) {
});

app.use('/libris/api/v1', apiRoutes);

var server = app.listen(process.env.PORT || 3002, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});