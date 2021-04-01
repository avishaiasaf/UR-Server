const express = require('express');
const path = require('path');

const app = new express();
const port = 3000;
const router = require('./routes/router.js');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(__dirname + '/public'));

app.use('/', router);

app.listen(port, ()=>{
    console.log('listening to port 3000')
})