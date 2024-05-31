<img src="https://raw.githubusercontent.com/homebridge/verified/latest/icons/homebridge-virtual-device.png" width="100px"></img>

# Homebridge Virtual Device

[![Downloads](https://img.shields.io/npm/dt/homebridge-virtual-device)](https://www.npmjs.com/package/homebridge-virtual-device)
[![GitHub version](https://img.shields.io/github/package-json/v/mkz212/homebridge-virtual-device?label=GitHub)](https://github.com/mkz212/homebridge-virtual-device/releases)
[![npm version](https://img.shields.io/npm/v/homebridge-virtual-device?color=%23cb3837&label=npm)](https://www.npmjs.com/package/homebridge-virtual-device)

`homebridge-virtual-device` is a dynamic platform plugin for [Homebridge](https://homebridge.io) which provides HomeKit support for virtual devices.

## How it works
You can create virtual devices (like switch, dimmer, etc.) what is useful in HomeKit / Apple Home automations.

## Install plugin

This plugin can be easily installed through Homebridge UI or via [NPM](https://www.npmjs.com/package/homebridge-virtual-device) "globally" by typing:

    npm install -g homebridge-virtual-device

## Configure plugin
Configure the plugin through the settings UI or directly in the JSON editor.

Basic settings (required):

```json
{
  "platforms": [
    {
        "platform": "Homebridge Virtual Plugin"
    }
  ]
}
```

- `platform` (string): Tells Homebridge which platform this config belongs to. Leave as is.

## Troubleshooting

<details>
<summary>Child bridge</summary>
    
- It's recommended you run this plugin as a [child bridge](https://github.com/homebridge/homebridge/wiki/Child-Bridges).

</details>

## Contributing and support

- Test/use the plugin and [report issues and share feedback](https://github.com/mkz212/homebridge-virtual-device/issues).
- Contribute with your own bug fixes, code clean-ups, or additional features - [Pull Request](https://github.com/mkz212/homebridge-virtual-device/pulls).

## Acknowledgements
Thanks to the team behind Homebridge. Your efforts do not go unnoticed.

## Disclaimer
Despite the efforts made, the operation of the plugin is without any guarantees and at your own risk.


 
