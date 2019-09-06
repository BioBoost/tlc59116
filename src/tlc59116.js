const registers = {
  MODE1: 0x00,
  PWM0: 0x02,
  GROUP_PWM: 0x12,
  GROUP_FREQ: 0x13,
  LEDOUT0: 0x14
}

class Tlc59116 {
  static LED_PER_LED_CONTROL = 0xAA;
  static GROUP_CONTROL = 0xFF;
  static LEDS = 16;

  constructor(i2c, devAddress=0x60) {
    this.i2c = i2c;
    this.devAddress = devAddress;
    this.enable_led_per_led_control();
    this.enable_oscillator();
  }

  enable_led_per_led_control() {
    this.configure_group_control(Tlc59116.LED_PER_LED_CONTROL);
  }

  enable_group_control() {
    this.configure_group_control(Tlc59116.GROUP_CONTROL);
  }

  disable_group_control() {
    this.enable_led_per_led_control();
  }

  enable_oscillator() {
    this.clear_single_bit(registers.MODE1, 4);
  }

  set_led(index, dutyCycle) {
    if (index < Tlc59116.LEDS && index >= 0) {
      this.i2c.writeByteSync(this.devAddress, registers.PWM0+index, dutyCycle);
    }
  }

  group_dim(brightness) {
    this.i2c.writeByteSync(this.devAddress, registers.GROUP_PWM, brightness);
  }

  //////////////////////
  // Internal methods //
  //////////////////////

  configure_group_control(mode) {
    let register = this.auto_increment_reg_address(registers.LEDOUT0);
    let bytes = Buffer.alloc(4, mode);
    this.i2c.writeI2cBlockSync(this.devAddress, register, bytes.length, bytes);
  }

  set_single_bit(register, bitPosition) {
    this.change_single_bit(register, bitPosition, 1);
  }

  clear_single_bit(register, bitPosition) {
    this.change_single_bit(register, bitPosition, 0);
  }

  change_single_bit(register, bitPosition, value) {
    if (bitPosition >= 0 && bitPosition < 8) {
      let byte = this.i2c.readByteSync(this.devAddress, register);
      if (value > 0) {
        byte |= (0x01 << bitPosition);
      } else {
        byte &= (~0x01 << bitPosition);
      }
      this.i2c.writeByteSync(this.devAddress, register, byte);
    }
  }

  auto_increment_reg_address(register) {
    return register | (0x01 << 7);
  }

}

module.exports = Tlc59116;