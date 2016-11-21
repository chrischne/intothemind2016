///TODO change musedata so that dummy data and real data are the same

var muse;

var threshold = 0.2;
var maxThreshold = 0;

var alphaValue = null;

var dt = dynamicThreshold(0.2);

//use dummy data when true, otherwise tries to connect to muse
var dummy = false;

//for displaying debug information
var debug = false;

//variables for layout
var paddingTop = 50;
var paddingLeft = 50;

var h1 = 32;
var h2 = 18;
var h3 = 14;


//helper 
var done = false;

//helper angle for grid
var phi = 5;
var startPhi = 0;



function setup() {
	createCanvas(displayWidth, displayHeight);

	console.log('width', width, 'height', height);

	//data connection to muse with sampling rate of muse
	if (dummy) {
		muse = museData().dummyData(1 / 1000);
	} else {
		muse = museData().connection('http://10.0.1.4:8081');
	}

	//listen to the messages we are interested in 
	muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);

	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');

	frameRate(24);
}

function draw() {

	if (!alphaValue) {
		background('gray');
		return;
	}
	background('white');

	//title 

	if (debug) {
		textSize(h1);
		fill('black');
		text('Neurofeedback: Noise Grid', paddingLeft, paddingTop);

		//subtitle
		textSize(h2);
		fill('gray');
		text('Break the regularity of the grid with your brain waves!', paddingLeft, paddingTop + 30);

	}
	//valculate dynamic threshold based on current value
	//TODO use marching mean for that, instead of the current value
	threshold = dt.threshold(alphaValue.mean);

	if (frameCount > 1000) {
		maxThreshold = max([threshold, maxThreshold]);
	}



	//draw the grid: the better the alpha value the more regular the grid of circles
	//grid dimension
	var n = 20;
	var r = 20;
	var gridWidth = width - 1 * paddingLeft;
	var gridHeight = height - 1 * paddingTop;

	//calculate offets for the grid
	//if the measured alpha value is higher than the threshold, then the grid is perfect, hence the offset 0
	//if the measured alpha is lower than the threshold, then the offset is the difference between measured value and threshold
	var score = 0;
	if (alphaValue.mean >= threshold) {
		//score = 0;
		score = abs(threshold - alphaValue.mean);
		//startPhi = random(-180,180);
	} else {
		//score = threshold-alphaValue.mean;
		startPhi = random(-180, 180);
	}



	noFill();
	strokeWeight(3);
	randomSeed(0);
	for (var gridY = 0; gridY < n; gridY++) {
		for (var gridX = 0; gridX < n; gridX++) {
			var posX = paddingLeft  + gridWidth / n * gridX;
			var posY = paddingTop  + gridHeight / n * gridY;

			//var shiftVector = p5.Vector.fromAngle(radians(startPhi + (gridX+gridY)*phi));

			var shiftLength = map(score, 0, 1, 0, 50);
			//shiftVector.mult(shiftLength);



			var shiftX = random(-shiftLength, shiftLength);
			var shiftY = random(-shiftLength, shiftLength);

			var rShift = map(score, 0, 1, 0, 100);
			var shiftR = random(0, rShift);


			var strokeShift = random(0, map(score, 0, 1, 0, 20));

			strokeWeight(2 + strokeShift);
			ellipse(posX + shiftX, posY + shiftY, r + shiftR, r + shiftR);

			//ellipse(posX+shiftVector.x,posY+shiftVector.y,r,r);
		}
	}

	if (debug) {
		//display dynamic threshold and current measured value
		fill('black');
		textSize(h3);
		text('Dynamic Threshold:\t\t\t\t\t\t ' + nf(threshold, null, 3), paddingLeft, height - 70);
		text('Max Threshold:\t\t' + nf(maxThreshold, null, 3), paddingLeft, height - 50);
		text('Measured Relative Alpha:\t\t' + nf(alphaValue.mean, null, 3), paddingLeft, height - 30);
		text('Framerate:\t\t' + nf(frameRate(), null, 1), paddingLeft, height - 10);
	}

}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(displayWidth, displayHeight);
	console.log('width', width, 'height', height);
}



function parseHorse(msg) {

	json = jsonify(msg);
	//console.log('json',json);

	horse = json;
}

function parseAlpha(msg) {
	json = jsonify(msg);

	//console.log('json',json);
	alphaValue = json;

	alphaValue.mean = mean(alphaValue.payload);

	if (!done) {
		console.log(alphaValue);
		done = true;
	}
}

function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}

function jsonify(msg) {

	//console.log('msg',msg);
	//remove first element, the timestamp
	//var _ts = msg[1];

	//remove second element, the id
	//var _id = msg[1];
	var _id = msg[0];

	//het hold of payload, rest of msg
	//var _pl = msg.slice(2);
	var _pl = msg.slice(1);

	//create json object
	return {
		id: _id,
		payload: _pl
	};

}

function dynamicThreshold(val) {

	var values = [];
	var thres = val;

	var step = 0.01;
	//how many measurements to take into account
	var n = 3000;

	function my() {

	}

	my.threshold = function(val) {
		values.push(val);

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


		thres = 0.8 * _mean;
		return thres;
	}

	return my;
}