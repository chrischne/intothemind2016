//credits
//arcs code taken from https://www.openprocessing.org/sketch/152169

var muse;

//initialize museData
var dummy = true;

var done = false;


var thresh = dynamicThreshold();


var maxAlpha = Number.MIN_VALUE;
var maxTheta = Number.MIN_VALUE;
var minBeta = Number.MAX_VALUE;


//for drawing arcs
var num = 20;
var step = 22;
var sz = 0;
var offSet = 0;
var thet = -3;
var angle = 0;


//var rSlider;

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

	//for the arcs
	strokeWeight(5);

	frameRate(24);

}

function draw() {

	var alphaValue = muse.get('/muse/elements/alpha_relative');
	var betaValue = muse.get('/muse/elements/beta_relative');
	var thetaValue = muse.get('/muse/elements/theta_relative');

	//dont draw anything if we don't have data from muse
	if (!thetaValue.mean || !alphaValue.mean || !betaValue.mean) {
		background('grey');
		return;
	}

	background(20);

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}

	var score = alphaTheta(alphaValue.mean, thetaValue.mean, betaValue.mean);
	var threshold = thresh.threshold(score);

	//if score is larger than the threshold, we have a positive feedback, else we have a negative feedback
	var feedback = score - threshold;

	//transform feedback into a value used for displaying the arcs
	var phi = map(feedback, -0.4, 0.4, -3, 0);

	push();
	translate(width / 2, height * .75);
	//angle = 0;
	for (var i = 0; i < num; i++) {
		stroke(255);
		noFill();
		sz = i * step;
		var offSet = (PI / num * i) * 0.5;
		var arcEnd = map(sin(phi + offSet), -1, 1, PI, TWO_PI);
		arc(0, 0, sz, sz, PI, arcEnd);
	}

	pop();
}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(window.innerWidth, window.innerHeight);
	console.log('width', width, 'height', height);
}

function alphaTheta(_alpha, _theta, _beta) {
	if (!_alpha || !_theta || !_beta) {
		return 0;
	}
	var betaWeight = -0.5;
	var diffWeigth = 0.5;
	return _alpha + _theta + betaWeight * _beta; // + diffWeigth*(_theta-_alpha)

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

		while (values.length > n) {
			values.shift();
		}


		var _mean = mean(values);


		thres = 0.85 * _mean;
		return thres;
	}

	return my;
}

//calculate mean of an array
function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}