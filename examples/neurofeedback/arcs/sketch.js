/*
 *
 * what kind of neurofeedback do we have?
 * Alpha Training
 * Alpha-Theta
 * SMR
 */


//credits
//https://www.openprocessing.org/sketch/152169

//window length 2-5 sec

//

var muse;

//initialize museData
var dummy = true;

var done = false;

//var alphaThres = dynamicThreshold(0.2);
//var thetaThres = dynamicThreshold(0.2);
//var betaThres = dynamicThreshold(0.2);
var thresh = dynamicThreshold(0.2);


var threshold = 0;

var alphaValue = {};
var thetaValue = {};
var betaValue = {};
var gammaValue = {};


var bestAlpha = 0;
var bestTheta = 0;
var minBeta = 10000;



//for drawing arcs
var num = 20;
var step = 22;
var sz = 0;
var offSet = 0;
var thet = -3;
var angle = 0;


var rSlider;


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
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);
	muse.listenTo('/muse/elements/beta_relative', parseBeta);
	//muse.listenTo('/muse/elements/gamma_relative', parseGamma);
	muse.listenTo('/muse/elements/theta_relative', parseTheta);



	muse.start();


	//set the font
	textFont('HelveticaNeue-Light');

	//for the arcs
	strokeWeight(5);
	


	frameRate(24);

}

function draw() {


	//var fitness_methode = alphaTheta(); //smr();

	//var wert = missdenAktuellenWert();

	//var feedback = fitness_methode(wert);



	if (!thetaValue.mean || !alphaValue.mean || !betaValue.mean) {
		background('red');
		return;
	}

	background(20);

	if (frameCount % 10 == 0) {
		console.log('frameRate: ' + frameRate());
	}

	//neurofeedback process
	//update thresholds based on values
	//var thresholdAlpha = alphaThres.threshold(alphaValue.mean);
	//var thresholdTheta = thetaThres.threshold(thetaValue.mean);
	//var thresholdBeta = betaThres.threshold(betaValue.mean);



	//console.log('thresholdAlpha',thresholdAlpha);
	//console.log('thresholdTheta',thresholdTheta);
	//console.log('thresholdBeta',thresholdBeta);

	//calculate brainwave fitness

//	var score = fitness(thetaValue.mean, alphaValue.mean, betaValue.mean, thresholdTheta, thresholdAlpha, thresholdBeta);
//	console.log('score', score);

	var value = alphaTheta(alphaValue.mean,thetaValue.mean,betaValue.mean);
	var threshold = thresh.threshold(value);
	var fitness = value - threshold;
	console.log('value',value);
	console.log('threshold',threshold);
	console.log('fitness',fitness);

	var dir = map(fitness,-0.2,0.2,-0.01,0.01);


//thet += dir; 
thet = constrain(thet+dir,-3,0);
console.log('thet',thet);


	push();
	translate(width / 2, height * .75);
	angle = 0;
	for (var i = 0; i < num; i++) {
		stroke(255);
		noFill();
		sz = i * step;
		//var offSet = TWO_PI / num * i;
		var offSet = (PI / num * i)*0.5;
		// console.log('thet',thet);
		var arcEnd = map(sin(thet + offSet), -1, 1, PI, TWO_PI);
		arc(0, 0, sz, sz, PI, arcEnd);
	}
	
	pop();
	//thet += .0523;
	



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


function alphaTheta(_alpha,_theta,_beta){
	if(!_alpha || !_theta || !_beta){
		return 0;
	}
	var betaWeight = -0.5;
	var diffWeigth = 0.5;
	return _alpha + _theta + betaWeight*_beta + diffWeigth*(_theta-_alpha)
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