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
      return  dummyConnector();
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
  //  console.log('id',id);
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
  var interval = interval ? interval : 200; 
  var callbacks = [];
  var intervalID = null;
  var data = [];
  var msgIndex = 0;
  

  function my(){

    console.log('my');
    
    
  }

  my.listenTo = function(_id,_cb){
      console.log('dummyConnector.listenTo');
   
      callbacks[_id] = _cb;
      console.log('callbacks',callbacks);
      return my;
  }
  my.onMsg = function(){
   // console.log('dummyConnector.genMsg');

   var msg = data[msgIndex];
   msgIndex = msgIndex === (data.length -1 ) ? 0 : (msgIndex + 1);

   //console.log('msg',msg);
   //console.log('data',data);
     var id = msg[1];
     console.log('id',id);
    var cback = callbacks[id];

    if(cback){
      cback(msg);
    }
    return my;
  }

  my.start = function(){
    console.log('dummyConnector.start');
    data = exampleData();
    intervalID = setInterval(this.onMsg, interval);
    return my;

  }

  my.stop = function(){
     console.log('dummyConnector.stop');
    clearInterval(intervalID);
    return my;
  }



  return my;

};









