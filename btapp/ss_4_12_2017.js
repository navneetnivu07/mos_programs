load('api_gpio.js');
load("api_rpc.js");
load("api_file.js");
load('api_uart.js');
load('api_mqtt.js');
load("api_file.js");

let d4 = 2; // GPIO2 : D4 // Built-in LED 
GPIO.set_mode(d4, GPIO.MODE_OUTPUT); // Config D4 as Output Pin

//let fileData = File.read('index.html');
let uartNo = 0;   // Uart number used for this example

// Configure UART at 115200 baud
UART.setConfig(uartNo, {
  baudRate: 9600,
  esp8266: {
    gpio: {
      rx:3,
      tx: 1,
    },
  },
});

RPC.addHandler('control', function(args) {
  //let response = GPIO.write(args.pin, args.val);
  let state = UART.write(uartNo, args.val);
  //File.write("state", "index.html");
  return true;
});

RPC.addHandler('sa0', function(args) {
  let state = UART.write(uartNo, "SA0");
  let fileData = File.read('data.txt');
  return JSON.stringify({'ra': fileData});
});

RPC.addHandler('conf', function(args) {
  let data = "";
  RPC.call(RPC.LOCAL, 'Sys.GetInfo', null, function (resp,ud) {
    MQTT.pub('data', JSON.stringify(resp), 1);
  }, null);
  
  if(data.length > 0){
  return "data";
  }else {
    return "else";
  }
  
});

UART.setDispatcher(uartNo, function(uartNo) {
  let ra = UART.read(uartNo);
  if (ra.length > 0) {
      File.write(ra, "data.txt");
  }
}, null);

UART.setRxEnabled(uartNo, true);

