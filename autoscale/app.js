const http = require('http');
const request = require('request');
const host = "52.47.75.66";

const health = {
  hostname: host,
  port: 8080,
  path: '/health',
  method: 'GET',
};

const upProxy = {
    url: "http://"+host+":8000/v1/orbiter/handle/autoswarm/stack-test_proxy/up",
    method: 'POST',
};

const downProxy = {
	url: "http://"+host+":8000/v1/orbiter/handle/autoswarm/stack-test_proxy/down",
  	method: 'POST',
};

const upAppliweb = {
	url: "http://"+host+":8000/v1/orbiter/handle/autoswarm/stack-test_appliweb/up",
	method: 'POST',
};

const downAppliweb = {
	url: "http://"+host+":8000/v1/orbiter/handle/autoswarm/stack-test_appliweb/down",
	method: 'POST',
};

Status();
setInterval(Status, 1000);

var countLeger = 0;
function Status(){
	http.get(health, function(resp){
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			etat = JSON.parse(chunk);
			if(etat.total_count != 0){
				moynbreponse = etat.total_status_code_count["200"] / etat.total_count;
				console.log(etat.average_response_time_sec);
				if(moynbreponse < 0.95 || etat.average_response_time_sec > 0.030){
					request(upProxy, function (error, response, body) {
						if (error) throw new Error(error);
					});
					request(upAppliweb, function (error, response, body) {
						if (error) throw new Error(error);
					});
				}
				else if(countLeger == 10){
					request(downProxy, function (error, response, body) {
						if (error) throw new Error(error);
					});
					request(downAppliweb, function (error, response, body) {
						if (error) throw new Error(error);
					});
					countLeger = 0;
				}
				else{
					countLeger++;
				}
			}
		});
	}).on("error", function(e){
  		console.log("Got error: " + e.message);
	});
}
