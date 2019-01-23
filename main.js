/*
 * Use the socket.io node module to enable real time communication between a
 * client and your IoT board via a web browser. Use the web browser interface
 * to toggle the state of the IoT device's on-board LED.
 *
 * Supported Intel IoT development boards are identified in the code.
 *
 * See LICENSE.md for license terms and conditions.
 *
 * https://software.intel.com/en-us/xdk/docs/using-templates-nodejs-iot
 */

/* spec jslint and jshint lines for desired JavaScript linting */
/* see http://www.jslint.com/help.html and http://jshint.com/docs */
/* jslint node:true */
/* jshint unused:true */

"use strict" ;


var mraa = require('mraa');
var ubidots = require('ubidots');
var client = ubidots.createClient('A1E-49873c0c03dec75809b4402dc8078fea404a');




console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

//에디슨 핀 정의해주기
var myOnboardLed = new mraa.Gpio(13);
var homePower = new mraa.Gpio(3);
var temperature = new mraa.Aio(1);
var pwmPin = new mraa.Pwm(6);
var pir = new mraa.Gpio(8);
var fire = new mraa.Aio(3);
var sound = new mraa.Aio(2);


// 디지털핀 방향정해주가
homePower.dir(mraa.DIR_OUT);
myOnboardLed.dir(mraa.DIR_OUT);
pir.dir(mraa.DIR_IN);

//PWM 파워 모터 제어부


var ledState = true;
var powerState = true;


var tempRead = temperature.read();
var homePowerRead = homePower.read();



var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connectedUsersArray = [];
var userId;


//참고용 유비도트 소스~

// client.auth(function () {
//   this.getDatasources(function (err, data) {
//     console.log(data.results);
//   });
//
//
//   var ds = this.getDatasource('5b188d79c03f9722f9485219');
//
//   ds.getVariables(function (err, data) {
//     console.log(data.results);
//   });
//
//   // ds.getDetails(function (err, details) {
//   //   console.log(details);
//   // });
//
//   var v = this.getVariable('5b188df6c03f9723781d8840');
//
//   // v.getDetails(function (err, details) {
//   //   console.log(details);
//   // });
//
//   v.saveValue(tempRead);
//
//   v.getValues(function (err, data) {
//     console.log(data.results);
//   });
// });

app.get('/', function(req, res) {
    //Join all arguments together and normalize the resulting path.
    res.sendFile(path.join(__dirname + '/client', 'index.html'));
});

//Allow use of files in client folder
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

//Socket.io Event handlers
io.on('connection', function(socket) {
    setInterval(function () {
      if(temperature.read()>80){
        client.auth(function () {
          var sensor2 = this.getVariable('5b188df6c03f9723781d8840');
          sensor2.saveValue(temperature.read());
        });
      }
        socket.emit( 'temperature' , temperature.read());
    }, 2000);

    setInterval(function () {
      if(fire.read()>80){
        client.auth(function () {
          var firesensor = this.getVariable('5b188defc03f9722f948523c');
          firesensor.saveValue(fire.read());
        });
      }
        socket.emit( 'firesensor' , fire.read());
    }, 200);

    setInterval(function () {
        client.auth(function () {
          if(sound.read()>10){
          var soundsensor = this.getVariable('5b213e19c03f97628c996588');
          soundsensor.saveValue(sound.read());}
        });
        socket.emit( 'sound' , sound.read());
    }, 200);

    setInterval(function() {
      if(pir.read() == true){
        client.auth(function () {
          var pir1 = this.getVariable('5b20ffd7c03f971d182adfa6');
          pir1.saveValue('1');
        });
        socket.emit('pir',true);
        myOnboardLed.write(1);

      }
      else{
        socket.emit('pir',false);
        myOnboardLed.write(0);
      }
    }, 20);

    socket.on('toogle led', function(msg) {
        myOnboardLed.write(ledState?1:0);
        msg.value = ledState;
        io.emit('toogle led', msg);
        ledState = !ledState;
    });
    socket.on('door_button',function(msg){
        if(msg == true){
          console.log("문열림");
          var pwmPin = new mraa.Pwm(6);
          pwmPin.pulsewidth_ms(0.5);
          pwmPin.enable(true);
        }
        else if (msg == false){
          console.log("뭄닫음");
          var pwmPin = new mraa.Pwm(6);
          pwmPin.pulsewidth_ms(2);
          pwmPin.enable(true);
        }
    })

    socket.on('power', function() {
        homePower.write(powerState?1:0);
        var power = powerState;
        io.emit('power',power);
        client.auth(function () {
          var onoff = this.getVariable('5b1a53d4c03f9776be7ca5a2');
          console.log(temperature.read());
          onoff.saveValue(power);

        });
        powerState = !powerState;
    });
});


http.listen(3000, function(){
    console.log('Web server Active listening on *:3000');
});
