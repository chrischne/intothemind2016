var muse;
var thresh;

//initialize museData
var dummy = true;

var done = false;


var aboveThreshCount = 0;
var medalReach = 50;
var medals = 1;
var medalR = 20;
var medalGap = 5;
var baseX = 50;
var baseY = 0;

var maxR = Number.MIN_VALUE;


var scores = [];
var thresholds = [];

var scoreBuffer = [];
var thresholdBuffer = [];


function setup() {
	createCanvas(600, 600);

	baseY = height - 100;

	//data connection to muse with sampling rate of muse
	if (dummy) {
		console.log('using dummy data');
		muse = museData().dummyData();
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

	thresh = dynamicThreshold();

	//set the font
	textFont('HelveticaNeue-Light');
	frameRate(30);
}

function draw() {


	background('white');

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}

	var alph = muse.get('/muse/elements/alpha_relative');
	var beta = muse.get('/muse/elements/beta_relative');
	var theta = muse.get('/muse/elements/theta_relative');

	var score = alphaTheta(alph, theta, beta);
	var threshold = thresh.threshold(score);
	var feedback = score - threshold;

	scoreBuffer.push(score);
	thresholdBuffer.push(threshold);

	//rolling mean
	if (scoreBuffer.length > 30) {
		scoreBuffer.shift();
		thresholdBuffer.shift();
	}

	if (frameCount % 10 == 0) {
		scores.push(mean(scoreBuffer));
		thresholds.push(mean(thresholdBuffer));

		if (scores.length > 1000) {
			scores.shift();
			thresholds.shift();
		}
	}


	if (feedback >= 0) {
		aboveThreshCount++;
	} else {
		aboveThreshCount = 0;
	}

	if (aboveThreshCount >= medalReach) {
		medals++;
		aboveThreshCount = 0;
	}

	//sphere
	var r = map(feedback, -0.5, 0.5, 10, 200);
	maxR = r > maxR ? r : maxR;

	fill('#E74C3C');
	noStroke();
	ellipse(width / 2, height / 2, r, r);

	noFill();
	stroke(200);
	ellipse(width / 2, height / 2, maxR, maxR);


	//medals
	fill('#2C3E50');
	noStroke();
	for (var i = 0; i < medals; i++) {
		var x = baseX + i * (medalR + medalGap);

		rect(x, baseY, medalR, medalR);
	}

}



function alphaTheta(alph, theta, beta) {


	if (!alph.mean || !theta.mean || !beta.mean) {
		console.log('alphaTheta: no values to calculate score');
		return 0;
	}

	//alpha shoudl be as high as possible
	//theta should be as high as possible
	//beta should be as low as possible
	//theta if possible higher than alpha$
	var diff = abs(theta.mean - alph.mean);
	return alph.mean + theta.mean - diff - beta.mean;

}



function dynamicThreshold() {

	var values = [];
	var thres = 0;

	//var step = 0.01;
	//how many measurements to take into account
	var n = 1000;

	var learningRate = 0.85;

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


		thres = learningRate * _mean;
		return thres;
	}

	return my;
}



function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}

