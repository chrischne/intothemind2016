var file = 'example_data_short.csv';
var newfile = 'csvastring.txt';
var data;



function preload(){
	data = loadStrings(file);
}

function setup() {
  console.log('data',data);

  //concat rows with a ';'
  var s = data.reduce(function(previousValue, currentValue, currentIndex, array) {
  return previousValue + ';' + currentValue;
});

 console.log(s);
 
 saveStrings([s],newfile);
}

function draw() {
  
}

