const express = require('express');
const path = require('path');
const multer = require('multer');
const reportHandler = require('./public/javascripts/reportHandler');

const app = new express();
const port = 3000;
const router = require('./routes/router.js');

app.use(express.static(__dirname + '/files'));
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
//var upload = multer({ dest: 'uploads/' })
var cpUpload = upload.fields([{ name: 'iniFile', maxCount: 1 }, { name: 'bkmvFile', maxCount: 1 }])
app.post('/analyze_report', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
  //var ini = Buffer.from(req.files['iniFile'][0].buffer).toString("utf-8");
  var ini = Buffer.from(req.files['iniFile'][0].buffer).toString("utf-8");
  var bkmv = Buffer.from(req.files['bkmvFile'][0].buffer).toString("utf-8");

  reportHandler.ini = ini;
  reportHandler.bkmvdata = bkmv;
  reportHandler.init();
  var record = reportHandler.tran_ids
  setTimeout(()=>{
    //res.send(record); //Buffer.from(iniFile[0].buffer).toString("utf-8");
    res.render('explore', {title: 'Explore', caption: 'Explore Company Report', options: record})
  }, 1500);
  
});

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(__dirname + '/public'));

app.use('/', router);

app.listen(port, ()=>{
    console.log('listening to port 3000')
})