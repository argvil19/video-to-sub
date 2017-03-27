var express = require('express');
var router = express.Router();
var exec = require('child-process-promise').exec;
var multerPkg = require('multer');
var storage = multerPkg.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.mp4');
    }
});
var multer = multerPkg({
    storage: storage
});
var subParser = require('subtitles-parser');
var fs = require('fs');
var cdn = require('cdn');

router.post('/API/parse', multer.single('video'), function(req, res, next) {
    const appPath = process.cwd();
    
    exec('autosub uploads/' + req.file.filename + ' -F srt -S en -D en')
        .then(function(out) {
            
            cdn(req.file.path, function(err, urlVideo) {
                if (err) {
                    return res.status(500).send({
                        message: 'Failed to upload video to CDN',
                        status: 500,
                        success: false
                    });
                }
                fs.readFile('./uploads/' + req.file.filename.slice(0, -4) + '.srt', 'utf-8', function(err, data) {
                    var subStr = subParser.fromSrt(data);
                    
                    res.status(200).send({
                        success: true,
                        data: {
                            videoLink: urlVideo,
                            videoSubs: subStr
                        }
                    });
                    
                    fs.unlink(req.file.path);
                    fs.unlink(req.file.path.slice(0, -4) + '.srt');
                });
            })
        })
        .catch(function(err) {
            fs.unlink(req.file.path);
            return res.status(500).send({
                message: 'Internal error or no audio detected. Error: ' + err.stderr,
                success: false,
                status: 500
            });
        });
});

module.exports = router;
