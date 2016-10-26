var muse;

//initialize museData
var dummy = true;

var done = false;

var dt = dynamicThreshold();

var maxAlpha = 0;
var maxTheta = 0;
var minBeta = 10000;


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
	//muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/alpha_relative');
	muse.listenTo('/muse/elements/beta_relative');
	//muse.listenTo('/muse/elements/gamma_relative');
	muse.listenTo('/muse/elements/theta_relative');

	muse.start();

	//set the font
	textFont('HelveticaNeue-Light');
	frameRate(24);
}

function draw() {

	var thetaValue = muse.get('/muse/elements/theta_relative');
	var alphaValue = muse.get('/muse/elements/alpha_relative');
	var betaValue = muse.get('/muse/elements/beta_relative');

	if (!thetaValue.mean || !alphaValue.mean || !betaValue.mean) {
		background('grey');
		return;
	}

	background('#CDFF00');

	if (frameCount % 100 == 0) {
		console.log('frameRate: ' + frameRate());
	}

	//neurofeedback process
	var score = alphaTheta(thetaValue.mean, alphaValue.mean, betaValue.mean);
	var threshold = dt.threshold(score);

	var feedback = score - threshold;

	console.log('feedback', feedback);



	//nr bars
	var sc = 1;
	var nrBars = floor(map(feedback, -0.5, 0.5, 2, 10));



	var gap = height / nrBars;
	strokeWeight(10);
	stroke('#52656B');
	for (var i = 0; i < nrBars; i++) {
		line(0, i * gap, width, i * gap);
	}


	//create drawing based on threshold and fitness
	//console.log('threshold',threshold,'score',score);

	noStroke();
	textSize(12);
	text('Theta: ' + nf(thetaValue.mean, null, 2), 20, height - 100);
	text('Alpha: ' + nf(alphaValue.mean, null, 2), 20, height - 80);
	text('Beta: ' + nf(betaValue.mean, null, 2), 20, height - 60);
	text('Score: ' + nf(score, null, 2), 20, height - 40);
	text('Feedback: ' + nf(feedback, null, 2), 20, height - 20);


	if (frameCount > 1000) {

		//show best score
		maxAlpha = max([maxAlpha, alphaValue.mean]);
		maxTheta = max([maxTheta, thetaValue.mean]);
		minBeta = min([minBeta, betaValue.mean]);

		textSize(12);
		text('Max Theta: ' + nf(maxTheta, null, 2), width - 150, height - 100);
		text('Max Alpha: ' + nf(maxAlpha, null, 2), width - 150, height - 80);
		text('Min Beta: ' + nf(minBeta, null, 2), width - 150, height - 60);

	}

}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(window.innerWidth, window.innerHeight);
	console.log('width', width, 'height', height);
}


function alphaTheta(relativeTheta, relativeAlpha, relativeBeta) {
	return relativeTheta + relativeAlpha - relativeBeta;
}


function dynamicThreshold(val) {

	var values = [];
	var thres = val || 0.1;

	var step = 0.01;
	//how many measurements to take into account
	var n = 3000;

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

function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}