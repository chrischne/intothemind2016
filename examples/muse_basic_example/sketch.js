/**
 * This basic example shows how to establish a connection to muse and get data
 * 
 * 
 */

//muse data will be available through this variable
var muse;

function setup() {
  createCanvas(800, 600);

  //use this line to use dummy data (ideal for development)
  muse = museData().dummyData();

  //use this line to make a real connection to muse
  //muse = museData().connection('http://127.0.0.1:8081');

  //listen to the messages we are interested in 
  //muse.listenTo('/muse/eeg');
  //muse.listenTo('/muse/elements/raw_fft0');
  //muse.listenTo('/muse/elements/raw_fft1');
  //muse.listenTo('/muse/elements/raw_fft2');
  //muse.listenTo('/muse/elements/raw_fft3');
  //muse.listenTo('/muse/elements/delta_absolute');
  //muse.listenTo('/muse/elements/theta_absolute');
  //muse.listenTo('/muse/elements/alpha_absolute');
  //muse.listenTo('/muse/elements/beta_absolute');
  //muse.listenTo('/muse/elements/gamma_absolute');
  //muse.listenTo('/muse/elements/delta_relative');
  //muse.listenTo('/muse/elements/theta_relative');
  muse.listenTo('/muse/elements/alpha_relative');
  muse.listenTo('/muse/elements/beta_relative');
  //muse.listenTo('/muse/elements/gamma_relative');
  muse.listenTo('/muse/elements/horseshoe');
  //muse.listenTo('/muse/elements/touching_forehead');
  //muse.listenTo('/muse/elements/blink');
  //muse.listenTo('/muse/elements/jaw_clench');

  //start muse data collection
  muse.start();
}

function draw() {

  //draw a background
  background('white');

  //get the current value for alpha_relative
  var alpha_relative = muse.get('/muse/elements/alpha_relative');

  //get the current value for beta_relative
  var beta_relative = muse.get('/muse/elements/beta_relative');

  //draw circle corresponding to the alpha value (mean of all electrodes)
  //map the alpha value to a value which makes sense for a radius
  var alphaR = map(alpha_relative.mean, 0, 1, 0, 500);
  noStroke();
  fill('#009CDA');
  ellipse(200, 200, alphaR, alphaR);

  //draw another circle corresponding the beta value of the leftEar
  var betaR = map(beta_relative.leftEar, 0, 1, 0, 500);
  noStroke();
  fill('#FF7E00');
  ellipse(400, 200, betaR, betaR);



}