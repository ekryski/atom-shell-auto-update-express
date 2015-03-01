var express = require('express')
    , ATOMUPDATER = require("./mods/atomupdater")
    , app = express();

var port = 44444 // whatever you like really...

app.use(express.json());
app.use(express.urlencoded());

app.use(function(req, res, next) {   // Prevent any problem with CORS
    res.header('Access-Control-Allow-Origin', '*');
    return next();
});

app.use(function(req, res, next) {   // Parse query string parameters
    if (req.method !== "GET")
        return next();

    for (var val in req.query)
        req.body[val] = req.query[val]

    return next();
});

app.use(app.router);

app.all("/updater", function (req, res, next) {
	// In here you probably want to check that author and repo are supplied/valid - tag is optional
    ATOMUPDATER.checkforupdate(req.body.author,req.body.repo,req.body.tag,res)
})

app.launchServer = function() {
    app.listen(port)
};

// Interface
module.exports = app;