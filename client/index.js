var socket = io();
var userId = "user";



$("#power-control").on('click', function(e){
    socket.emit('power');
});

$("#led-link").on('click', function(e){
    socket.emit('toogle led', {value: 0, userId: userId});
});

$("#door-control").on('click', function(msg){
    socket.emit('door_button', {value: 1500});
});

$('#open').on('click', function(msg){
    socket.emit('door_button', true);

});

$('#close').on('click', function(msg){
    socket.emit('door_button', false);
    console.log("a");
});

socket.on('toogle led', function(msg) {
    if(msg.value === false) {
        $("#led-container span").text("OFF");
    }
    else if(msg.value === true) {
        $("#led-container span").text("ON");
    }
});

socket.on('pir',function(msg) {
  if(msg == true){
    $('#detect-control').text("누군가 침입했습니다.");

  }if(msg== false){
    $('#detect-control').text("집은 안전합니다.");
  }
});


socket.on('power', function(msg){
  if(msg === true) {
    $('.power-show span')[0].innerHTML=('<h3>전기가 켜져있어요!</h3>');
  }
  if(msg === false) {
    $('.power-show span').text("전기가 꺼져있어요!");
  }
});
socket.on('sound', function(data) {
    $('#sound')[0].innerHTML = ('집의 소음수치는 : ' + data + ' ');
});

socket.on('temperature', function(data) {
    $('.temp-show span')[0].innerHTML = ('집의 온도는 : ' + data + '  °F  (화씨) 이고 섭씨로는 ' + Math.floor((data-32) * 5 / 9) + ' °C 입니다.');
});

socket.on('firesensor', function(data) {
    $('#detect-fire')[0].innerHTML = ('화염 센서의 값 : ' + data + '');
});
