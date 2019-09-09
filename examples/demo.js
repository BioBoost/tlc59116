const Tlc59116 = require('tlc59116');
const i2c = require('i2c-bus');

const i2c1 = i2c.open(1, (err) => {
  if (err) throw err;
  console.log("Opened i2c bus successfully");

  let leds = new Tlc59116(i2c1);
  for (let i = 0; i < 16; i++) {
    leds.set_led(i, 100);
  }

  setTimeout(() => {
    console.log("Dimming");
    leds.enable_group_control();
    leds.group_dim(128);
  }, 1000);

  setTimeout(() => {
    console.log("Blinking")
    leds.enable_group_control();
    leds.group_blink(500, 5);
  }, 3000);

  setTimeout(() => {
    console.log("Dimming");
    leds.disable_group_control();
  }, 5000);

  setTimeout(() => {
    console.log("Done");
    leds.all_off();
  }, 8000);

});