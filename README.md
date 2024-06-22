<img src="https://github.com/mkz212/homebridge-virtual-device/blob/master/homebridge-virtual-switch.png" width="100px"></img>

# Homebridge Virtual Device

[![Downloads](https://img.shields.io/npm/dt/homebridge-virtual-device)](https://www.npmjs.com/package/homebridge-virtual-device)
[![GitHub version](https://img.shields.io/github/package-json/v/mkz212/homebridge-virtual-device?label=GitHub)](https://github.com/mkz212/homebridge-virtual-device/releases)
[![npm version](https://img.shields.io/npm/v/homebridge-virtual-device?color=%23cb3837&label=npm)](https://www.npmjs.com/package/homebridge-virtual-device)

`homebridge-virtual-device` is a dynamic platform plugin for [Homebridge](https://homebridge.io) which provides HomeKit support for virtual devices.

## How it works
- Create virtual device (like switch, dimmer, blind, garage, leak, security, thermostat, etc.).
- For each device you can add timer to automatically turn off or turn on device after setted time.
- For dimmer and blind you can add dynamic timer - time depends of value setted in HomeKit. 
- For each device you can add sensor (motion, contact, occupancy, leak) to activate for 3 sec. when main device is turned on or turned off (you can choose).
- All of that is useful in HomeKit / Apple Home automations.

## Install plugin

This plugin can be easily installed through Homebridge UI or via [NPM](https://www.npmjs.com/package/homebridge-virtual-device) "globally" by typing:

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
          "timerType": "whenOn"
          "timerTime": 60,
          "sensor": "whenOff",
          "sensorType": "motion"
        },
        {
          "name": "Device 2",
          "type": "dimmer",
          "timerType": "disabled",
          "sensor": "disabled"
        }
      ]
    }
  ]
}
```

- `platform` (string): Tells Homebridge which platform this config belongs to. Leave as is.
- `name` (string): Name of device, as it will display in HomeKit.
- `type` (string): Type of the device: switch, dimmer, blind, lock, security, thermostat, etc.
- `startupValue` (string): Select device state after startup / restart.
- `timerType` (string): Timer type: disabled, activated when device is on, activated when device is off.
- `timerTime` (integer): Set time for timer.
- `timerUnit` (string): Timer unit: miliseconds, seconds, minutes, hours, days.
- `timerReset` (boolean): Reset timer on each activity. When this option is enabled, each activity of the device will reset the timer (e.g. re-enabling the device even though it is already turned on).
- `timerDynamic` (booleand): Only for dimmer and blind. When this option is enabled, the timer will change the device value by 1, up to 0 or 100 (depending on the option selected in Timer). Example: if you set 5 minutes in Timer Time and the device is set to 3, then after the timer will be 15 minutes.
- `timerStartup` (integer): Set different time for timer on startup.
- `sensor` (string): Add additional sensor to device. It will actvate for 3 seconds. This is useful for automations.
- `sensorType` (string): Sensor type: motion, contact, occupancy, leak.


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


 
