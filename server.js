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

var client = require('socket.io-client');

console.log("start");

// *******************************************************************
// ************ ESPERIMENTO CARICA/SCARICA CONDENSATORE **************

// var circuitoRC = client.connect("http://10.0.0.239:8081", {
//     reconnection: true}
// );

var circuitoRC = client.connect("192.168.1.17:8000", {
    reconnection: true,
  }
);


// UPDATE VALORI DELL'ALIMENTATORE
circuitoRC.on('updateAlimentatore', function(value){
  console.log(value);
  io.sockets.emit('updateAlimentatore', value);
})

// UPDATE VALORI DEL CARICO ELETTRONICO
circuitoRC.on('updateCarico', function(value){
  io.sockets.emit('updateCarico', value);
  console.log(value);
})

circuitoRC.on('welcome', function(value){
  console.log(value);
})

// UPDATE WEBCAM 1
circuitoRC.on('image', function(value){
  io.sockets.emit('image', value);
})

// UPDATE WEBCAM 2
circuitoRC.on('image2', function(value){
  io.sockets.emit('image2', value);
})

// IO.ON SI ATTIVA QUANDO UNO STUDENTE ENTRA IN LABORATORIO
io.on('connection', function(socket){

  // RICEZIONE MESSAGGI INVIATI IN CHAT
  socket.on('chat message', function(msg){
    console.log('message: '+msg);
  });

});

io.sockets.on('connection', function(socket){

  // Aggiornamento utenti connessi: nuovo utente
  io.emit('connectedClients',io.engine.clientsCount);

  // ********* LOG IN CHAT ***********

  // Utente si è connesso
  socket.on('username', function(username){
    socket.username = username;
    console.log(socket.username + ' si è connesso');
    io.emit('is_online', '<i>' + socket.username + ' è entrato in laboratorio</i>');
  });

  // Utente si è disconnesso
  socket.on('disconnect', function(username){
    io.emit('is_online', '<i>' + socket.username + ' ha lasciato il laboratorio</i>');
    console.log(socket.username + ' si è disconnesso');
  });

  // Aggiornamento Utenti connessi: utente ha lasciato
  socket.on('disconnect', function(counts){
    io.emit('connectedClients',io.engine.clientsCount);
  });

  // Stampa dei messaggi ricevuti in chat
  socket.on('chat message', function(message) {
    io.emit('chat message', '<strong>' + socket.username + '</strong>: ' + message);
  });


  // UTENTE AGGIORNA I VOLT DELL'ALIMENTATORE (test di carica)
  // 1) Invio comando al raspberry
  // 2) Aggiornamento di tutti i client connessi
  // 3) Invio log in chat
  socket.on('setVolt', function(value) {
    console.log("Alimentatore: nuovo valore di VOLT da "+socket.username+": " + value);
    circuitoRC.emit('setVolt', value); // 1
    io.emit('setVolt'); // 2
    io.emit('is_online', '<i>' + socket.username + ' ha impostato l\'alimentatore a ' + value +' VOLT</i>', value); // 3
  });


  // UTENTE AGGIORNA GLI AMPERE DELL'ALIMENTATORE (test di carica)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setAmpere', function(value) {
    console.log("Alimentatore: nuovo valore di AMPERE da "+socket.username+": " + value);
    circuitoRC.emit('setAmpere', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato l\'alimentatore a ' + value +' AMPERE</i>', value); // 2
  });


  // UTENTE AGGIORNA MODALITA DEL CARICO (test di scarica)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setMode_C', function(value){
    console.log("Carico: nuova modalità da "+socket.username+": " + value);
    circuitoRC.emit('setMode_C', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato il carico in modalità ' + value +'</i>', value); // 2
  });


  // UTENTE AGGIORNA GLI OHM DEL CARICO (test di carica)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setOhm_C', function(value){
    console.log("Carico: nuovo valore di OHM da "+socket.username+": " + value);
    circuitoRC.emit('setOhm_C', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato il carico a ' + value +' OHM</i>', value); // 2
  });



  // UTENTE AGGIORNA I VOLT DEL CARICO (funzionalità disattivata)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setVolt_C', function(value){
    console.log("Carico: nuovo valore di VOLT da "+socket.username+": " + value);
    circuitoRC.emit('setVolt_C', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato il carico a ' + value +' VOLT</i>', value); // 2
  });

  // UTENTE AGGIORNA I WATT DEL CARICO (test di scarica)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setWatt_C', function(value){
    console.log("Carico: nuovo valore di WATT da "+socket.username+": " + value);
    circuitoRC.emit('setWatt_C', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato il carico a ' + value +' WATT</i>', value); // 2
  });


  // UTENTE AGGIORNA AMPERE DEL CARICO (test di scarica)
  // 1) Invio comando al raspberry
  // 2) Invio log in chat (client aggiornati da circuitoRC.js)
  socket.on('setAmpere_C', function(value){
    console.log("Carico: nuovo valore di AMPERE da "+socket.username+": " + value);
    circuitoRC.emit('setAmpere_C', value); // 1
    io.emit('is_online', '<i>' + socket.username + ' ha impostato il carico a ' + value +' AMPERE</i>', value); // 2
  });


  // UTENTE IMPOSTA UN TEST DI CARICA O SCARICA
  // 1) Invio comando al raspberry
  // 2) Aggiornamento di tutti i client
  // 3) Invio log in chat
  socket.on('setTest', function(value){
    console.log("Test scelto da "+socket.username+": " + value);
    circuitoRC.emit('setTest', value); // 1
    io.emit('chooseTest', socket.username); // 2
    io.emit('is_online', '<i>' + socket.username + ' ha impostato un test di '+value+'</i>', value);
  });



  // UTENTE INIZIA UN TEST
  // 1) Invio comando al raspberry
  // 2) Aggiornamento di tutti i client
  // 3) Invio log in chat
  socket.on('startTest', function(value){
    circuitoRC.emit('startTest', value); // 1
    io.emit('start', value, socket.username); // 2
    io.emit('is_online', '<i>' + socket.username + ' ha avviato un test di ' + value + '</i>'); // 3
  });


  // UTENTE INIZIA UN TEST
  // 1) Invio comando al raspberry
  // 2) Aggiornamento di tutti i client
  // 3) Invio log in chat
  socket.on('newTest', function(){
    circuitoRC.emit('newTest'); // 1
    io.emit('newTest'); // 2
    io.emit('is_online', '<i>' + socket.username + ' ha annullato il test</i>'); // 3
  });


  // UTENTE RICHIEDE I RISULTATI DI UN TEST
  // 1) Aggiornamento di tutti i client
  // 2) Invio log in chat
  socket.on('getResult', function(value){
    io.emit('result', value);
    io.emit('is_online', '<i>Test di '+value+': ' + socket.username + ' ha visualizzato i risultati</i>');
  });

});

// ************ ESPERIMENTO CARICA/SCARICA CONDENSATORE **************
// *******************************************************************




server.listen(8000);
