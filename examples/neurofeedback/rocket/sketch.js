

var muse;

//initialize museData
var dummy = true;

var done = false;


var thresh = dynamicThreshold();


var rocket = null;
var planets = [];
var nrPlanets = 1000;


var universeWidth = 500;
var universeHeight = 10000;

var rocketimg = null;

function preload() {
  rocketimg = loadImage("assets/rocket.png");
}



function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	//data connection to muse with sampling rate of muse
	if (dummy) {
		console.log('using dummy data');
		muse = museData().dummyData(1 / 250);
	} else {
		var museAddress = 'http://127.0.0.1:8081';
		console.log('trying to connect to muse on ' + museAddress);
		muse = museData().connection(museAddress);
	}

	//listen to the messages we are interested in 
	muse.listenTo('/muse/elements/alpha_relative');
	muse.listenTo('/muse/elements/beta_relative');
	muse.listenTo('/muse/elements/theta_relative');

	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');
	
	rocket = createRocket(universeWidth/2,0,rocketimg);

	for(var i=0; i<nrPlanets; i++){
		var p = createPlanet(random(0,universeWidth),random(0,universeHeight));
		planets.push(p);
	}

	frameRate(30);
	imageMode(CENTER);

}


function draw() {

	background(255);

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}


	rocket.update();


	//fill('red');
	//ellipse(rocket.pos.x,rocket.pos.y,50,50);

	var clipDist = 100;
	var sx = map(rocket.pos.x,rocket.pos.x-clipDist,rocket.pos.x+clipDist,0,width);
	var sy = map(rocket.pos.y,rocket.pos.y-clipDist,rocket.pos.y+clipDist,height,0);

	//ellipse(rocket.pos.x,rocket.pos.y,50,50);
	//fill('green');
	//ellipse(sx,sy,50,50);
	rocket.draw(sx,sy);


	planets.forEach(function(p){
		var sx = map(p.pos.x,rocket.pos.x-clipDist,rocket.pos.x+clipDist,0,width);
		var sy = map(p.pos.y,rocket.pos.y-clipDist,rocket.pos.y+clipDist,height,0);

		if(sx>0 && sx<width && sy>0 && sy < height){
		fill(0);
		ellipse(sx,sy,50,50);
		}
	});


	text(rocket.pos.y,20,height-100);

}

function createPlanet(x,y){
	var p = {
		pos: createVector(x,y)
	};

	return p;
}

function createRocket(x,y,img){

	var rock = {
		pos: createVector(x,y),
		vel: createVector(0,0),
		thrust: function(d){
			this.vel.set(0,d);
		},
		update: function(){
			this.pos.add(this.vel);
		},
		image: img,
		draw: function(x,y){

			image(img,x,y,300,300);
		}
	};


	return rock;
}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(window.innerWidth, window.innerHeight);
	console.log('width', width, 'height', height);
	console.log(select('#chart'));
}

function keyTyped(){

	if(key=='q'){
		rocket.thrust(-1);
	}
	else if(key == 'w'){
		rocket.thrust(1);
	}
	else if(key == 'r'){
		rocket.thrust(0);
	}
}

//this needs to be part of a helper library together with sum and mean maybe median also
function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}


function dynamicThreshold(val) {

	var values = [];
	var thres = val || 0.5;

	var step = 0.01;
	//how many measurements to take into account
	var n = 1000;

	function my() {

	}

	my.threshold = function(val) {
		if (val) {
			values.push(val);
		}

		//console.log('values',values);

		while (values.length > n) {
			values.shift();
		}

		/*if(values.length<n){
			return thres;
		}*/

		var _mean = mean(values);
		//console.log('mean',_mean);
		/*
				if(_mean>thres){
					thres+=step;
				}
				else if(_mean<thres){
					thres-=step;
				}*/


		thres = 0.85 * _mean;
		return thres;
	}

	return my;
}