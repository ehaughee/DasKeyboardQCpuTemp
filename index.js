/* eslint-disable linebreak-style */
const q = require('daskeyboard-applet');
const wmi = require('node-wmi');

const { logger } = q;

// eslint-disable-next-line no-unused-vars
class WmiTemp extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = this.config.pollingInterval || 3000;
    WmiTemp.log(`${this.displayName} Temperature Meter ready to go!`);
  }

  static log(message, level) {
    const prefix = '[WmiTemp]';
    const prefixedMessage = `${prefix} ${message}`;
    if (level === 'error') {
      logger.error(prefixedMessage);
    } else {
      logger.info(prefixedMessage);
    }
  }

  static formatTempDisplay(temp) {
    const unitsSymbol = 'C';
    return `${temp} \u00B0${unitsSymbol}`;
  }

  get displayName() {
    return this.config.displayName || 'WMI';
  }

  /**
   * Colors associated to cpu temperature from low (green) to high (red).
   */
  // eslint-disable-next-line class-methods-use-this
  get colors() {
    return [
      '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#FFFF00', '#FFFF00', '#FF0000', '#FF0000', '#FF0000', '#FF0000',
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    WmiTemp.log('Running...');
    return this.getCpuTemp()
      .then(temp => new q.Signal({
        points: [
          [this.generatePoint(temp)],
        ],
        name: `${this.displayName} Temp`,
        message: WmiTemp.formatTempDisplay(temp),
        isMuted: true,
      })).catch((err) => {
        WmiTemp.log(err, 'error');
        // eslint-disable-next-line new-cap
        return new q.Signal.error([
          'Encountered error trying to get temperature.',
          `Error: ${err}`,
        ]);
      });
  }

  async getCpuTemp() {
    WmiTemp.log(`Getting ${this.displayName} temperature`);
    return new Promise((resolve) => {
      wmi.Query({
        namespace: 'root/OpenHardwareMonitor',
        class: 'Sensor',
        // TODO: "identifier='/lpc/nct6791d/temperature/0'",
        where: `identifier='${this.config.wmiId}'`,
      }, (err, temperatureData) => {
        if (err) {
          throw err;
        }
        WmiTemp.log(`Got ${this.displayName} temperature: ${temperatureData[0].Value}`);
        resolve(temperatureData[0].Value);
      });
    });
  }

  getColor(temp) {
    const minTemp = 20;
    let colorIndex = 0;
    if (temp > 10 * this.colors.length) {
      colorIndex = this.colors.length - 1;
    } else if (temp > minTemp) {
      colorIndex = Math.floor((temp - minTemp) / this.colors.length);
    }

    WmiTemp.log(`Got color: ${this.colors[colorIndex]}`);
    return this.colors[colorIndex];
  }

  generatePoint(temp) {
    return new q.Point(this.getColor(temp));
  }
}

module.exports = {
  WmiTemp,
};

// eslint-disable-next-line no-unused-vars
const wmiTemp = new WmiTemp();
