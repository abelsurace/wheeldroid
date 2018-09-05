load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_sys.js');
load('api_timer.js');
load('api_wifi.js');
load("api_rpc.js");
load('api_mqtt.js');
load('api_arduino_ssd1306.js');
load('api_spi.js');
//load('api_i2c.js');
//let myI2C = I2C.get_default();
//I2C.write(myI2C, 0x3c, "\0x0", 1, 1);
let spi = SPI.get();
if (spi===null){
  print('SPI Dissabled');
}


let l1 = 12;
let l2 = 13;
let l3 = 14;
let l4 = 15;

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
    //fi_status: Sys.wifi_status()
  });
};

function clearAll(){
  GPIO.write(l1, 0);
  GPIO.write(l2, 0);
  GPIO.write(l3, 0);
  GPIO.write(l4, 0);
}

function setAll(){
  GPIO.write(l1, 1);
  GPIO.write(l2, 1);
  GPIO.write(l3, 1);
  GPIO.write(l4, 1);
}

// initialize GPIO
GPIO.set_mode(l1, GPIO.MODE_OUTPUT);
GPIO.set_mode(l2, GPIO.MODE_OUTPUT);
GPIO.set_mode(l3, GPIO.MODE_OUTPUT);
GPIO.set_mode(l4, GPIO.MODE_OUTPUT);
clearAll();


RPC.addHandler('onled', function() {
  GPIO.write(l1, 1);
  GPIO.write(l2, 0);
  GPIO.write(l3, 1);
  GPIO.write(l4, 0);

});

RPC.addHandler('offled', function() {
  GPIO.write(l1, 0);
  GPIO.write(l2, 1);
  GPIO.write(l3, 0);
  GPIO.write(l4, 1);

});


// ## **`Adafruit_SSD1306.create_spi(dc, rst, cs, res)`**
// Create an SSD1306 object for SPI.
// `dc` is a number of data command pin, `rst` is a number of reset pin,
// `cs` is a number of chip select pin, `res` is the resolution, one of the:
// - `Adafruit_SSD1306.RES_96_16`
// - `Adafruit_SSD1306.RES_128_32`
// - `Adafruit_SSD1306.RES_128_64`
let d = Adafruit_SSD1306.create_spi(16,5,17, Adafruit_SSD1306.RES_128_64);
// Initialize the display.
//d.begin(Adafruit_SSD1306.EXTERNALVCC, 0x42, true);
d.begin(Adafruit_SSD1306.SWITCHCAPVCC,0x42,true);
d.display();
let i = 0;
let on = false;

let showStr = function(d, str) {
  d.clearDisplay();
  d.setTextSize(2);
  d.setTextColor(Adafruit_SSD1306.WHITE);
  d.setCursor(d.width() / 4, d.height() / 4);
  d.write(str);
  d.display();
};

Timer.set(1000 /* milliseconds */, Timer.REPEAT, function() {
  showStr(d, "i = " + JSON.stringify(i));
  //print("i = ", i);
  i++;
  if (on){
    setAll();
    on=!on;
  }
  else{
    clearAll();
    on=!on;
  }
}, null);

function scanwifi() {
  print('>> Starting scan...');
  Wifi.scan(function(results) {
    if (results === undefined) {
      print('!! Scan error');
      return;
    } else {
      print('++ Scan finished,', results.length, 'results:');
    }
    for (let i = 0; i < results.length; i++) {
      print(' ', JSON.stringify(results[i]));
    }
    print('..', Sys.free_ram());
  });
}

let jsonarray = null;
RPC.addHandler('getWifi', function() {
  Wifi.scan(function(results){
    if (results === undefined) {
      return error;
    } else {
      jsonarray = results;
    }
  });
  return jsonarray;
});

//scanwifi();
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

let obj = null;
RPC.addHandler('sysinfo', function (){
  RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp, ud) {
    obj = resp;
  }, null);
  return obj;
});