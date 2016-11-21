///TODO change musedata so that dummy data and real data are the same

var muse;

var dt = dynamicThreshold();


function setup() {
	createCanvas(displayWidth, displayHeight);

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

	frameRate(24);
}

function draw() {


	var horseshoe = muse.get('/muse/elements/horseshoe');
var alpha_relative = muse.get('/muse/elements/alpha_relative');
var theta_relative = muse.get('/muse/elements/theta_relative');

console.log(alpha_relative);


}

function windowResized() {
	console.log('windowResized')
	resizeCanvas(displayWidth, displayHeight);
	console.log('width', width, 'height', height);
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