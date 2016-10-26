var muse;

//initialize museData
var dummy = true;

var done = false;


var thresh = dynamicThreshold();


var rocket = null;
var planets = [];
var nrPlanets = 100;
var stars = [];
var nrStars = 10000;


var universeWidth = 200;
var universeHeight = 50000;

var rocketimg = null;
var planetimgs = [];
var starImg = null;

var dt = 0.1;
var clipDist = 100;
var earthDiameter = 3000;
var earthX = universeWidth/2;
var earthY = -0.138*earthDiameter;

var maxAlpha = Number.MIN_VALUE;
var minBeta = Number.MAX_VALUE;

function preload() {
	rocketimg = loadImage("assets/rocket.png");
	planetimgs.push(loadImage("assets/planet1.png"));
	planetimgs.push(loadImage("assets/planet2.png"));
	planetimgs.push(loadImage("assets/planet3.png"));
	planetimgs.push(loadImage("assets/planet4.png"));
	planetimgs.push(loadImage("assets/planet5.png"));
	starImg = loadImage("assets/star.png");
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
	//muse.listenTo('/muse/elements/theta_relative');

	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');

	rocket = createRocket(universeWidth / 2, 0, rocketimg);

	for (var i = 0; i < nrPlanets; i++) {
		var p = createPlanet(random(0, universeWidth), random(0, universeHeight), planetimgs[floor(random(0, planetimgs.length))]);
		planets.push(p);
	}

	for (var i = 0; i < nrStars; i++) {
		var s = createStar(random(0, universeWidth), random(0, universeHeight), starImg);
		stars.push(s);
	}


	frameRate(30);
	imageMode(CENTER);
	ellipseMode(CENTER);

}


function draw() {

	background(255);

	if(frameCount<30){
		background('black');
		return;
	}

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}

	var alpha_relative = muse.get('/muse/elements/alpha_relative');
	var beta_relative = muse.get('/muse/elements/beta_relative');

	var alphaMean = (alpha_relative.leftEar + alpha_relative.rightEar + alpha_relative.leftFront + alpha_relative.rightFront)/4;
	var betaMean = (beta_relative.leftEar + beta_relative.rightEar + beta_relative.leftFront + beta_relative.rightFront)/4;

	maxAlpha = alphaMean > maxAlpha ? alphaMean : maxAlpha;
	minBeta = betaMean < minBeta ? betaMean : minBeta;

	var score = alphaBeta(alphaMean,betaMean);
	var threshold = thresh.threshold(score);

	var feedback = score - threshold;

	//console.log('score: ' + score);

	//console.log('feedback: ' + feedback);

	var power = map(feedback,-1,1,-30,30);
	//console.log('power ' + power);
	rocket.thrust(power);


	//update rocket positions
	rocket.update(dt);





	//draw stars
	stars.forEach(function(p) {
		var sx = map(p.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
		var sy = map(p.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);

		if (sx > 0 && sx < width && sy > 0 && sy < height) {
			//fill(0);
			//ellipse(sx,sy,50,50);
			p.draw(sx, sy);
		}
	});

	//draw planets
	planets.forEach(function(p) {
		var sx = map(p.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
		var sy = map(p.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);

		if (sx > 0 && sx < width && sy > 0 && sy < height) {
			//fill(0);
			//ellipse(sx,sy,50,50);
			p.draw(sx, sy);
		}
	});

	//draw the earth
	/*var sEarthx = map(earthX, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
	var sEarthy = map(earthY, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);
	fill(0);
	//console.log(sEarthy,sEarthy);
	ellipse(sEarthx,sEarthy,earthDiameter,earthDiameter);*/


	//draw rocket
	var sx = map(rocket.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
	var sy = map(rocket.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);
	rocket.draw(sx, sy);


	//draw text information
	textSize(24);
	text(round(rocket.pos.y), width-100, 100);

	textSize(12);
	text('Vel: ' + nf(rocket.vel,null,1), 20, height - 100);
	text('Acc: ' + nf(rocket.acc,null,1), 20, height - 80);
	text('Threshold: ' + nf(threshold,null,2),20,height-60);
	text('Max Alpha: ' + nf(maxAlpha*100,null,0) + ' %',20,height-40);
	text('Min Beta: ' + nf(minBeta*100,null,0) + ' %',20,height-20);

	text('rocket and planets by lastspark from The Noun Project', width - 300, height - 30)

}

function alphaBeta(alphaValue,betaValue){

	
	//console.log(alphaMean,betaMean)
	return alphaValue-betaValue;
}

function createStar(x, y, img) {
	var p = {
		pos: createVector(x, y),
		image: img,
		rotation: random(0, TWO_PI),
		size: random(3, 20),
		draw: function(x, y) {
			push();
			translate(x, y);
			rotate(this.rotation);
			image(this.image, 0, 0, this.size, this.size);
			pop();
		}
	};

	return p;
}

function createPlanet(x, y, img) {
	var p = {
		pos: createVector(x, y),
		image: img,
		rotation: random(0, TWO_PI),
		size: random(50, 100),
		draw: function(x, y) {
			push();
			translate(x, y);
			rotate(this.rotation);
			image(this.image, 0, 0, this.size, this.size);
			pop();
		}
	};

	return p;
}

function createRocket(x, y, img) {

	var rock = {
		pos: createVector(x, y),
		vel: 0,
		acc: 0,
		maxVel: 50,
		friction: 0.98,
		thrust: function(d) {
			this.acc = d;
			//console.log(d, this.acc);
		},
		update: function(dt) {

			//console.log('this.acc: ' + this.acc);
			this.vel = this.vel + this.acc * dt;
			this.vel = this.vel * this.friction;
			this.vel = constrain(this.vel, 0, this.maxVel);
			this.pos.y = this.pos.y + dt * this.vel;
		},
		image: img,
		draw: function(x, y) {
			push();
			translate(x, y);
			image(this.image, 0, 0);
			pop();
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

function keyPressed() {
	console.log('keyPressed');
	console.log('key:' + key);
	if (key == 'Q') {
		rocket.thrust(-1);
	} else if (key == 'W') {

		rocket.thrust(10);
	} else if (key == 'R') {
		rocket.thrust(0);
	}
}

function keyReleased() {
	console.log('keyReleased');
	rocket.thrust(0);
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
	var thres = val || 0.1;

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