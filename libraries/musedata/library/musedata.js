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
// maybe json could also be a solution, maybe this is actually the solution
  var dummyData = '1435306984.407000, /muse/acc, -19.53128, 1011.72034, 117.18768;1435306984.556000, /muse/config, {drlref_conversion_factor": 3225.806396484375, "acc_sample_frequency_hz": 50, "battery_percent_remaining": 8, "eeg_downsample": 16, "notch_frequency_hz": 60, "eeg_locations": [45, 2, 4, 55], "eeg_units": 2, "eeg_output_frequency_hz": 220, "eeg_conversion_factor": 1.6449803113937378, "eeg_channel_layout": "tp9 fp1 fp2 tp10 ", "acc_data_enabled": true, "eeg_sample_frequency_hz": 3520, "mac_addr": "0006666f848c", "preset": "14", "drlref_sample_frequency_hz": 10, "serial_number": "1180-f3he-848c", "filters_enabled": true, "battery_millivolts": 3614, "acc_units": 2, "battery_data_enabled": true, "afe_gain": 1961.0, "compression_enabled": true, "eeg_channel_count": 4, "error_data_enabled": true, "acc_conversion_factor": 3.9062561988830566, "eeg_samples_bitwidth": 10, "drlref_data_enabled": true}';1435306984.564000, /muse/version, '{"build_number": "56", "firmware_type": "consumer", "hardware_version": "18.0.0", "firmware_headset_version": "", "protocol_version": "2", "firmware_bootloader_version": "7.2.5"}';1435306984.569000, /muse/eeg, 889.934387207, 835.650024414, 824.135131836, 835.650024414;1435306984.572000, /muse/eeg/quantization, 1, 1, 1, 1;1435306984.572000, /muse/eeg, 870.194580078, 834.005004883, 819.200195312, 835.650024414;1435306984.572000, /muse/eeg, 866.904663086, 834.005004883, 820.845214844, 845.519897461;1435306984.572000, /muse/eeg, 866.904663086, 842.229919434, 820.845214844, 825.780151367;1435306984.572000, /muse/eeg, 876.774536133, 834.005004883, 812.620300293, 819.200195312;1435306984.573000, /muse/eeg, 875.129516602, 832.360046387, 810.975280762, 815.91027832;1435306984.573000, /muse/eeg, 870.194580078, 832.360046387, 814.265258789, 812.620300293;1435306984.573000, /muse/eeg, 861.969726562, 830.715087891, 819.200195312, 819.200195312;1435306984.573000, /muse/eeg, 908.029174805, 837.29498291, 820.845214844, 815.91027832;1435306984.573000, /muse/eeg, 898.159240723, 835.650024414, 817.555236816, 824.135131836;1435306984.573000, /muse/eeg, 896.514282227, 829.070068359, 814.265258789, 829.070068359;1435306984.573000, /muse/eeg, 884.999450684, 830.715087891, 815.91027832, 835.650024414;1435306984.573000, /muse/eeg, 896.514282227, 819.200195312, 812.620300293, 832.360046387;1435306984.573000, /muse/elements/alpha_relative, 0.0125640165, 0.086403176, 0.10440826, 0.069494285;1435306984.573000, /muse/elements/beta_relative, 0.030681938, 0.105185226, 0.185086, 0.089709364;1435306984.573000, /muse/elements/delta_relative, 0.83907557, 0.4729851, 0.42388573, 0.5739388;1435306984.573000, /muse/elements/gamma_relative, 0.051660016, 0.111099415, 0.119704895, 0.15523003;1435306984.574000, /muse/elements/theta_relative, 0.06601846, 0.22432709, 0.16691512, 0.11162755;1435306984.574000, /muse/elements/horseshoe, 1.0, 1.0, 1.0, 1.0;1435306984.574000, /muse/elements/is_good, 0, 1, 1, 0;1435306984.574000, /muse/elements/blink, 0;1435306984.574000, /muse/elements/jaw_clench, 0;1435306984.574000, /muse/elements/touching_forehead, 1;1435306984.574000, /muse/elements/experimental/concentration, 1.0;1435306984.574000, /muse/elements/experimental/mellow, 0.09479207
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





