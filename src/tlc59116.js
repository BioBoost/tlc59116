const registers = {
  MODE1: 0x00,
  MODE2: 0x01,
  PWM0: 0x02,
  GROUP_PWM: 0x12,
  GROUP_FREQ: 0x13,
  LEDOUT0: 0x14
}

class Tlc59116 {
  static LED_PER_LED_CONTROL = 0xAA;
  static GROUP_CONTROL = 0xFF;
  static LEDS = 16;
  static MIN_PERIOD_MS = 41;
  static MAX_PERIOD_MS = 10730;

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
    this.switch_group_control_to_dimming();
    this.i2c.writeByteSync(this.devAddress, registers.GROUP_PWM, brightness);
  }

  group_blink(period_ms, dutyCycle_percentage=50) {
    this.switch_group_control_to_blinking();

    period_ms = Math.max(Math.min(period_ms, Tlc59116.MAX_PERIOD_MS), Tlc59116.MIN_PERIOD_MS);
    let freq = Math.floor(255 * (period_ms - Tlc59116.MIN_PERIOD_MS) / (Tlc59116.MAX_PERIOD_MS-Tlc59116.MIN_PERIOD_MS));

    dutyCycle_percentage = Math.max(Math.min(dutyCycle_percentage, 100), 0);
    let dc = Math.floor(255 * dutyCycle_percentage / 100.0);

    this.i2c.writeByteSync(this.devAddress, registers.GROUP_FREQ, freq);
    this.i2c.writeByteSync(this.devAddress, registers.GROUP_PWM, dc);
  }

  all_off() {
    let register = this.auto_increment_reg_address(registers.PWM0);
    let pwm = Buffer.alloc(Tlc59116.LEDS, 0);
    this.i2c.writeI2cBlockSync(this.devAddress, register, pwm.length, pwm);
  }

  //////////////////////
  // Internal methods //
  //////////////////////

  configure_group_control(mode) {
    let register = this.auto_increment_reg_address(registers.LEDOUT0);
    let bytes = Buffer.alloc(4, mode);
    this.i2c.writeI2cBlockSync(this.devAddress, register, bytes.length, bytes);
  }

  switch_group_control_to_dimming() {
    this.clear_single_bit(registers.MODE2, 5);
  }

  switch_group_control_to_blinking() {
    this.set_single_bit(registers.MODE2, 5);
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