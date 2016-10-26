var muse;

var done = false;

var dir = 0;
var speed = 0.1;
var r = 200;
var maxR = r;

var dt = dynamicThreshold();

var dummy = true;

function setup() {
	createCanvas(800, 600);

	//data connection to muse with sampling rate of muse
	if (dummy) {
		muse = museData().dummyData();
	} else {
		muse = museData().connection('http://127.0.0.1:8081');
	}

	//listen to the messages we are interested in 
	//muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/alpha_relative');

	muse.start();

}

function draw() {


	var alphaValue = muse.get('/muse/elements/alpha_relative');

	if (!alphaValue.mean) {
		background('grey');
		return;
	}
	background('orange');

	//set threshold
	var threshold = dt.threshold(alphaValue.mean);

	//update radius based on alpha value and threshold
	if (alphaValue.mean >= threshold) {
		dir = 1;
	} else {
		dir = -1;
	}

	r += dir * speed;

	if (r > maxR) {
		maxR = r;
	}

	fill('black');
	text('Dynamic Threshold:\t\t\t\t\t\t ' + nf(threshold, null, 3), 200, 32);
	text('Measured Relative Alpha:\t\t' + nf(alphaValue.mean, null, 3), 200, 50);


	fill('steelblue');
	noStroke();
	ellipse(width / 2, height / 2, r, r);

	noFill();
	stroke(100);
	ellipse(width / 2, height / 2, maxR, maxR);

}


function dynamicThreshold(val) {

	var values = [];
	var thres = val;

	var step = 0.01;

	//how many measurements to take into account
	var n = 1000;

	function my() {

	}

	my.threshold = function(val) {
		values.push(val);

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