function museData(){

 function my() {
    // generate chart here, using `width` and `height`
  }

  my.connection = function(url) {
    console.log('museData.connection');
    if (!arguments.length) {
      console.log('museData.connection: no url for websocket specified');
      return null;
    }
    return museConnector(url);
  };

  my.dummyData = function(interval) {
   if (!arguments.length) {
      return new DummyConnector();
    }
   return dummyConnector(interval);
  };



  return my;

};



function museConnector(_url){
  
  var url = _url;
 // var ws = null;
 var socket = null;
  var callbacks = [];

  function my(){
    console.log('museConnector.my');
  }


  my.start = function(){
     console.log('museConnector.start');
     //ws = new WebSocket(url);
    socket = io.connect(url);
     console.log('socket',socket);
    // ws.onmessage = this.onMsg;
    socket.on('muse', this.onMsg);

     return my;
  }

  my.stop = function(){
    console.log('museConnector.stop');
    ws.onclose = function(){};
    ws.close();
    ws = null;
  }

  my.listenTo = function(_id,_cb){
    console.log('museConnector.listenTo');
    //maybe here better to make and objec {id: callback: }
    //or maybe better not. 
    callbacks[_id] = _cb;
    return my;
  }

  my.onMsg = function(obj){
    //console.log('museConnector.onMsg: ',obj);
     //var msg = obj.split(',');

     //convert numbers to numbers
    var msg = obj.map(function(d){
      if(isNaN(d)){
        return d;
      }
      return +d;
     });
    


    var id = msg[0];
    var cback = callbacks[id];

    if(cback){
      cback(msg);
    }

    return my;

  }

  my.disconnect = function(){
    console.log('museConnector.disconnect');
    ws.close();
  }

return my;

}






function dummyConnector(interval){

 console.log('dummyConnector');
  var ws = null;
  var interval = interval ? interval : 1000; 
  var callbacks = [];
  var intervalID = null;

//we have a problem here
//needed: have raw data be like in a string, new lines pose problems
//solution:
//parse csv seperately with loadStrings, then add anoter separatore (e.g ;) at the end of each line, make one string out of it and then save that string
//then parse that string in here
  var dummyData = '1435306984.580000, /muse/elements/low_freqs_absolute, 1.836554, 0.8187782, 0.91968286, 1.251716\n1435306984.580000, /muse/elements/alpha_absolute, -0.021011103, -0.08811933, 0.16697657, 0.2576157\n1435306984.580000, /muse/elements/beta_absolute, 0.36674318, -0.0026942915, 0.4156153, 0.36850438\n1435306984.580000, /muse/elements/delta_absolute, 1.8036615, 0.6501984, 0.7754905, 1.1745322\n1435306984.580000, /muse/elements/gamma_absolute, 0.5930149, 0.021062711, 0.22635365, 0.60664237\n1435306984.581000, /muse/elements/theta_absolute, 0.6995258, 0.32623267, 0.3707374, 0.46343797\n1435306984.581000, /muse/elements/alpha_session_score, 0.0, 0.08108108, 0.47540984, 0.0\n1435306984.581000, /muse/elements/beta_session_score, 0.021276595, 0.23076923, 0.6320755, 0.13333334\n1435306984.581000, /muse/elements/delta_session_score, 1.0, 0.5411765, 0.7152318, 0.7708333\n
1435306984.581000, /muse/elements/gamma_session_score, 0.7941176, 0.5441176, 0.60583943, 1.0\n
1435306984.581000, /muse/elements/theta_session_score, 0.7105263, 0.5390625, 0.7314815, 0.372\n
 

  function my(){

    console.log('my');
   
    
  }

  my.listenTo = function(_id,_min,_max,_n,_cb){
      console.log('dummyConnector.listenTo');
     /* callbacks[_id] = {
          id: _id,
          min: _min,
          max: _max,
          callback: _cb;
      };*/

      var obj = {
          id: _id,
          min: _min,
          max: _max,
          n: _n,
          callback: _cb
      };

      callbacks.push(obj);
      console.log('callbacks',callbacks);
      return my;
  }
  my.genMsg = function(){
   // console.log('dummyConnector.genMsg');
    var noiseScale = 1;
    callbacks.forEach(function(c,pos){

      var msg = [c.id];
      for(var i=0; i<c.n; i++){
        //var val = noise(noiseScale*pos,i*noiseScale,0.0005*millis());//random(c.min,c.max);
        var val = Math.random() * (c.max - c.min) + c.min;
        msg.push(val);
      }
      c.callback(msg);
    });

    return my;
  }

  my.start = function(){
    console.log('dummyConnector.start');
    intervalID = setInterval(this.genMsg, interval);
    return my;

  }

  my.stop = function(){
     console.log('dummyConnector.stop');
    clearInterval(intervalID);
    return my;
  }



  return my;

};





