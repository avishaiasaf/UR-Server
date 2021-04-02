const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/', (req, res)=>{
    res.render('index', {title: 'Home', caption: 'Unified Report Simulator'});
});

router.get('/explore', (req, res)=>{
    res.render('explore', {title: 'Explore', caption: 'Explore Company Report'})
})


router.use('/', (req, res)=>{
    res.status(404).render('error', {title: 'Error 404', caption: 'Error 404 - Page Not Found'});
})

module.exports = router;