var muse;

//horseShoe
var horseShoeData = [];
var horseShoeStatus = [0, 0, 0, 0];

//delta, theta, alpha, beta, gamma
var deltaData = [];
var thetaData = [];
var alphaData = [];
var betaData = [];
var gammaData = [];

var rawFFTData = [];

var deltaStatus = [0, 0, 0, 0];
var thetaStatus = [0, 0, 0, 0];
var alphaStatus = [0, 0, 0, 0];
var betaStatus = [0, 0, 0, 0];
var gammaStatus = [0, 0, 0, 0];


//raw FFT data
var rawFFTStatus = [];

//recording specific booleans
var isRecording = false;
var dataReady = false;

//colors
var deltaColor = '#F6F792';
var thetaColor = '#333745';
var alphaColor = '#77C4D3';
var betaColor = '#DAEDE2';
var gammaColor = '#EA2E49';

var cols = [deltaColor, thetaColor, alphaColor, betaColor, gammaColor];
var labels = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'];

//text size
var H1 = 32;
var H2 = 16;
var H3 = 11;

var TEXTFILL = '#767676';

var dummy = false;

var intervalId = null;

function setup() {
	createCanvas(700, 800);


	//MUSEDATA
	if (dummy) {
		console.log('using dummy data');
		muse = museData().dummyData();
	} else {
		console.log('connecting to http://127.0.0.1:8081');
		muse = museData().connection('http://127.0.0.1:8081');
	}

	//setting up callbacks to specific id's
	muse.listenTo('/muse/elements/horseshoe');
	muse.listenTo('/muse/elements/delta_relative');
	muse.listenTo('/muse/elements/theta_relative');
	muse.listenTo('/muse/elements/alpha_relative');
	muse.listenTo('/muse/elements/beta_relative');
	muse.listenTo('/muse/elements/gamma_relative');
	muse.listenTo('/muse/elements/raw_fft0');

	//BUTTONS
	var startButton = createButton('start');
	startButton.position(250, 135);
	startButton.mousePressed(startRecording);

	var stopButton = createButton('stop');
	stopButton.position(290, 135);
	stopButton.mousePressed(stopRecording);

	textFont('Helvetica');
	textSize(16);
}

function draw() {

	background('white');

	fill('black');
	textSize(H1);
	text('Baseline', 100, 80);


	push();
	translate(100, 150);


	push();
	translate(0, 0);
	//RECORD SECTION
	textSize(H2)
	fill(TEXTFILL);
	text('Recording', 0, 0);

	//record light
	if (isRecording) {
		push();
		translate(100, -5);
		recordingLight();
		pop();
	}
	pop();



	//HORSESHOE

	push();
	translate(300, 0);
	textSize(H2);
	fill(TEXTFILL);
	text('Horseshoe', 0, 0);

	push();
	translate(100, -10);
	horseshoe(10, 10, 5, horseShoeStatus);
	pop();
	pop();



	//RELATIVE BAND POWERS

	push();
	translate(0, 70);


	//delta, theta, alpha, beta, gamma
	fill(TEXTFILL);
	textSize(H2);
	text('Relative Band Powers', 0, 0);

	push();
	translate(0, 20);
	relativeBands(375, 100);
	pop();



	pop();



	// RAW FFT
	push();
	translate(0, 250);
	textSize(H2);
	fill(TEXTFILL);
	text('Raw FFT', 0, 0);

	push();
	var r = 170;
	translate(230, 170);

	circularBars(r, rawFFTStatus);
	pop();

	pop();


	push();
	translate(0, 600);
	drawLegend(70, 15, labels, cols);
	pop();



	pop();

}


function drawLegend(labelWidth, r, labels, colors) {

	//draw a legend
	//var cols = [deltaColor,thetaColor,alphaColor,betaColor,gammaColor];
	//var labels = ['Delta','Theta','Alpha','Beta','Gamma'];

	//	var labelWidth = 70;
	var y = 0;
	//	var r = 10;

	for (var i = 0; i < labels.length; i++) {
		var x = i * labelWidth;
		fill(colors[i]);
		noStroke();
		ellipse(x, y, r, r);
		textAlign(LEFT, CENTER);
		fill(TEXTFILL);
		textSize(H3)
		text(labels[i], x + r, y + 1);


	}
}
/**

To get the frequency resolution for the bins, you can divide the sampling rate 
by the FFT length, so in the case of Muse: 220/256 ~ 0.86Hz/bin

So, the zeroth index of the FFT array represents 0Hz, the next index represents 0-0.86Hz, 
and so on up to 128*0.86 = 110Hz, which is the maximum frequency 
that our FFT with its 220Hz sampling rate can detect.

Name	Frequency Range			
low_freqs	2.5-6.1Hz			
delta_absolute	1-4Hz			
theta_absolute	4-8Hz			
alpha_absolute	7.5-13Hz			
beta_absolute	13-30Hz			
gamma_absolute	30-44Hz


*/
function circularBars(r, data) {
	var n = 52; //data.length;

	//y -40.0 to 20.0
	var minVal = -40;
	var maxVal = 20;

	var phi = 360 / n;

	noFill();
	stroke('black');
	strokeWeight(2);
	for (var i = 0; i < n; i++) {

		var hz = i * 0.86;

		var v = p5.Vector.fromAngle(radians(i * phi - 90));
		var l = map(data[i], minVal, maxVal, 0, r);
		v.mult(l);

		var c = getCol(hz);
		stroke(c);
		line(0, 0, v.x, v.y);
	}
}


function relativeBands(chartWidth, chartHeight) {


	baseX = 60;
	//var chartWidth = 300;
	//var chartHeight = 100;
	var vGap = 10;
	var barHeight = (chartHeight / 4) - vGap;
	gap = 5;
	var baseY = 0;



	var labels = ['leaft Ear', 'left Front', 'right Front', 'right Ear'];

	//loop through the sensors
	for (var i = 0; i < 4; i++) {

		var currX = baseX;
		var y = baseY + i * (barHeight + vGap);


		textSize(H3);
		noStroke();
		fill(TEXTFILL);
		text(labels[i], 0, y + vGap + 2);

		stroke('white');
		//draw delta
		var barWidth = map(deltaStatus[i], 0, 1, 0, chartWidth);
		fill(deltaColor);
		rect(currX, y, barWidth, barHeight);

		currX += barWidth + gap;

		//draw theta
		barWidth = map(thetaStatus[i], 0, 1, 0, chartWidth);
		fill(thetaColor);
		rect(currX, y, barWidth, barHeight);

		currX += barWidth + gap;

		//draw alpha
		barWidth = map(alphaStatus[i], 0, 1, 0, chartWidth);
		fill(alphaColor);
		rect(currX, y, barWidth, barHeight);

		currX += barWidth + gap;

		//draw beta
		barWidth = map(betaStatus[i], 0, 1, 0, chartWidth);
		fill(betaColor);
		rect(currX, y, barWidth, barHeight);

		currX += barWidth + gap;

		//draw gamma
		barWidth = map(gammaStatus[i], 0, 1, 0, chartWidth);
		fill(gammaColor);
		rect(currX, y, barWidth, barHeight);

		//currX += barWidth;

	}

}

function horseshoe(barWidth, barHeight, gap, horse) {
	var baseX = 0;
	//var barWidth = 30;
	//var barHeight = 10;
	//var gap = 10;
	var y = 0;

	for (var i = 0; i < horse.length; i++) {
		var x = baseX + i * (barWidth + gap);
		var val = horse[i];
		if (!dataReady) {
			fill(230);
		} else if (val === 1) {
			//good
			fill('#468966');
		} else if (val === 2) {
			//OK
			fill('orange');
		} else if (val === 3) {
			//BAD
			fill('red');
		} else {
			//something is wrong
			fill('steelblue');
		}
		noStroke();
		rect(x, y, barWidth, barHeight);
	}
}

function recordingLight() {
	ellipseMode(CENTER);
	var scl = 0.1;
	var val = frameCount * scl;
	var from = color(255);
	var to = color('#EA2E49');
	var col = lerpColor(from, to, map(sin(val), -1, 1, 0, 1));
	fill(col);
	stroke(col);
	ellipse(0, 0, 15, 15);
}


function startRecording() {

	if (!isRecording) {
		console.log('startRecording');
		deltaData = [];
		thetaData = [];
		alphaData = [];
		betaData = [];
		gammaData = [];
		horseShoeData = [];

		var rawFFTData = [];
		muse.start();
		isRecording = true;

		intervalId = setInterval(harvestMuse, 100);
	}
}

function harvestMuse() {
	console.log('harvestMuse');


	var horse = muse.get('/muse/elements/horseshoe');
	var delta_relative = muse.get('/muse/elements/delta_relative');
	var theta_relative = muse.get('/muse/elements/theta_relative');
	var alpha_relative = muse.get('/muse/elements/alpha_relative');
	var beta_relative = muse.get('/muse/elements/beta_relative');
	var gamme_relative = muse.get('/muse/elements/gamma_relative');
	var rawfft = muse.get('/muse/elements/raw_fft0');


	horseShoeData.push(horse);
	deltaData.push(delta_relative);
	thetaData.push(theta_relative);
	alphaData.push(alpha_relative);
	betaData.push(beta_relative);
	gammaData.push(gamme_relative);
	rawFFTData.push(rawfft);
}

function stopRecording() {

	if (isRecording) {
		console.log('stopRecording');


		clearInterval(intervalId);
		muse.stop();
		isRecording = false;
		mineData();
	}
}

function mineData() {
	//calculate the avg for horse shoe
	/*1 = Good
	2 = OK
	3 = Bad
	*/

	console.log('mineData');


	horseShoeStatus = [0, 0, 0, 0];
	for (var i = 0; i < horseShoeData.length; i++) {
		var curr = [horseShoeData[i].leftEear, horseShoeData[i].leftFront, horseShoeData[i].rightFront, horseShoeData[i].rightEar];
		for (var j = 0; j < curr.length; j++) {
			if (curr[j] > horseShoeStatus[j]) {
				horseShoeStatus[j] = curr[j];
			}
		}
	}


	//mine delta, theta, alpha, beta, gamma
	//calculate the average per sensor

	deltaData = deltaData.filter(function(d) {
		return d.id;
	});
	deltaStatus = calcAvgFromBand(deltaData);
	//console.log('deltaStatus', deltaStatus);

	thetaData = thetaData.filter(function(d) {
		return d.id;
	});
	thetaStatus = calcAvgFromBand(thetaData);
	//	console.log('thetaStatus', thetaStatus);

	alphaData = alphaData.filter(function(d) {
		return d.id;
	});
	alphaStatus = calcAvgFromBand(alphaData);
	//	console.log('alphaStatus', alphaStatus);

	betaData = betaData.filter(function(d) {
		return d.id;
	});
	betaStatus = calcAvgFromBand(betaData);
	//console.log('betaStatus', betaStatus);

	gammaData = gammaData.filter(function(d) {
		return d.id;
	});
	gammaStatus = calcAvgFromBand(gammaData);
	//	console.log('gammaStatus', gammaStatus);


	//raw FFT statuts

	//only keep valid data containing an id
	rawFFTData = rawFFTData.filter(function(d) {
		return d.id;
	});

	rawFFTStatus = calcAvgRawFFT(rawFFTData);

	dataReady = true;



}


function calcAvgRawFFT(arr) {
	
	var firstObj = arr[0];
	var n = firstObj.values.length;
	

	var meanArray = [];
	for (var i = 0; i < n; i++) {
		var catArr = arr.map(function(d) {
			return d.values[i];
		});
		var meanVal = mean(catArr);
		meanArray.push(meanVal);
	}

	return meanArray;
}

function calcAvgFromBand(arr) {
	//need to return something like this [0,0,0,0]

	var leftEarData = arr.map(function(d) {
		return d.leftEar;
	});

	var rightEarData = arr.map(function(d) {
		return d.rightEar;
	});

	var leftFrontData = arr.map(function(d) {
		return d.leftFront;
	});

	var rightFrontData = arr.map(function(d) {
		return d.rightFront;
	});


	return [mean(leftEarData), mean(leftFrontData), mean(rightFrontData), mean(rightEarData)];

}



function getCol(hz) {
	/*Name	Frequency Range			
low_freqs	2.5-6.1Hz			
delta_absolute	1-4Hz			
theta_absolute	4-8Hz			
alpha_absolute	7.5-13Hz			
beta_absolute	13-30Hz			
gamma_absolute	30-44Hz


var deltaColor = 'red';
var thetaColor = 'green';
var alphaColor = 'yellow';
var betaColor = 'blue';
var gammaColor = 'orange';

*/

	if (hz < 4) {
		return deltaColor;
	} else if (hz < 8) {
		return thetaColor;
	} else if (hz < 13) {
		return alphaColor;
	} else if (hz < 30) {
		return betaColor;
	} else if (hz < 44) {
		return gammaColor;
	} else {
		return 'black';
	}
}

function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}