

var muse;

var horse = null;
var alph = null;

function setup() {
  createCanvas(800,600);

  //data connection to muse with sampling rate of muse
  muse = museData().dummyData(1/220);

  //listen to the messages we are interested in 
  muse.listenTo('/muse/elements/horseshoe',parseHorse);
  muse.listenTo('/muse/elements/alpha_absolute',parseAlpha);

  muse.start();
}

function draw() {

	if(!horse || !alph){
  background('red');
  return;
}

background('white');

  //draw horseshoe indicator
  var x = 100;
  var y = 100;
  var w = 30;
  var h = 10;
  var gap = 10;

  var payload = horse.payload;

for (var i = 0; i < payload.length; i++) {
	var val = payload[i];
	var col = horseShoeCol(val);
	fill(col);
	noStroke();

	var _x = x + i*w + (i-1)*gap;
	var _y = y;
	rect(_x,_y,w,h);
}


//draw alpha absolute

stroke(0);
fill(0);
text(alph.payload[0],200,200);
text(alph.payload[1],200,220);
text(alph.payload[2],200,240);
text(alph.payload[3],200,260);
text(alph.mean,200,280);

noFill();
rect(100,200,50,300);

var h = map(alph.mean,0,0.5,0,300);
fill(0);

var y = 200 + 300 - h;
rect(100,y,50,h);




}



function parseHorse(msg){

	json = jsonify(msg);
	console.log('json',json);

	horse = json;
}

function parseAlpha(msg){
	json = jsonify(msg);
	console.log('json',json);
	alph = json;

	alph.mean = mean(alph.payload);
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
	var _ts = msg[0];

	//remove second element, the id
	var _id = msg[1];

	//het hold of payload, rest of msg
	var _pl = msg.slice(2);

	//create json object
	return {
		timestamp: _ts,
		id: _id,
		payload: _pl
	};

}


function horseShoeCol(val){
	/*
	Range	1 = Good
2 = OK
3 = Bad
*/


switch(val){
	case 1: return 'green';
	case 2: return 'orange';
	case 3: return 'red';
	default: return 'yellow';
}

}