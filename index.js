require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const VerifyToken = require('./VerifyToken');
const libris = require('./libris')
const cors = require('cors');
const app = express();

const config = {}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS
var allowedOrigins = ['http://localhost:3000',
					  'http://localhost:4200',
                      'https://apps.lib.kth.se'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  exposedHeaders: ['Authorization'],
  methods: "GET,PUT,POST,DELETE"
}));

async function deletebyholding(holdinguri, res, req) {
	if(holdinguri.data.totalItems > 0){
		//gå igenom items och hitta "@type": "Instance"
		for (let i = 0; i < holdinguri.data.items.length; i++) {
			if (holdinguri.data.items[i]["@type"] == "Instance") {
				if (typeof holdinguri.data.items[i]['@reverse'] !== 'undefined') {
					//Endast de som är KTH-innehav(SIGEL)
					for (let j = 0; j < holdinguri.data.items[i]['@reverse'].itemOf.length; j++) {
						if(holdinguri.data.items[i]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/T'
						|| holdinguri.data.items[i]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/Te'
						|| holdinguri.data.items[i]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/Tct'
						|| holdinguri.data.items[i]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/Ta'
						|| holdinguri.data.items[i]['@reverse'].itemOf[j].heldBy['@id'] == 'https://libris.kb.se/library/Tdig'){
							try {
								const etag = await libris.getEtag(holdinguri.data.items[i]['@reverse'].itemOf[j]['@id'])
								const deleteholding = await libris.deleteHolding(holdinguri.data.items[i]['@reverse'].itemOf[j]['@id'], etag.headers.etag, access_token)
								res.json({"holding" : "Deleted"});
								break;
							}
							catch (e) {
								//TODO Övriga fel?
								if(e.response.status == 410) {
									res.json({"holding" : "Resurs hittades inte, id: "  + req.params.id});
									break;
								};
								if(e.response.status == 403) {
									res.json({"holding" : "You don't have the permission to access the requested resource, id: "  + req.params.id});
									break;
								};
								if(e.response.status == 404) {
									res.json({"holding" : "Error deleting, id: "  + req.params.id});
									break;
								};
							}
						}
					}
				} else {
					res.json({"holding" : "No reverse, id: " + req.params.id});
				}
				break;
			}
		}
	} else {
		res.json({"holding" : "Hittades inte, id: " + req.params.id});
	}
}

var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res) {
	res.send('Hello! The API is at ' + req.headers.host + '/libris/api/v1');
});

apiRoutes.get("/librishhhhhholding/", VerifyToken, async function(req , res, next){
});

apiRoutes.get("/librisholding/:librisid/", VerifyToken, function(req, res, next){
});

/* Create holding */
apiRoutes.post("/librisholding", VerifyToken, function(req, res) {
	
});

/* Delete holding from bibid */
apiRoutes.delete("/librisholding/bibid/:id", VerifyToken, async function(req , res, next){
	const response = await libris.getToken()
	access_token = response.data.access_token
	console.log("Delete start")
	holdinguri = await libris.findHoldinguri(req.params.id,'bibid')
	deleteuri = await deletebyholding(holdinguri, res, req)
	console.log("Delete end")
	console.log()
});

/* Delete holding from libris 3 id */
apiRoutes.delete("/librisholding/libris3/:id", VerifyToken, async function(req , res, next){
	const response = await libris.getToken()
    access_token = response.data.access_token
	console.log("Delete start")
	holdinguri = await libris.findHoldinguri(req.params.id,'libris3')
	deleteuri = await deletebyholding(holdinguri, res, req)
	console.log("Delete end")
	console.log()
});

app.use('/libris/api/v1', apiRoutes);

var server = app.listen(process.env.PORT || 3002, function () {
    var port = server.address().port;
	console.log("App now running on port", port);
});