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


