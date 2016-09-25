/*
 *
 * what kind of neurofeedback do we have?
 * Alpha Training
 * Alpha-Theta
 * SMR
 */

var muse;

//initialize museData
var dummy = false;

var done = false;

var alphaThres = dynamicThreshold(0.2);
var thetaThres = dynamicThreshold(0.2);
var betaThres = dynamicThreshold(0.2);


var threshold = 0;

var alphaValue = {};
var thetaValue = {};
var betaValue = {};
var gammaValue = {};


var bestAlpha = 0;
var bestTheta = 0;
var minBeta = 10000;



function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	//data connection to muse with sampling rate of muse
	if (dummy) {
		console.log('using dummy data');
		muse = museData().dummyData(1 / 250);
	} else {
		var museAddress = 'http://10.0.1.4:8081';
		console.log('trying to connect to muse on ' + museAddress);
		muse = museData().connection(museAddress);
	}

	//listen to the messages we are interested in 
	//muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);
	muse.listenTo('/muse/elements/beta_relative', parseBeta);
	muse.listenTo('/muse/elements/gamma_relative', parseGamma);
	muse.listenTo('/muse/elements/theta_relative', parseTheta);



	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');
	frameRate(24);
}

function draw() {

	if (!thetaValue.mean || !alphaValue.mean || !betaValue.mean) {
		background('red');
		return;
	}

	background('white');

	if(frameCount%10 == 0){
		console.log('frameRate: ' + frameRate());
	}

	//neurofeedback process
	//update thresholds based on values
	var thresholdAlpha = alphaThres.threshold(alphaValue.mean);
	var thresholdTheta = thetaThres.threshold(thetaValue.mean);
	var thresholdBeta = betaThres.threshold(betaValue.mean);

	//console.log('thresholdAlpha',thresholdAlpha);
	//console.log('thresholdTheta',thresholdTheta);
	//console.log('thresholdBeta',thresholdBeta);

	//calculate brainwave fitness
	var score = fitness(thetaValue.mean, alphaValue.mean, betaValue.mean, thresholdTheta, thresholdAlpha, thresholdBeta);
	//console.log('score',score);



	//nr bars
	var sc = 1;
	var nrBars = floor(map(score, 0.8, 1.2, 2, 10));
	// console.log('nrBars',nrBars,score);



	var gap = height / nrBars;
	strokeWeight(10);
	stroke(0, 100);
	for (var i = 0; i < nrBars; i++) {
		line(0, i * gap, width, i * gap);
	}


	//create drawing based on threshold and fitness
	//console.log('threshold',threshold,'score',score);

	noStroke();
	textSize(12);
	text('Theta: ' + nf(thetaValue.mean, null, 3), 20, height - 100);
	text('Alpha: ' + nf(alphaValue.mean, null, 3), 20, height - 80);
	text('Beta: ' + nf(betaValue.mean, null, 3), 20, height - 60);
	text('Score: ' + nf(score, null, 3), 20, height - 40);


	if(frameCount>1000){

	//show best score
	bestAlpha = max([bestAlpha,alphaValue.mean]);
	bestTheta = max([bestTheta,thetaValue.mean]);
	minBeta = min([minBeta,betaValue.mean]);

	textSize(20);
	text(nf(bestTheta, null, 3), width-100, height - 100);
	text(nf(bestAlpha, null, 3), width-100, height - 80);
	text(nf(minBeta, null, 3), width-100, height - 60);
	
	}

}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(window.innerWidth, window.innerHeight);
	console.log('width', width, 'height', height);
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

function parseBeta(msg) {
	json = jsonify(msg);

	//console.log('json',json);
	betaValue = json;

	betaValue.mean = mean(betaValue.payload);

	if (!done) {
		console.log(betaValue);
		done = true;
	}


}

function parseGamma(msg) {
	json = jsonify(msg);

	//console.log('json',json);
	gammaValue = json;

	gammaValue.mean = mean(gammaValue.payload);

	if (!done) {
		console.log(gammaValue);
		done = true;
	}


}

function parseTheta(msg) {
	json = jsonify(msg);

	//console.log('json',json);
	thetaValue = json;

	thetaValue.mean = mean(thetaValue.payload);

	if (!done) {
		console.log(thetaValue);
		done = true;
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


//this needs to be part of musedata
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


/**
 * calculate fitness of brainwave
 * lets use relative values for that
 * lets do an alpha theta
 * so we need to combine relative theta and relative alpha
 */
function fitness(relativeTheta, relativeAlpha, relativeBeta, thresT, thresA, thresB) {
	//we want high theta and high alpha, and low beta and low gamma
	//what can we do here?
	//the relative values are already normalized
	//so we can work well with these values
	//we can give each value a respective weight to give it importance for example
	//but we also want to punish high beta and gamma values....
	//so we could take the inverse of them, if we have the inverse of them for the fitness
	//it means that a highBeta value gives a low fitness value

	if (!relativeTheta || !relativeAlpha || !relativeBeta || !thresT || !thresA || !thresB) {
		return 0;
	}

	//console.log(relativeTheta,relativeAlpha,relativeBeta,relativeGamma);
	var thetaScore = relativeTheta - thresT;
	var alphaScore = relativeAlpha - thresA;

	//we want to minimize beta
	var betaScore = thresB - relativeBeta;


	//give each of the values a weight of 0.25, so that the fitness is between 0,1;
	var weight = 1;

	//make sure we create a positive value
	return 1 + weight * (thetaScore + alphaScore + betaScore);

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


		thres = 0.8 * _mean;
		return thres;
	}

	return my;
}