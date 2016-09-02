
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
	var values = msg.slice(2);
	//console.log('values', values);
	deltaData.push(values);

}

function parseTheta(msg) {
var values = msg.slice(2);
	//console.log('values', values);
	thetaData.push(values);
}

function parseAlpha(msg) {
	var values = msg.slice(2);
	//console.log('values', values);
	alphaData.push(values);

}

function parseBeta(msg) {
var values = msg.slice(2);
	//console.log('values', values);
	betaData.push(values);
}

function parseGamma(msg) {
var values = msg.slice(2);
	//console.log('values', values);
	gammaData.push(values);
}