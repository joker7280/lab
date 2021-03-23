const net = require('net');

function connectAlimentatore() {
  client = net.createConnection({ port: 8888, host: '192.168.1.200', reconnectInterval: 150 }, () => {
    console.log('connected to alimentatore!');
    client.write('SYST:REM\n');
    client.write('OUTP 0\n');
  });
  client.on('data', function(data){
    console.log(data.toString());
    io.sockets.emit('updateAlimentatore', data.toString());
  });
  client.on('error', () => {
    console.log('ERROR: disconnected from server');
    connectAlimentatore();
  });
}

connectAlimentatore();

setInterval(function(){
  client.destroy();
  connectAlimentatore();
}, 43200000)


const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline
const port = new SerialPort('/dev/ttyUSB0', {
   baudRate: 38400
 }, function(){
      console.log("Carico connesso");
      port.write("LOAD OFF\n");
 });
const parser = new Readline()

const cv = require('opencv4nodejs');

const express = require('express');

const app = express();

const server = require('http').Server(app);

const io = require("socket.io")(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //req.headers.origin or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": false
        };
        res.writeHead(200, headers);
        res.end();
    }
});

port.pipe(parser)

function getVoltAlimentatore() {
  client.write(Buffer.from('MEAS:VOLT?\n'));
}

function getAmpereAlimentatore(){
  client.write(Buffer.from('MEAS:CURR?\n'));
}

function getOhmCarico(){
  port.write("LOAD:RES?\n");
}
function getVoltCarico(){
  port.write("LOAD:VOLT?\n");
}
function getPowCarico(){
  port.write("LOAD:POW?\n");
}
function getAmpCarico(){
  port.write("LOAD:CURR?\n");
}
function getTestResult(){
  port.write("FETCH?\n");
}

// setInterval(getVoltAlimentatore, 1000);
setInterval(getAmpereAlimentatore, 1000);
// setInterval(getOhmCarico, 1100);
// setInterval(getVoltCarico, 1100);
// setInterval(getPowCarico, 1200);
// setInterval(getAmpCarico, 1300);
setInterval(getTestResult, 1000);


parser.on('data', function(data){
   console.log(data);
   io.sockets.emit('updateCarico', data);
});

io.sockets.on('connection', function(socket){

  socket.on('setVolt', function(value) {
    client.write(Buffer.from('VOLT '+value+'V\n'), function(){
      console.log("Alimentatore: nuovo valore di VOLT da "+socket.username+": " + value);
    });
    port.write('LOAD:MODE CR\n');
    port.write('LOAD:RES 0\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setAmpere', function(value) {
    client.write(Buffer.from('CURR '+value+'A\n'), function(){
      console.log("Alimentatore: nuovo valore di AMPERE da "+socket.username+": " + value);
    });
  });

  socket.on('setMode_C', function(value){
    console.log("Carico: nuova modalità da "+socket.username+": " + value);
    port.write('LOAD:MODE '+value+'\n');
    port.write('LOAD:MODE '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setOhm_C', function(value){
    console.log("Carico: nuovo valore di OHM da "+socket.username+": " + value);
    port.write('LOAD:RES '+value+'\n');
    port.write('LOAD:RES '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setVolt_C', function(value){
    console.log("Carico: nuovo valore di VOLT da "+socket.username+": " + value);
    port.write('LOAD:VOLT '+value+'\n');
    port.write('LOAD:VOLT '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setWatt_C', function(value){
    console.log("Carico: nuovo valore di WATT da "+socket.username+": " + value);
    port.write('LOAD:POW '+value+'\n');
    port.write('LOAD:POW '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setAmpere_C', function(value){
    console.log("Carico: nuovo valore di AMPERE da "+socket.username+": " + value);
    port.write('LOAD:CURR '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
    port.write('LOAD:CURR '+value+'\n');
  });

  socket.on('setTest', function(value){
    console.log("Test scelto da "+socket.username+": " + value);
    port.write("LOAD OFF\n");
    port.write("LOAD OFF\n");
    port.write("LOAD OFF\n");
    client.write(Buffer.from('OUTP 0\n'));
  });

  socket.on('startTest', function(value){
    if(value==='carica'){
      client.write(Buffer.from('OUTP 1\n'));
      port.write('LOAD ON\n');
      port.write('LOAD ON\n');
      port.write('LOAD ON\n');
    }
    if(value==='scarica'){
      port.write("LOAD ON\n");
      port.write("LOAD ON\n");
      port.write("LOAD ON\n");
    }
  });

  socket.on('newTest', function(){
    port.write("LOAD OFF\n");
    port.write("LOAD OFF\n");
    port.write("LOAD OFF\n");
    client.write(Buffer.from('OUTP 0\n'));
  });

});

const FPS = 3;
const wCap = new cv.VideoCapture(0, cv.CAP_DSHOW);
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 300);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT,300);

const wCap2 = new cv.VideoCapture(2, cv.CAP_DSHOW);
wCap2.set(cv.CAP_PROP_FRAME_WIDTH, 300);
wCap2.set(cv.CAP_PROP_FRAME_HEIGHT, 300);

function camera1() {
	setInterval(() => {
		const frame = wCap.read().resize(400,300);
		const image = cv.imencode('.jpg', frame).toString('base64');
		io.emit('image', image);
	}, 1000 / FPS)
}

function camera2() {
	setInterval(() => {
		const frame = wCap2.read().resize(400,300);
		const image = cv.imencode('.jpg', frame).toString('base64');
		io.emit('image2', image);
	}, 1000/ FPS)
}

setTimeout(camera1, 1100);
setTimeout(camera2, 1300);

server.listen(8081);
