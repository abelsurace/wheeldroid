load('api_rpc.js');
load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_sys.js');
load('api_timer.js')
load('api_net.js');
load('api_wifi.js');
load('api_mqtt.js');
load('api_arduino_ssd1306.js');
load('api_spi.js');
load('api_pwm.js');
//load('api_i2c.js');
//let myI2C = I2C.get_default();
//I2C.write(myI2C, 0x3c, "\0x0", 1, 1);
let spi = SPI.get();
if (spi===null){
  print('SPI Dissabled');
}

let L1 = 12;
let R1 = 13;
let L2 = 14;
let R2 = 15;


let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

// initialize GPIO
GPIO.set_mode(L1, GPIO.MODE_OUTPUT);
GPIO.set_mode(R1, GPIO.MODE_OUTPUT);
GPIO.set_mode(L2, GPIO.MODE_OUTPUT);
GPIO.set_mode(R2, GPIO.MODE_OUTPUT);

function stop(){
  GPIO.write(L1, 0);
  GPIO.write(L2, 0);
  GPIO.write(R1, 0);
  GPIO.write(R2, 0);
}

function setall(){
  GPIO.write(L1, 1);
  GPIO.write(L2, 1);
  GPIO.write(R1, 1);
  GPIO.write(R2, 1);
}

function forward (){
  GPIO.write(L1, 0);
  GPIO.write(R1, 1);
  GPIO.write(L2, 0);
  GPIO.write(R2, 1);
}

function backward (){
  GPIO.write(L1, 1);
  GPIO.write(R1, 0);
  GPIO.write(L2, 1);
  GPIO.write(R2, 0);
}

function spinleft (){
  GPIO.write(L1, 1);
  GPIO.write(R1, 0);
  GPIO.write(L2, 0);
  GPIO.write(R2, 1);
}

function spinright (){
  GPIO.write(L1, 0);
  GPIO.write(R1, 1);
  GPIO.write(L2, 1);
  GPIO.write(R2, 0);
}

function setspeed(speed){
  PWM.set(33, 1000, speed);
}

RPC.addHandler('stop', stop());
RPC.addHandler('forward', function(){
  forward()
});
RPC.addHandler('backward', function(){
  backward()
});
RPC.addHandler('spinleft', function(){
  spinleft()
});
RPC.addHandler('spinright', function(){
  spinright()
});
RPC.addHandler('setspeed', function(a){
  setspeed(a.speed);
});


stop();
setspeed (1);

// let i=0;
// let message = '';
// Timer.set(2000 /* milliseconds */, Timer.REPEAT, function() {

//   i++;
//     if(i===1){
//       forward();
//       message = 'forward'
//     } 
//     if(i===2){
//       backward();
//       message = 'backward'
//     } 
//     if(i===3){
//        spinleft();
//        message = 'spin left'
//     }
//     if(i===4){
//       spinright(); i=0
//       message = 'spin right'
//     }
//       showStr(message, 2, 0, 0);
// }, null);



// ## **`Adafruit_SSD1306.create_spi(dc, rst, cs, res)`**
// Create an SSD1306 object for SPI.
// `dc` is a number of data command pin, `rst` is a number of reset pin,
// `cs` is a number of chip select pin, `res` is the resolution, one of the:
// - `Adafruit_SSD1306.RES_96_16`
// - `Adafruit_SSD1306.RES_128_32`
// - `Adafruit_SSD1306.RES_128_64`
let d = Adafruit_SSD1306.create_spi(16,5,17, Adafruit_SSD1306.RES_128_64);
d.begin(Adafruit_SSD1306.SWITCHCAPVCC,0x42,true);

let i = 0;
let on = false;
  d.clearDisplay();
let showStr = function(str, size, x, y) {
  d.clearDisplay();
  d.setTextSize(size);
  d.setTextColor(Adafruit_SSD1306.WHITE);
  d.setCursor(x, y);
  d.write(str);
  d.display();
};

RPC.addHandler('textToScreen', function (a){
 showStr(a.text, a.size, a.x, a.y);
});

Wifi.scan(function(results){
  if (results === undefined) {
    print('!! Scan error');
    return;
  } else {
    for (let i = 0; i < results.length; i++) {
      print('SSID: ', results[i].ssid);
    }
  }
});


//Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:' , ev , evs);
   // showStr( JSON.stringify({ ev: ev, evs: evs }), 1, 0, 16);
}, null);

