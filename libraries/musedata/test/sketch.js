
//connection to muse
muse = museData().connection('http://127.0.0.1:8081');
		
//connection with dummyData
//muse = museData().dummyData();
//muse = museData().dummyData(500);

//setting up callbacks to specific id's
muse.listenTo('/muse/eeg',parseMsg);
//muse.listenTo('/muse/elements/raw_fft0', parseMsg);

//start data transmission
muse.start();


function setup() {
  
}

function draw() {
  
}

function parseMsg(msg) {
		console.log('parseMsg',msg);
		//console.log('this',this);
  
  
}