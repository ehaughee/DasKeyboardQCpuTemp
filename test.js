/* eslint-disable linebreak-style */
const wmi = require('node-wmi');

wmi.Query({
  namespace: 'root/OpenHardwareMonitor',
  class: 'Sensor',
  where: "identifier='/lpc/nct6791d/temperature/0'",
}, (err, bios) => {
  console.log(bios[0].Value);
});
