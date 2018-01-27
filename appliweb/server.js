/****************************************************************
Les dépendacnes
****************************************************************/
var express = require('express');
const fs = require('fs');
var http = require('http');
var app = express();
var site = http.createServer(app);
app.use('/', express.static(__dirname+'/build/'));


app.get('/', function(req, res){
    res.sendFile(__dirname+'/build/index.html');
});


/****************************************************************
Port
****************************************************************/
site.listen(8081, function(){
    console.log("server running 8081");
});

