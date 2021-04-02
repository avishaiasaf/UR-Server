const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'files/');
    },

    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

router.get('/', (req, res)=>{
    res.render('index', {title: 'Home', caption: 'Unified Report Simulator'});
});

router.get('/explore', (req, res)=>{
    res.render('explore', {title: 'Explore', caption: 'Explore Company Report'})
})

router.post('/analyze_report', (req, res)=>{
    let upload = multer({ storage: storage }).fields([{name:'ini'},{name:'bkmv'}]);
    upload(req, res, function(err){
        //console.log(req.file, req.body);
        res.render('explore', {title: 'Explore', caption: 'Explore Company Report'})
        //res.send(`You have uploaded this file: <hr/><a href="${req.file.path}">File</a>`)
    })
})

router.use('/', (req, res)=>{
    res.status(404).render('error', {title: 'Error 404', caption: 'Error 404 - Page Not Found'});
})

module.exports = router;