// video status
var Play;
var Pause;
let videoLength;
let videoIndex; // Declare as global to share between functions
let currentSubtitle; // For managing subtitle DOM element
let isVideoPlaying = true;


let videos = [];
let currentVideo;
let videoBank = ['../videos/video1.mp4', '../videos/video2.mp4', '../videos/video3.mp4','../videos/video4.mp4','../videos/video5.mp4','../videos/video6.mp4'];
let subtitles = [
 "clip from Mother's Village, announcing the correlation between sterilization rate and government officials' performance",
 "clip from Mother's Village, announcing sterilization on the radio",
 "clip from How Women Fight Against Chinese Family Planning Policies, announcing the change in population policy",
 "clip from How Women Fight Against Chinese Family Planning Policies, propaganda",
 "clip from How Women Fight Against Chinese Family Planning Policies, propaganda",
 "clip from Mother's Village, family planning "
];


// serial communication
const serial = new p5.WebSerial();
let portButton;
let inData;
let latestData = "waiting for data"; // variable to hold the data
let currentString;


function preload() {
 // Preload videos
 for (let i = 0; i < videoBank.length; i++) {
   videos[i] = createVideo(videoBank[i]);
   videos[i].hide();
     // console.log("Video loaded: " + videoBank[i]);
 }
}


function setup() {
 createCanvas(windowWidth, windowHeight);
 videoIndex = int(random(videoBank.length));  // define which video to play
 Play = createButton ("Play");
 Pause = createButton ("Pause/ Resume");
 // button styling
// console.log(Play.position()); --> 0,1024
Play.position((windowWidth-800)/2, (windowHeight-450)/2 + 580);
Pause.position((windowWidth-800)/2+60, (windowHeight-450)/2 + 580);


 // serial communication
 if (!navigator.serial) {
   alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
 }
 navigator.serial.addEventListener("connect", portConnect);
 navigator.serial.addEventListener("disconnect", portDisconnect);
 serial.getPorts();
 serial.on("noport", makePortButton);
 serial.on("portavailable", openPort);
 serial.on("requesterror", portError);
 serial.on("data", serialEvent);
 serial.on("close", makePortButton);
 textSize(40);
}


function draw() {
 background(255);
 if (currentVideo) {
   image(currentVideo, (windowWidth-800)/2, (windowHeight-450)/2, 800, 450);
 }
 // /👹 change codes here to sensor control -- 1️⃣1️⃣ -- done
 Play.mousePressed(playVideo);
 Pause.mousePressed(pauseVideo);
}




function playVideo() {
 if (currentVideo) {
   currentVideo.stop();
 }
// if there is a valid value in "current video" or the video is not paused 
 videoIndex = int(random(videoBank.length));
 currentVideo = videos[videoIndex];
 currentVideo.play();
 videoLength = currentVideo.duration()
 console.log(videoLength);


 // check if the video has finished
 if (currentVideo.time() >= int(videoLength)) {
   isVideoPlaying = false;
   serial.write("x");
 }


 if (currentVideo.time() >= int(videoLength)) {
   serial.write('S');
 }




 // Manage subtitle
 if (currentSubtitle) {
   currentSubtitle.remove();
 }
 currentSubtitle = createP(subtitles[videoIndex]);
 currentSubtitle.style('font-size', '18px');
 currentSubtitle.position((windowWidth-800)/2, (windowHeight-450)/2 + 480);
}


function pauseVideo(){
 if (!isVideoPlaying){
   currentVideo.play();
   isVideoPlaying = true;
 }else{
   currentVideo.pause();
   isVideoPlaying = false ;
 }
}




// 🎃 serial communication 🎃
// send and receive data
function serialEvent() {
 let currentString = serial.readLine();
 // // trim(currentString); // get rid of whitespace
 // if (!currentString) return; // if there's nothing in there, ignore it
 // console.log(currentString); // print it out
 latestData = currentString; // save it to the global variable


 if (currentString) {
   // sensors = split(inString, ",");
   serial.write("x"); //do a serial write back to arduino
 }


 if (latestData < 500){
   playVideo();
   console.log("play");
   // but it will keep (re)playing the video -- work this out 2️⃣2️⃣
 }
}




// utilities
function makePortButton() {
 portButton = createButton("choose port");
 portButton.position(10, 10);
 portButton.mousePressed(choosePort);
}
function choosePort() {
 serial.requestPort();
}
function openPort() {


 serial.open().then(initiateSerial);


 // once the port opens, let the user know:
 function initiateSerial() {
   console.log("port open");
   // serial.println(brightness + "," + angle);
   serial.write("x");
 }
 // hide the port button once a port is chosen:
 if (portButton) portButton.hide();
}
function portError(err) {
 alert("Serial port error: " + err);
}
function portConnect() {
 console.log("port connected");
 serial.getPorts();
}
function portDisconnect() {
 serial.close();
 console.log("port disconnected");
}
