<img src="https://raw.githubusercontent.com/homebridge/verified/latest/icons/homebridge-virtual-device.png" width="100px"></img>

# Homebridge Virtual Device

[![Downloads](https://img.shields.io/npm/dt/homebridge-virtual-device)](https://www.npmjs.com/package/homebridge-virtual-device)
[![GitHub version](https://img.shields.io/github/package-json/v/mkz212/homebridge-virtual-device?label=GitHub)](https://github.com/mkz212/homebridge-virtual-device/releases)
[![npm version](https://img.shields.io/npm/v/homebridge-virtual-device?color=%23cb3837&label=npm)](https://www.npmjs.com/package/homebridge-virtual-device)

`homebridge-virtual-device` is a dynamic platform plugin for [Homebridge](https://homebridge.io) which provides HomeKit support for virtual devices.

## How it works
- Create virtual device (like switch, dimmer, blind, garage, leak, security, thermostat, etc.).
- For each device you can add timer to automatically turn off device after this time.
- For each device you can add sensor (motion, contact, occupancy, leak) to activate for 3 sec when main device is turned on or off (you can choose).
- All of that is useful in HomeKit / Apple Home automations.

## Install plugin

This plugin can be easily installed and configured through Homebridge UI or via [NPM](https://www.npmjs.com/package/homebridge-virtual-device) "globally" by typing:

    npm install -g homebridge-virtual-device

## Configure plugin
Configure the plugin through the settings UI or directly in the JSON editor.

Example config.json:

```json
{
  "platforms": [
    {
      "platform": "Homebridge Virtual Plugin",
      "devices": [
        {
          "name": "Device 1",
          "type": "switch",
          "timer": 10000,
          "sensor": "motion"
        },
        {
          "name": "Device 2",
          "type": "dimmer",
          "timer": 0,
          "sensor": "off"
        }
      ]
    }
  ]
}
```

- `platform` (string): Tells Homebridge which platform this config belongs to. Leave as is.
- `name` (string): Name of device, as it will display in HomeKit.
- `type` (string): Device type, like switch, dimmer, etc.
- `timer` (integer): Leave empty or put 0 to disable timer. Set integer to miliseconds or add one of: -s -m -h -d. '120-s' will set to 120 seconds, '30-m' will set to 30 minutes, '2-h' will set to 2 hours, '1-d' will set to one day, integer value will set to miliseconds ('10000' will set to 10000 miliseconds). The timer is activated every time the device is turned on. Re-sending the command to turn on when the timer is on will extend the time (reset timer).
- `sensor` (string): Add sensor to this device. Sensor will triger for 3 sec. when main device will set to on or off (you can choose). Useful for notifications


## Troubleshooting

<details>
<summary>General issues</summary>

Try:
- restart Homebridge / plugin bridge
- restart Apple hub
- remove device from cache (in Homebridge settings)

</details>

<details>
<summary>Child bridge</summary>
    
- It's recommended you run this plugin as a [child bridge](https://github.com/homebridge/homebridge/wiki/Child-Bridges).

</details>

## Contributing and support

- Test/use the plugin and [report issues and share feedback](https://github.com/mkz212/homebridge-virtual-device/issues).
- Contribute with your own bug fixes, code clean-ups, or additional features - [Pull Request](https://github.com/mkz212/homebridge-virtual-device/pulls).

## Acknowledgements
Thanks to the team behind Homebridge, your efforts do not go unnoticed.

## Disclaimer
Despite the efforts made, the operation of the plugin is without any guarantees and at your own risk.


 
