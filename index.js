/* eslint-disable linebreak-style */
const q = require('daskeyboard-applet');
const wmi = require('node-wmi');

// Color associated to cpu temperature from low (green) to high (red).
const COLORS = [
  '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#FFFF00', '#FFFF00', '#FF0000', '#FF0000', '#FF0000', '#FF0000',
];

const { logger } = q;

// eslint-disable-next-line no-unused-vars
class CpuTemp extends q.DesktopApp {
  constructor() {
    super();
    CpuTemp.log('CTOR');
    this.pollingInterval = 3000;
    CpuTemp.log('CPU Temperature Meter ready to go!');
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    CpuTemp.log('Running...');
    return CpuTemp.getCpuTemp()
      .then(temp => new q.Signal({
        points: [
          [CpuTemp.generatePoint(temp)],
        ],
        name: 'CPU Temp',
        message: `${temp} \u00B0F`,
        isMuted: true,
      })).catch((err) => {
        CpuTemp.log(err, 'error');
      });
  }

  static async getCpuTemp() {
    CpuTemp.log('Getting CPU temperature');
    return new Promise((resolve) => {
      wmi.Query({
        namespace: 'root/OpenHardwareMonitor',
        class: 'Sensor',
        where: "identifier='/lpc/nct6791d/temperature/0'",
      }, (err, temperatureData) => {
        if (err) {
          throw err;
        }
        CpuTemp.log(`Got CPU temperature: ${temperatureData[0].Value}`);
        resolve(temperatureData[0].Value);
      });
    });
  }

  static generatePoint(temp) {
    return new q.Point(CpuTemp.getColor(temp));
  }

  static getColor(temp) {
    const minTemp = 20;
    let colorIndex = 0;
    if (temp > 10 * COLORS.length) {
      colorIndex = COLORS.length - 1;
    } else if (temp > minTemp) {
      colorIndex = Math.floor((temp - minTemp) / COLORS.length);
    }

    CpuTemp.log(`Got color: ${COLORS[colorIndex]}`);
    return COLORS[colorIndex];
  }

  static log(message, level) {
    const prefix = '[CpuTemp]';
    const prefixedMessage = `${prefix} ${message}`;
    if (level === 'error') {
      logger.error(prefixedMessage);
    } else {
      logger.info(prefixedMessage);
    }
  }
}

module.exports = {
  CpuTemp,
};

// eslint-disable-next-line no-unused-vars
const cpuTemp = new CpuTemp();
