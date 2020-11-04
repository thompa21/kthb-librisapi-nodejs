require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const VerifyToken = require('./VerifyToken');
const libris = require('./libris')
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
	res.send('Hello! The API is at ' + req.headers.host + '/libris/api/v1');
});

apiRoutes.get("/librisholding/", VerifyToken, async function(req , res, next){
	
	let currentid = "";
	//Finns bibid? "(LIBRIS)"
	for (let k = 0; k < req.body.bib.network_number.length; k++) {
		if(req.body.bib.network_number[k].indexOf('(LIBRIS)') !== -1 ) {
			currentid = req.body.bib.network_number[k].substr(8, req.body.bib.network_number[k].length);
			res.json({"currentbibid" : currentid});
			holdinguri = await libris.findHoldinguri(currentid,'bibid')
			break;
		}
	}

	//Inget bibid hittades
	if (currentid == "") {
		//Finns ett värde som saknar "("? Då anses det vara ett "libris3" id
		for (let k = 0; k < req.body.bib.network_number.length; k++) {
			if(req.body.bib.network_number[k].indexOf('(') === -1 ) {
				currentid = req.body.bib.network_number[k]
				res.json({"currentlibrisid" : currentid});
				holdinguri = await libris.findHoldinguri(currentid,'libris3')
				break;
			}	
		}
	}

	if(holdinguri.data.totalItems > 0){
		for (let j = 0; j < holdinguri.data.items[0]['@reverse'].itemOf.length; j++) {
			if(holdinguri.data.items[0]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/' + process.env.SIGEL){	
				console.log(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'])
				const etag = await libris.getEtag(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'])
				console.log(etag.headers.etag)
				//const deleteholding = await libris.deleteHolding(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'], etag.headers.etag, access_token)
				//console.log(deleteholding.data)
			}
		}
	} else {
		console.log(holdinguri)
		console.log('No holding found!!! id:' + currentid)
	}
	
});

apiRoutes.get("/librisholding/:librisid/", VerifyToken, function(req, res, next){
    
});

apiRoutes.post("/librisholding", VerifyToken, function(req, res) {
	
});

apiRoutes.delete("/librisholding/", VerifyToken, async function(req , res, next){
	let currentid = "";
	//Finns bibid? "(LIBRIS)"
	for (let k = 0; k < req.body.bib.network_number.length; k++) {
		if(req.body.bib.network_number[k].indexOf('(LIBRIS)') !== -1 ) {
			currentid = req.body.bib.network_number[k].substr(8, req.body.bib.network_number[k].length);
			res.json({"currentbibid" : currentid});
			holdinguri = await libris.findHoldinguri(currentid,'bibid')
			break;
		}
	}

	//Inget bibid hittades
	if (currentid == "") {
		//Finns ett värde som saknar "("? Då anses det vara ett "libris3" id
		for (let k = 0; k < req.body.bib.network_number.length; k++) {
			if(req.body.bib.network_number[k].indexOf('(') === -1 ) {
				currentid = req.body.bib.network_number[k]
				res.json({"currentlibrisid" : currentid});
				holdinguri = await libris.findHoldinguri(currentid,'libris3')
				break;
			}	
		}
	}

	if(holdinguri.data.totalItems > 0){
		for (let j = 0; j < holdinguri.data.items[0]['@reverse'].itemOf.length; j++) {
			if(holdinguri.data.items[0]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/' + process.env.SIGEL){	
				console.log(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'])
				const etag = await libris.getEtag(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'])
				console.log(etag.headers.etag)
				//const deleteholding = await libris.deleteHolding(holdinguri.data.items[0]['@reverse'].itemOf[j]['@id'], etag.headers.etag, access_token)
				//console.log(deleteholding.data)
			}
		}
	} else {
		console.log(holdinguri)
		console.log('No holding found!!! id:' + currentid)
	}
	
});

app.use('/libris/api/v1', apiRoutes);

var server = app.listen(process.env.PORT || 3002, function () {
    var port = server.address().port;
	console.log("App now running on port", port);
});