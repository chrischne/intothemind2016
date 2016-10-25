/*
 *
 * what kind of neurofeedback do we have?
 * Alpha Training
 * Alpha-Theta
 * SMR
 */


 //window length 2-5 sec

 //

var muse;
var thresh;

//initialize museData
var dummy = false;

var done = false;


var aboveThreshCount = 0;
var medalReach = 50;
var medals = 1;
var medalR = 20;
var medalGap = 5;
var baseX = 50;
var baseY = 400;


var scores = [];
var thresholds = [];

var scoreBuffer = [];
var thresholdBuffer = [];


function setup() {
	createCanvas(800, 600);

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


	thresh = dynamicThreshold();

	//set the font
	textFont('HelveticaNeue-Light');
	frameRate(30);
}

function draw() {


	background('white');

	//var fitness_methode = alphaTheta(); //smr();

	//var wert = missdenAktuellenWert();

	//var feedback = fitness_methode(wert);



	if(frameCount%10 == 0){
		console.log('frameRate: ' + frameRate());
	}


	var alph = muse.get('/muse/elements/alpha_relative');
	var beta = muse.get('/muse/elements/beta_relative');
	var theta = muse.get('/muse/elements/theta_relative');

	//console.log('alph',alph.mean);
	//console.log('beta',beta.mean);
	//console.log('theta',theta.mean);

	var score = alphaTheta(alph,theta,beta);
	var threshold = thresh.threshold(score);
	var feedback = score - threshold;
	//console.log('score: ' + score);
	//console.log('threshold: ' + threshold);
	//console.log('feedback: ' + feedback);
	//console.log('control', (feedback+threshold-score))
	scoreBuffer.push(score);
	thresholdBuffer.push(threshold);

	//rolling mean
	if(scoreBuffer.length>30){
		scoreBuffer.shift();
		thresholdBuffer.shift();
	}

	if(frameCount%10 == 0){
		scores.push(mean(scoreBuffer));
		thresholds.push(mean(thresholdBuffer));

		if(scores.length>1000){
			scores.shift();
			thresholds.shift();
		}
	}
	

	if(feedback>=0){
		aboveThreshCount++;
	}
	else {
		aboveThreshCount=0;
	}

	if(aboveThreshCount>=medalReach){
		medals++;
		console.log('medals: ' + medals);
		aboveThreshCount=0;
	}

	//sphere
	var r = map(feedback,-0.5,0.5,10,200);
	fill('orange');
	noStroke();
	ellipse(width/2,height/2,r,r);




	//medals
	fill(0);
	stroke(0);
	for(var i=0; i<medals; i++){
		var x = baseX + i*(medalR+medalGap);

		rect(x,baseY,medalR,medalR);
	}


	//scores
	var chartHeight = 200;
	var chartWidth = 500;
	var minScore = -0.5;
	var maxScore = 0.5;
	push();
	translate(baseX,height - chartHeight);
	
	noFill();

	//zero line
	var y = map(0,minScore,maxScore,chartHeight,0);
	stroke(200);
	line(0,y,chartWidth,y);

	stroke(200,10,10);
	beginShape();
	for(var i=0; i<scores.length; i++){
		var y = map(scores[i],minScore,maxScore,chartHeight,0);
		var x = map(i,0,scores.length-1,0,chartWidth);
		vertex(x,y);
	}
	endShape();

	stroke(10,200,10);
	beginShape();
	for(var i=0; i<thresholds.length; i++){
		var y = map(thresholds[i],minScore,maxScore,chartHeight,0);
		var x = map(i,0,thresholds.length-1,0,chartWidth);
		vertex(x,y);
	}
	endShape();

	
	pop();



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


function alphaBeta(alph,beta){
	if (!alph.mean || !beta.mean) {
		console.log('alphaBeta: no values to calculate score');
		return 0;
	}
	return 0.75*alph.mean + 0.25*beta.mean;
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


		thres = learningRate * _mean;
		return thres;
	}

	return my;
}

//this needs to be part of a helper library together with sum and mean maybe median also
function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}