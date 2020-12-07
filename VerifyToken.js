const jwt = require("jsonwebtoken");
function verifyToken(req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    
    if(req.headers['x-access-token']) {
        //JWT
        jwt.verify(token, process.env.SECRET, function(err, decoded) {
            if (err)
                return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + err.message });
            req.userprincipalname = decoded.id;
            //Skapa ny token för varje validerad request
            req.token = jwt.sign({ id: req.userprincipalname }, process.env.SECRET, {
                expiresIn: "7d"
            });
            next();
        });
    } else {
        //APIKEY
        if(token != process.env.APIKEYREAD){
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
            next();
        }
    }
}

module.exports = verifyToken;