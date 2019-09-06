class Tlc59116 {

  constructor(i2c, devAddress=0x60) {
    this.i2c = i2c;
    this.devAddress = devAddress;
  }

}

module.exports = Tlc59116;