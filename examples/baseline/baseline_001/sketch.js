
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

var deltaStatus = [0,0,0,0];
var thetaStatus = [0,0,0,0];
var alphaStatus = [0,0,0,0];
var betaStatus = [0,0,0,0];
var gammaStatus = [0,0,0,0];

//recording specific booleans
var isRecording = false;
var dataReady = false;


//colors
var deltaColor = 'red';
var thetaColor = 'green';
var alphaColor = 'yellow';
var betaColor = 'blue';
var gammaColor = 'orange';


function setup() {
	createCanvas(800, 600);


	//MUSEDATA
	//muse = museData().connection('http://127.0.0.1:8081');
	//connection with dummyData
	//muse = museData().dummyData();
	muse = museData().dummyData(100);

	//setting up callbacks to specific id's
	muse.listenTo('/muse/elements/horseshoe', parseHorse);
	muse.listenTo('/muse/elements/delta_relative', parseDelta);
	muse.listenTo('/muse/elements/theta_relative', parseTheta);
	muse.listenTo('/muse/elements/alpha_relative', parseAlpha);
	muse.listenTo('/muse/elements/beta_relative', parseBeta);
	muse.listenTo('/muse/elements/gamma_relative', parseGamma);


	//start data transmission
	//muse.start();


	//BUTTONS
	var startButton = createButton('start');
	startButton.position(150, 70);
	startButton.mousePressed(startRecording);

	var stopButton = createButton('stop');
	stopButton.position(200, 70);
	stopButton.mousePressed(stopRecording);
}

function draw() {

	background('white');

	fill('black');
	text('Baseline', 150, 50);

	//HORSESHOE
	fill('black');
	text('Horseshoe', 150, 150);
	var baseX = 300;
	var barWidth = 30;
	var barHeight = 10;
	var gap = 10;
	var y = 140;

	for (var i = 0; i < horseShoeStatus.length; i++) {
		var x = baseX + i * (barWidth + gap);
		var val = horseShoeStatus[i];
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


	//delta, theta, alpha, beta, gamma
	fill('black');
	text('Relative Band Powers',150,200);



	baseX = 300;
	var chartWidth = 300;
	gap = 5;
	var baseY = 190;
	var vGap = 20;



	
	

	//loop through the sensors
	for(var i=0; i<4; i++){

	var currX = baseX;
	var y = baseY + i*vGap;
	

	stroke('white');
	//draw delta
	barWidth = map(deltaStatus[i],0,1,0,chartWidth);
	fill(deltaColor);
	rect(currX,y,barWidth,barHeight);

	currX += barWidth + gap;

	//draw theta
	barWidth = map(thetaStatus[i],0,1,0,chartWidth);
	fill(thetaColor);
	rect(currX,y,barWidth,barHeight);

	currX += barWidth +  gap;

	//draw alpha
	barWidth = map(alphaStatus[i],0,1,0,chartWidth);
	fill(alphaColor);
	rect(currX,y,barWidth,barHeight);

	currX += barWidth + gap;

	//draw beta
	barWidth = map(betaStatus[i],0,1,0,chartWidth);
	fill(betaColor);
	rect(currX,y,barWidth,barHeight);

	currX += barWidth + gap;

	//draw gamma
	barWidth = map(gammaStatus[i],0,1,0,chartWidth);
	fill(gammaColor);
	rect(currX,y,barWidth,barHeight);

	//currX += barWidth;

	}


	//draw a legend
	var cols = [deltaColor,thetaColor,alphaColor,betaColor,gammaColor];
	var labels = ['Delta','Theta','Alpha','Beta','Gamma'];

	var labelWidth = 70;
	var y = 400;
	var r = 10;

	for(var i=0; i<labels.length; i++){
		var x = baseX + i*labelWidth;
		fill(cols[i]);
		ellipse(x,y,r,r);
		textAlign(LEFT,CENTER);
		fill('black');
		text(labels[i],x+r,y);


	}



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
	console.log('deltaStatus',deltaStatus);

	thetaStatus = calcAvg(thetaData);
	console.log('thetaStatus',thetaStatus);

	alphaStatus = calcAvg(alphaData);
	console.log('alphaStatus',alphaStatus);

	betaStatus = calcAvg(betaData);
	console.log('betaStatus',betaStatus);

	gammaStatus = calcAvg(gammaData);
	console.log('gammaStatus',gammaStatus);



	dataReady = true;



}

function calcAvg(arr){
	//[[a,b,c,d],[a,b,c,d],...]

	var avgArr = [];
	//loop through sensors
	for(var i=0; i<4; i++){

		var sum = 0;
		//loop through recorded data
		for(var j=0; j<arr.length; j++){
			sum += arr[j][i];
		}

		var avg = sum/arr.length;

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