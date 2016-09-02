///TODO change musedata so that dummy data and real data are the same

var muse;

var slider;

var done = false;

var threshold = 0.2;

var alphaValue = null;

var dir = 0;
var speed = 0.1;
var r = 200;
var maxR = r;

var dt = dynamicThreshold(0.2);


function setup() {
  createCanvas(800,600);

  //data connection to muse with sampling rate of muse
 // muse = museData().dummyData(1/220);
  muse = museData().connection('http://127.0.0.1:8081');

  //listen to the messages we are interested in 
  muse.listenTo('/muse/elements/horseshoe',parseHorse);
  muse.listenTo('/muse/elements/alpha_relative',parseAlpha);

  muse.start();

  //slider = createSlider(0, 100, 50);
  //slider.position(20, 20);

  //threshold = map(slider.value(),0,100,0,1);
}

function draw() {

	if(!alphaValue){
		background('red');
		return;
	}
	background('orange');

	//set threshold
	//threshold = map(slider.value(),0,100,0,1);
	threshold = dt.threshold(alphaValue.mean);

	//update radius based on alpha value and threshold

	if(alphaValue.mean>=threshold){
		dir = 1;
	}
	else{
		dir = -1;
	}

	r += dir*speed;

	if(r>maxR){
		maxR = r;
	}

	fill('black');
	text('Dynamic Threshold:\t\t\t\t\t\t '  + nf(threshold,null,3),200,32);
	text('Measured Relative Alpha:\t\t' + nf(alphaValue.mean,null,3),200,50);


	fill('steelblue');
	noStroke();
	ellipse(width/2,height/2,r,r);

	noFill();
	stroke(100);
	ellipse(width/2,height/2,maxR,maxR);


}



function parseHorse(msg){

	json = jsonify(msg);
	//console.log('json',json);

	horse = json;
}

function parseAlpha(msg){
	json = jsonify(msg);
	//console.log('json',json);
	alphaValue = json;

	alphaValue.mean = mean(alphaValue.payload);

	if(!done){
	console.log(alphaValue);
	done = true;
}
}

function mean(arr){
	var sum = 0;

	arr.forEach(function(d){
		sum+=d;
	});

	return sum/arr.length;

}

function jsonify(msg){

	//remove first element, the timestamp
	//var _ts = msg[1];

	//remove second element, the id
	var _id = msg[0];

	//het hold of payload, rest of msg
	var _pl = msg.slice(1);

	//create json object
	return {
		id: _id,
		payload: _pl
	};

}

function dynamicThreshold(val){

	var values = [];
	var thres = val;

	var step = 0.01;
	//how many measurements to take into account
	var n = 3000;

	function my(){

	}

	my.threshold = function(val){
		values.push(val);

		while(values.length>n){
			values.shift();
		}
		
		/*if(values.length<n){
			return thres;
		}*/
		
		var _mean = mean(values);
		console.log('mean',_mean);
/*
		if(_mean>thres){
			thres+=step;
		}
		else if(_mean<thres){
			thres-=step;
		}*/

		//TODO ask Patrick about how to calculate dynamic threshold
		thres = 0.8*_mean;
		return thres;
	}

	return my;
}

