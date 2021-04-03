const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const reportHandler = require('../public/javascripts/reportHandler');

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
//var upload = multer({ dest: 'uploads/' })
var cpUpload = upload.fields([{ name: 'iniFile', maxCount: 1 }, { name: 'bkmvFile', maxCount: 1 }])

router.post('/analyze_report', cpUpload, function (req, res, next) {
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
  var summary_c100 = reportHandler.summary_c100;
  var summary_d110 = reportHandler.summary_d110;
  var summary_d120 = reportHandler.summary_d120;
  setTimeout(()=>{
    //res.send(record); //Buffer.from(iniFile[0].buffer).toString("utf-8");
    res.render('explore', {title: 'Explore', caption: 'Explore Company Report', 
            options: record, c100: summary_c100, d110: summary_d110, d120: summary_d120});
    console.log(summary_d110);
  }, 1500);
  
});


router.get('/', (req, res)=>{
    res.render('index', {title: 'Home', caption: 'Home'});
});

router.get('/explore', (req, res)=>{
    res.render('explore', {title: 'Explore', caption: 'Explore Company Report'})
})

router.get('/about', (req, res)=>{
    console.log('redirected to about page')
    res.render('about', {title: 'About', caption: 'About'})
})

router.use('/', (req, res)=>{
    console.log('redirected to 404 page')
    res.status(404).render('error', {title: 'Error 404', caption: 'Error 404 - Page Not Found'});
})

module.exports = router;