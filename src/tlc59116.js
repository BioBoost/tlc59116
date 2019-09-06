const registers = {
  MODE1: 0x00,
  PWM0: 0x02,
  LEDOUT0: 0x14
}

class Tlc59116 {
  static LED_PER_LED_CONTROL = 0xAA;
  static LEDS = 16;

  constructor(i2c, devAddress=0x60) {
    this.i2c = i2c;
    this.devAddress = devAddress;
    this.enable_led_per_led_control();
    this.enable_oscillator();
  }

  enable_led_per_led_control() {
    let register = this.auto_increment_reg_address(registers.LEDOUT0);
    let pwm = Buffer.alloc(4, Tlc59116.LED_PER_LED_CONTROL);
    this.i2c.writeI2cBlockSync(this.devAddress, register, pwm.length, pwm);
  }

  enable_oscillator() {
    let mode = this.i2c.readByteSync(this.devAddress, registers.MODE1);
    mode &= (~0x01 << 4);
    this.i2c.writeByteSync(this.devAddress, registers.MODE1, mode);
  }

  set_led(index, dutyCycle) {
    if (index < Tlc59116.LEDS && index >= 0) {
      this.i2c.writeByteSync(this.devAddress, registers.PWM0+index, dutyCycle);
    }
  }

  //////////////////////
  // Internal methods //
  //////////////////////

  auto_increment_reg_address(register) {
    return register | (0x01 << 7);
  }

}

module.exports = Tlc59116;