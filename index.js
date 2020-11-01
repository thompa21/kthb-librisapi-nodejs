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
	res.send('Hello! The API is at https://lib.kth.se/libris/api/v1');
});

apiRoutes.get("/librisholding/", VerifyToken, async function(req , res, next){
	
	let currentid = "";
	//Finns "(LIBRIS)"?
	for (let k = 0; k < req.body.bib.network_number.length; k++) {
		if(req.body.bib.network_number[k].indexOf('(LIBRIS)') !== -1 ) {
			currentid = req.body.bib.network_number[k].substr(8, req.body.bib.network_number[k].length);//req.body.bib.network_number[k]
			res.json({"currentbibid" : currentid});
			response4 = await libris.findHoldinguri(currentid,'bibid')
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
				response4 = await libris.findHoldinguri(currentid,'libris3')
				break;
			}
			
		}
	}
	console.log(response4)

	if(response4.data.totalItems > 0){
		for (let j = 0; j < response4.data.items[0]['@reverse'].itemOf.length; j++) {
			if(response4.data.items[0]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/T'){
				
				console.log(response4.data.items[0]['@reverse'].itemOf[j]['@id'])
				const response2 = await libris.getEtag(response4.data.items[0]['@reverse'].itemOf[j]['@id'])
				etag = response2.headers.etag
				console.log(response2.headers.etag)
				json_payload = JSON.stringify(response2.data)
				console.log(response2.data)
				
				//const response3 = await libris.updateHolding(response4.data.items[0]['@reverse'].itemOf[j]['@id'], etag, access_token, json_payload)
				//console.log(response3.data)
				//const response5 = await libris.deleteHolding(response4.data.items[0]['@reverse'].itemOf[j]['@id'], etag, access_token)
				//console.log(response5.data)
				
			}
		}
	} else {
		console.log('No holding found!!! id:' + currentid)
	}
	
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