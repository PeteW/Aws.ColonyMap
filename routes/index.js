var express = require('express');
var config = require('config');
var aws = require('aws-sdk');
var s3Info = config.get('S3Info');
var router = express.Router();
var xlsx = require('node-xlsx');


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express',
        configVal: config.get('S3Info')
    });
});
/* GET file */
router.get('/file', function(req, res){
    var s3bucket = new aws.S3();
    var buffers = [];
    s3bucket.getObject({Bucket: s3Info.BucketName, Key: s3Info.ExcelFileName})
        .on('httpData', function(chunk) { buffers.push(chunk); })
        .on('httpDone', function() {
            var buffer = Buffer.concat(buffers);
            var workbook = xlsx.parse(buffer);
            res.write(JSON.stringify({data: workbook[0].data}));
            res.end();
        }).send();
});
module.exports = router;
