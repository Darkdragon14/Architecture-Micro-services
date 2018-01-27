/*

*/
//Dependancies
const http = require('http');
const parseString = require('xml2js').parseString;
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "toto"));
const session = driver.session();


//Request to download all platforms
const recupPlatforms = {
  hostname: 'thegamesdb.net',
  port: 80,
  path: '/api/GetPlatformsList.php',
  method: 'GET',
};
//Request to download all Games by platforms
var recupGameByPlatforms = {
  hostname: 'thegamesdb.net',
  port: 80,
  path: '/api/GetPlatformGames.php?platform=',
  method: 'GET',
};
//Request to download details of one game
var recupDetailGame = {
	hostname: 'thegamesdb.net',
  	port: 80,
  	path: '/api/GetGame.php?id=',
  	method: 'GET',
}
//All Platforms
var platform = new Array();
//All Games by platform
var gameByPlatform = new Array();
//counter
var cursorPlatform = 0;
var cursorGame = 0;

var publisher = [];
var dev = [];


http.get(recupPlatforms, function(resp){
	resp.setEncoding('utf8');
	var xml = '';
	//start request
	resp.on('data', function (chunk) {
	    xml += chunk;
	});
	resp.on("error", function(e){
	console.log("Got error: " + e.message);
	});
	//End of request
	resp.on('end', function() {
      	parseString(xml, function(err, result) { 	
	      	for(var i = 0; i < result.Data.Platforms[0].Platform.length; i++){
	      		platform.push({PlatformId: parseInt(result.Data.Platforms[0].Platform[i].id.toString(),10), Platform: result.Data.Platforms[0].Platform[i].name.toString()});
	      		if(i == result.Data.Platforms[0].Platform.length - 1){	
	      			var query = '';
	      			for(var i = 0; i < platform.length; i++){
						query = query + "CREATE (_"+platform[i].Platform.replace(/ /g, "_").replace(/,/g, "_").replace(/&amp;/g,"and").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, "").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Platform {name:'"+platform[i].Platform.replace(/ /g, "_").replace(/,/g, "_").replace(/&amp;/g,"and").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, "").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+"', PlatformId:'"+platform[i].PlatformId+"'})\n";
						if(i == platform.length - 1){
							cypher(query);
						}
					}
	      			setTimeout(RequestGame, 5000);
	      		}
	      	}
      	});
    });
});

function RequestGame(){
	recupGameByPlatforms.path = recupGameByPlatforms.path.substring(0, recupGameByPlatforms.path.lastIndexOf("=")+1) + platform[cursorPlatform].PlatformId;
	http.get(recupGameByPlatforms, function(resp){
		resp.setEncoding('utf8');
		var xml = '';
		//start request
		resp.on('data', function (chunk) {
		    xml += chunk;
		});
		resp.on("error", function(e){
		console.log("Got error: " + e.message);
		});
		//End of request
		resp.on('end', function() {
			parseString(xml, function(err, result) {
				for(var i = 0; i < result.Data.Game.length; i++){
					try{
						gameByPlatform.push({id: parseInt(result.Data.Game[i].id.toString(), 10), GameTitle: result.Data.Game[i].GameTitle.toString(), ReleaseDate: result.Data.Game[i].ReleaseDate.toString()});
					}
					catch(e){
						gameByPlatform.push({id: parseInt(result.Data.Game[i].id.toString(), 10), GameTitle: result.Data.Game[i].GameTitle.toString()});
					}
					if(i == result.Data.Game.length-1){
						setTimeout(RequestDetailGame, 5000);
					}
				}
			});
		});
	});
	cursorPlatform++;
}

function RequestDetailGame(){
	if(cursorGame == gameByPlatform.length && cursorPlatform != platform.length){
		RequestGame();
	}
	else{
		recupDetailGame.path =  recupDetailGame.path.substring(0, recupDetailGame.path.lastIndexOf("=")+1) + gameByPlatform[cursorGame].id;
		http.get(recupDetailGame, function(resp){
			resp.setEncoding('utf8');
			var xml = '';
			//start request
			resp.on('data', function (chunk) {
			    xml += chunk;
			});
			resp.on("error", function(e){
			console.log("Got error: " + e.message);
			});
			//End of request
			resp.on('end', function() {
				parseString(xml, function(err, result) {
					var query1 = '';
					var query2 = '';
					var query3 = '';
					var query4 = '';
 					try{
						gameByPlatform[cursorGame].PlatformId = parseInt(result.Data.Game[0].PlatformId);
						gameByPlatform[cursorGame].Platform = result.Data.Game[0].Platform[0];
						gameByPlatform[cursorGame].Overview = result.Data.Game[0].Overview[0];
						gameByPlatform[cursorGame].Genres = result.Data.Game[0].Genres[0].genre
						gameByPlatform[cursorGame].Publisher = result.Data.Game[0].Publisher[0];
						gameByPlatform[cursorGame].Developer = result.Data.Game[0].Developer[0];
						gameByPlatform[cursorGame].BoxFront = result.Data.Game[0].Images[0].boxart[1]._;
						query1 = "CREATE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/-/g, "").replace(/,/g, "_").replace(/:/g, "_").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/'/g, "").replace(/\(/g, '_').replace("/", '_')+":Game {name:'"+gameByPlatform[cursorGame].GameTitle+"', id:'"+gameByPlatform[cursorGame].id+"', relaeseDate:'"+gameByPlatform[cursorGame].ReleaseDate+"', Overview:'"+gameByPlatform[cursorGame].Overview.replace(/&amp;/g, "and").replace(/'/g, " ")+"', Genres:'"+gameByPlatform[cursorGame].Genres+"', BoxFront:'"+gameByPlatform[cursorGame].BoxFront+"'})\n";
						
						if(publisher.indexOf(gameByPlatform[cursorGame].Publisher) === -1){
							publisher.push(gameByPlatform[cursorGame].Publisher);
							query1 = query1 + "CREATE (_"+gameByPlatform[cursorGame].Publisher.replace(/ /g, "_").replace(/,/g, "_").replace(/:/g, "_").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/'/g, "").replace(/\(/g, '_').replace("/", '_')+":Publisher {name:'"+gameByPlatform[cursorGame].Publisher+"'})\n";
							query1 = query1 + "CREATE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace("/", '_')+")-[:PUBLISHED_BY]->(_"+gameByPlatform[cursorGame].Publisher.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")\n";
						}
						else{
							query2 = query2 + "MATCH (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Game {name: '"+gameByPlatform[cursorGame].GameTitle+"'}),(_"+gameByPlatform[cursorGame].Publisher.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Publisher {name: '"+gameByPlatform[cursorGame].Publisher+"'})\n"
							query2 = query2 + "MERGE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace("/", '_')+")-[:PUBLISHED_BY]->(_"+gameByPlatform[cursorGame].Publisher.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")\n";
						}
						if(dev.indexOf(gameByPlatform[cursorGame].Developer) === -1){
							dev.push(gameByPlatform[cursorGame].Developer);
							query1 = query1 + "CREATE (_"+gameByPlatform[cursorGame].Developer.replace(/ /g, "_").replace(/,/g, "_").replace(/:/g, "_").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/'/g, "").replace(/\(/g, '_').replace("/", '_')+":Developer {name:'"+gameByPlatform[cursorGame].Developer+"'})\n";
							query1 = query1 + "CREATE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")-[:DEVELOPED_BY]->(_"+gameByPlatform[cursorGame].Developer.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")\n";
						}
						else{
							query3 = query3 + "MATCH (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Game {name: '"+gameByPlatform[cursorGame].GameTitle+"'}),(_"+gameByPlatform[cursorGame].Developer.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Developer {name: '"+gameByPlatform[cursorGame].Developer+"'})\n"
							query3 = query3 + "MERGE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")-[:DEVELOPED_BY]->(_"+gameByPlatform[cursorGame].Developer.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")\n";						
						}
						query4 = query4 + "MATCH  (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/\./g, "_").replace(/-/g, "").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, " ").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Game {name: '"+gameByPlatform[cursorGame].GameTitle+"'}),(_"+gameByPlatform[cursorGame].Platform.replace(/ /g, "_").replace(/,/g, "_").replace(/&amp;/g,"and").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, "").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+":Platform {name: '"+gameByPlatform[cursorGame].Platform+"'})\n"
						query4 = query4 + "MERGE (_"+gameByPlatform[cursorGame].GameTitle.replace(/ /g, "_").replace(/,/g, "_").replace(/:/g, "_").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/'/g, " ").replace(/\(/g, '_').replace("/", '_')+")-[:PLAY_ON]->(_"+gameByPlatform[cursorGame].Platform.replace(/ /g, "_").replace(/,/g, "_").replace(/&amp;/g,"and").replace(/-/g, "").replace(/\./g, "_").replace(/&amp;/g, "and").replace(/&/g, "and").replace(/:/g, "_").replace(/'/g, "").replace(/\(/g, '_').replace(/\)/g, '_').replace("/", '_')+")\n";
						cypher(query1);
						if(query2 != ''){
							cypher(query2);
						}
						if(query3 != ''){
							cypher(query3);
						}
						cypher(query4);
					}
					catch(e){
						console.log(e);
						gameByPlatform.splice(cursorGame, 1)
						cursorGame--;
					}
					setTimeout(function(){cursorGame++;}, 1000);
					setTimeout(RequestDetailGame, 5000);
					//cypher(query);
					console.log(query1+"\n"+query2+"\n"+query3+"\n"+query4);
				});
			});
		});	
	}
}

function cypher(query) {
	session.run(query).then(result => {
      	session.close();
    });
}
