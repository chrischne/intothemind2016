//muse = museData().connection('ws://10.0.1.4:1234');
		//muse = museData().connection('http://127.0.0.1:8081');
		
		muse = museData().dummyData(500);
		muse.listenTo('/muse/elements/raw_fft0', -40, 20, 129, parseMsg);
		//muse.listenTo('/muse/elements/raw_fft0', parseMsg);
		//setInterval(updat,1000);
		muse.start();


function setup() {
  
}

function draw() {
  
}


function parseMsg(msg) {
		console.log('parseMsg',msg);
		//console.log('this',this);
  
  
}