//TODO 
//nice header here
//make recorder object for the data, that will make it simpler for the students
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

var deltaStatus = [0, 0, 0, 0];
var thetaStatus = [0, 0, 0, 0];
var alphaStatus = [0, 0, 0, 0];
var betaStatus = [0, 0, 0, 0];
var gammaStatus = [0, 0, 0, 0];


//raw FFT data
var rawFFTData = [];

var rawFFTStatus = [];

//recording specific booleans
var isRecording = false;
var dataReady = false;


//colors
var deltaColor = 'red';
var thetaColor = 'green';
var alphaColor = 'yellow';
var betaColor = 'blue';
var gammaColor = 'orange';

var cols = [deltaColor,thetaColor,alphaColor,betaColor,gammaColor];
var labels = ['Delta','Theta','Alpha','Beta','Gamma'];

//text size
var H1 = 32;
var H2 = 16;
var H3 = 11;


function setup() {
	createCanvas(650, 700);


	//MUSEDATA
	//muse = museData().connection('http://127.0.0.1:8081');
	//connection with dummyData
	//muse = museData().dummyData();
	muse = museData().dummyData(1000 / 124);

	//setting up callbacks to specific id's
	muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/delta_relative', parseDelta);
	muse.listenTo('/muse/elements/theta_relative', parseTheta);
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);
	muse.listenTo('/muse/elements/beta_relative', parseBeta);
	muse.listenTo('/muse/elements/gamma_relative', parseGamma);
	muse.listenTo('/muse/elements/raw_fft0', parseRawFFT);


	//start data transmission
	//muse.start();


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

	background('grey');

	fill('black');
	textSize(H1);
	text('Baseline', 100, 50);


	push();
	translate(100, 150);


	push();
	translate(0, 0);
	//RECORD SECTION
	textSize(H2)
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
	fill('black');
	textSize(H2);
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
	fill('black');
	textSize(H2);
	text('Relative Band Powers', 0, 0);

	push();
	translate(0, 20);
	relativeBands(300, 100);
	pop();



	pop();



	// RAW FFT
	push();
	translate(0,250);
	textSize(H2);
	text('Raw FFT',0,0);

	push();
	var r = 100;
	translate(r,r);
	
	circularBars(r,rawFFTStatus);
	pop();
	
	pop();

	
	push();
	translate(0,500);
	drawLegend(70,10,labels,cols);
	pop();
			

		

	pop();

}


function drawLegend(labelWidth,r,labels,colors){

	//draw a legend
			//var cols = [deltaColor,thetaColor,alphaColor,betaColor,gammaColor];
			//var labels = ['Delta','Theta','Alpha','Beta','Gamma'];

		//	var labelWidth = 70;
			var y = 0;
		//	var r = 10;

			for(var i=0; i<labels.length; i++){
				var x = i*labelWidth;
				fill(colors[i]);
				ellipse(x,y,r,r);
				textAlign(LEFT,CENTER);
				fill('black');
				textSize(H3)
				text(labels[i],x+r,y);


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
function circularBars(r,data){
	var n = 52;//data.length;

	//y -40.0 to 20.0
	var minVal = -40;
	var maxVal = 20;

	var phi = 360/n;

	noFill();
	stroke('black');
	for(var i=0; i<n; i++){

		var hz = i*0.86;

		var v = p5.Vector.fromAngle(radians(i*phi-90));
		var l = map(data[i],minVal,maxVal,0,r);
		v.mult(l);

		var c = getCol(hz);
		stroke(c);
		line(0,0,v.x,v.y);
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
		fill('black');
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
			fill(100);
		} else if (val === 1) {
			//good
			fill('green');
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
	var to = color(255, 0, 0);
	var col = lerpColor(from, to, map(sin(val), -1, 1, 0, 1));
	fill(col);
	stroke(col);
	ellipse(0, 0, 15, 15);
}

/**

To get the frequency resolution for the bins, you can divide the sampling rate 
by the FFT length, so in the case of Muse: 220/256 ~ 0.86Hz/bin

So, the zeroth index of the FFT array represents 0Hz, the next index represents 0-0.86Hz, 
and so on up to 128*0.86 = 110Hz, which is the maximum frequency 
that our FFT with its 220Hz sampling rate can detect.
*/
function parseRawFFT(msg) {
	console.log('parseRawFFT');

	//make array from object
	var arr = [];
	for (var i = 2; i <= 99; i++) {
		arr.push(msg[i]);
	}

	rawFFTData.push(arr);

	//console.log('arr',arr);
}



function parseHorse(msg) {
	console.log('parseHorse', msg);
	//console.log('this',this);

	var values = msg.slice(2);
	console.log('values', values);
	horseShoeData.push(values);


}

function startRecording() {

	if (!isRecording) {
		console.log('startRecording');
		muse.start();
		isRecording = true;
	}
}

function stopRecording() {

	if (isRecording) {
		console.log('stopRecording');
		muse.stop();
		isRecording = false;

		//maybe make a function here with return value
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
	console.log('horseShoeData', horseShoeData);

	horseShoeStatus = [0, 0, 0, 0];
	for (var i = 0; i < horseShoeData.length; i++) {
		var curr = horseShoeData[i];
		for (var j = 0; j < curr.length; j++) {
			if (curr[j] > horseShoeStatus[j]) {
				horseShoeStatus[j] = curr[j];
			}
		}
	}

	console.log('horseShoeStatus', horseShoeStatus);


	//mine delta, theta, alpha, beta, gamma
	//calculate the average per sensor
	deltaStatus = calcAvg(deltaData);
	console.log('deltaStatus', deltaStatus);

	thetaStatus = calcAvg(thetaData);
	console.log('thetaStatus', thetaStatus);

	alphaStatus = calcAvg(alphaData);
	console.log('alphaStatus', alphaStatus);

	betaStatus = calcAvg(betaData);
	console.log('betaStatus', betaStatus);

	gammaStatus = calcAvg(gammaData);
	console.log('gammaStatus', gammaStatus);


	//raw FFT statuts

	rawFFTStatus = calcAvg(rawFFTData);
	console.log('rawFFTStatus', rawFFTStatus);



	dataReady = true;



}

function calcAvg(arr) {
	//[[a,b,c,d],[a,b,c,d],...]

	var memberLength = arr[0].length;
	var avgArr = [];
	//loop through sensors
	for (var i = 0; i < memberLength; i++) {

		var sum = 0;
		//loop through recorded data
		for (var j = 0; j < arr.length; j++) {
			sum += arr[j][i];
		}

		var avg = sum / arr.length;

		avgArr.push(avg);
	}

	return avgArr;
}

function parseDelta(msg) {
	console.log('parseDelta', msg);
	var values = msg.slice(2);
	//console.log('values', values);
	deltaData.push(values);

}

function parseTheta(msg) {
	console.log('parseTheta', msg);
	var values = msg.slice(2);
	//console.log('values', values);
	thetaData.push(values);
}

function parseAlpha(msg) {
	console.log('parseAlpha', msg);
	var values = msg.slice(2);
	//console.log('values', values);
	alphaData.push(values);

}

function parseBeta(msg) {
	console.log('parseBeta', msg);

	var values = msg.slice(2);
	//console.log('values', values);
	betaData.push(values);
}

function parseGamma(msg) {
	console.log('parseGamma', msg);
	var values = msg.slice(2);
	//console.log('values', values);
	gammaData.push(values);
}

function getCol(hz){
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

	if(hz<4){
		return deltaColor;
	}
	else if(hz<8){
		return thetaColor;
	}
	else if(hz<13){
		return alphaColor;
	}
	else if(hz<30){
		return betaColor;
	}
	else if(hz<44){
		return gammaColor;
	}
	else {
		return 'black';
	}
}