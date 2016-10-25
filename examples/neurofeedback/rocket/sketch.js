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
	muse.listenTo('/muse/elements/theta_relative');

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

}


function draw() {

	background(255);

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}


	rocket.update(dt);


	//fill('red');
	//ellipse(rocket.pos.x,rocket.pos.y,50,50);


	var sx = map(rocket.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
	var sy = map(rocket.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);

	stars.forEach(function(p) {
		var sx = map(p.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
		var sy = map(p.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);

		if (sx > 0 && sx < width && sy > 0 && sy < height) {
			//fill(0);
			//ellipse(sx,sy,50,50);
			p.draw(sx, sy);
		}
	});

	planets.forEach(function(p) {
		var sx = map(p.pos.x, rocket.pos.x - clipDist, rocket.pos.x + clipDist, 0, width);
		var sy = map(p.pos.y, rocket.pos.y - clipDist, rocket.pos.y + clipDist, height, 0);

		if (sx > 0 && sx < width && sy > 0 && sy < height) {
			//fill(0);
			//ellipse(sx,sy,50,50);
			p.draw(sx, sy);
		}
	});

	rocket.draw(sx, sy);


	textSize(24);
	text(round(rocket.pos.y), width-100, 100);

	textSize(12);
	text(rocket.vel, 20, height - 80);
	text(rocket.acc, 20, height - 60);

	text('rocket and planets by lastspark from The Noun Project', width - 300, height - 30)

}

function createStar(x, y, img) {
	var p = {
		pos: createVector(x, y),
		image: img,
		rotation: random(0, TWO_PI),
		size: random(3, 10),
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
		friction: 0.99,
		thrust: function(d) {
			this.acc = d;
			console.log(d, this.acc);
		},
		update: function(dt) {

			console.log('this.acc: ' + this.acc);
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