///TODO change musedata so that dummy data and real data are the same

var muse;

var threshold = 0.2;

var alphaValue = null;

var dt = dynamicThreshold(0.2);

//use dummy data when true, otherwise tries to connect to muse
var dummy = true;

//for displaying debug information
var debug = true;

//variables for layout
var paddingTop = 100;
var paddingLeft = 100;

var h1 = 32;
var h2 = 18;
var h3 = 14;




function setup() {
	createCanvas(1024, 768);

	//data connection to muse with sampling rate of muse
	if (dummy) {
		muse = museData().dummyData(1 / 220);
	} else {
		muse = museData().connection('http://127.0.0.1:8081');
	}

	//listen to the messages we are interested in 
	muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);

	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');
}

function draw() {

	if (!alphaValue) {
		background('red');
		return;
	}
	background('orange');

	//title 
	textSize(h1);
	fill('black');
	text('Neurofeedback: Noise Grid', paddingLeft, paddingTop);

	//subtitle
	textSize(h2);
	fill('gray');
	text('Try to make a regular grid with your brain waves!', paddingLeft, paddingTop + 30);


	//valculate dynamic threshold based on current value
	//TODO use marching mean for that, instead of the current value
	threshold = dt.threshold(alphaValue.mean);

	//draw the grid: the better the alpha value the more regular the grid of circles
	

	if (debug) {
		//display dynamic threshold and current measured value
		fill('black');
		textSize(h3);
		text('Dynamic Threshold:\t\t\t\t\t\t ' + nf(threshold, null, 3), paddingLeft, height-50);
		text('Measured Relative Alpha:\t\t' + nf(alphaValue.mean, null, 3), paddingLeft, height-30);
	}

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
	var _id = msg[1];

	//het hold of payload, rest of msg
	var _pl = msg.slice(2);

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

		//TODO ask Patrick about how to calculate dynamic threshold
		thres = 0.8 * _mean;
		return thres;
	}

	return my;
}