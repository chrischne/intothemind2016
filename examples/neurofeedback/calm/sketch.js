///TODO change musedata so that dummy data and real data are the same

var muse;

var dt = dynamicThreshold();


function setup() {
	//createCanvas(800, 600);
	noCanvas();

	console.log('width', width, 'height', height);


muse = museData().connection('http://10.0.1.4:8081');
muse.start();

if(!muse.isConnected()){
	console.log('working with dummy data');
	muse = museData().dummyData();
	muse.start();
}

//listen to the messages we are interested in 
muse.listenTo('/muse/elements/horseshoe');
muse.listenTo('/muse/elements/alpha_relative');
muse.listenTo('/muse/elements/theta_relative');




	//set the font
	textFont('HelveticaNeue-Light');

	frameRate(30);
}

function draw() {


	var horseshoe = muse.get('/muse/elements/horseshoe');
	var alpha_relative = muse.get('/muse/elements/alpha_relative');
	var theta_relative = muse.get('/muse/elements/theta_relative');

	/*if(!alpha_relative.mean){
		background('red');
		return;
	}

	background('white');*/

	var score = alphaTheta(alpha_relative.mean,theta_relative.mean);
	if(!score){
		return;
	}
	var threshold = dt.threshold(score);
	 diff = score - threshold;

	//console.log('diff',diff);

	var blurValue = map(diff,-10,10,0,5);

/*
	textSize(128);
	text('calm',width/2,height/2);
	filter(BLUR);*/
	var blurry = select('#gaussian').attribute('stdDeviation',blurValue);
	//console.log(blurry);

	if(frameCount%10== 0){
		console.log('frameRate',frameRate());
	}

}

function alphaTheta(a,t){
	//make real percentages out of the data instead of values between 0 an 1
	return 100*a + 100*t;
}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(displayWidth, displayHeight);
	console.log('width', width, 'height', height);
}

function mean(arr) {
	var sum = 0;

	arr.forEach(function(d) {
		sum += d;
	});

	return sum / arr.length;

}


function dynamicThreshold(val) {

	var values = [];
	var thres = val || 0.01;

	var step = 0.01;
	//how many measurements to take into account
	var n = 500;

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


		thres = 0.85 * _mean;
		return thres;
	}

	return my;
}