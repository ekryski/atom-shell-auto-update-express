var ATOMUPDATER = (function(my) {
    var fs = require("fs")
    var path = require("path")
    var request = require("request")
    var zlib = require("zlib")
    var tar = require("tar")
    var asar = require("asar")

	var tempdir = "tmp" // this needs to exist and be writeable
	
    my.checkforupdate = function(author,repo,tag,res) {
        request({
            method: "GET",
            headers: {
                'User-Agent': 'request' // GitHub demands a user-agent of some sort so...
            },
            uri: "https://api.github.com/repos/" + author + "/" + repo + "/releases"
        }, function(err, resp, data) {
            if (!err && data.length) {
                var dataobj = JSON.parse(data)
                if (dataobj.message)
                    res.send("Error: message from GitHub --> " + dataobj.message)
                else if (dataobj.length) {
                    for (var d = 0; d < dataobj.length; d++) {
                        if (!dataobj[d].prerelease) {
                            var latest = dataobj[d]["tag_name"]
                            var src = path.join(tempdir,latest) // create a subdir for this release 
                            var dest = path.join(tempdir,"app.asar")
                            if (!tag || latest != tag) {
                                res.attachment("app.asar." + latest) // forces the name if downloading via a browser
                                req = request("http://github.com/" + author + "/" + repo + "/archive/" + latest + ".tar.gz")
									.pipe(zlib.createGunzip())
									.pipe(tar.Extract({path: src,strip: 1})) // we strip 1 level to remove the top-level directory GitHub adds
									.on("end", function () {
										asar.createPackage(src, dest, function() {
											var filestream = fs.createReadStream(dest);
											filestream.pipe(res);
                                    })
                                })
                            } else {
                                res.send(null) // no update available
                            }
                            break;
                        }
                    }
                } else {
                    res.send("Error: Cannot find releases for (" + author + "/" + repo + ") on GitHub")
                }
            }
        })
    }
    return my;

}(ATOMUPDATER||{}));

module.exports = ATOMUPDATER;