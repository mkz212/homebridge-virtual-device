import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { VirtualDevicePlatform } from './platform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class VirtualDeviceAccessory {
  private service: Service;

  private states = {
    On: false,
    Brightness: 0,
    CurrentPosition: 0,
    TargetPosition: 0,
    CurrentDoorState: 0,
    TargetDoorState: 0,
    MotionDetected: 0,
    LockCurrentState: 0,
    LockTargetState: 0,
    SecuritySystemCurrentState: 0,
    SecuritySystemTargetState: 0,
    CurrentHeatingCoolingState: 0,
    TargetHeatingCoolingState: 0,
    CurrentTemperature: 0,
    TargetTemperature: 0,
  };

  devConfig;
  deviceTimer;
  sensor;
  sensorTimer;
  offValue;
  onValue;
  startupTimer = false;


  constructor(
    private readonly platform: VirtualDevicePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // check current config for device
    this.devConfig = this.platform.config.devices.find((item) => item.name === accessory.context.device.name) || {};

    if (this.devConfig.type === 'switch') {
      this.onValue = true;
      this.offValue = false;
    } else if (this.devConfig.type === 'dimmer') {
      this.onValue = 100;
      this.offValue = 0;
    } else if (this.devConfig.type === 'blind') {
      this.onValue = 100;
      this.offValue = 0;
    } else if (this.devConfig.type === 'garage') {
      this.onValue = 1;
      this.offValue = 0;
    } else if (this.devConfig.type === 'lock') {
      this.onValue = 0;
      this.offValue = 1;
    } else if (this.devConfig.type === 'motion') {
      this.onValue = 1;
      this.offValue = 0;
    } else if (this.devConfig.type === 'security') {
      this.onValue = 0;
      this.offValue = 3;
    } else if (this.devConfig.type === 'thermostat' || this.devConfig.type === 'heatercooler') {
      this.onValue = 1;
      this.offValue = 0;
    }


    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Homebridge Virtual Device')
      .setCharacteristic(this.platform.Characteristic.Model, this.devConfig.type || 'type')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.uuid || 'uuid');

    // set device type
    if (this.devConfig.type === 'dimmer') {
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    } else if (this.devConfig.type === 'blind') {
      this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering);
    } else if (this.devConfig.type === 'garage') {
      this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener) || this.accessory.addService(this.platform.Service.GarageDoorOpener);
    } else if (this.devConfig.type === 'lock') {
      this.service = this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism);
    } else if (this.devConfig.type === 'motion') {
      this.service = this.accessory.getService(this.platform.Service.MotionSensor) || this.accessory.addService(this.platform.Service.MotionSensor);
    } else if (this.devConfig.type === 'security') {
      this.service = this.accessory.getService(this.platform.Service.SecuritySystem) || this.accessory.addService(this.platform.Service.SecuritySystem);
    } else if (this.devConfig.type === 'thermostat') {
      this.service = this.accessory.getService(this.platform.Service.Thermostat) || this.accessory.addService(this.platform.Service.Thermostat);
    } else if (this.devConfig.type === 'heatercooler') {
      this.service = this.accessory.getService(this.platform.Service.HeaterCooler) || this.accessory.addService(this.platform.Service.HeaterCooler);
    } else {
      this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    }

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);


    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers
    if (this.devConfig.type === 'switch') {
      this.service.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'dimmer') {
      this.service.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'blind') {
      this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'garage') {
      this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'lock') {
      this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'motion') {
      this.service.getCharacteristic(this.platform.Characteristic.MotionDetected)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'security') {
      this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemTargetState)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'thermostat') {
      this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
        .onSet(this.setValue.bind(this));
    } else if (this.devConfig.type === 'heatercooler') {
      this.service.getCharacteristic(this.platform.Characteristic.Active)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.SwingMode)
        .onSet(this.setValue.bind(this));
      this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
        .onSet(this.setValue.bind(this));
    }

    // override startup timer value if needed
    if (this.devConfig.timerStartup > 0) {
      this.startupTimer = true;
    }

    // startup values
    if (this.devConfig.startupValue === 'off') {
      if (this.devConfig.type === 'switch') {
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.offValue);
      } else if (this.devConfig.type === 'dimmer') {
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.offValue);
      } else if (this.devConfig.type === 'blind') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.offValue);
      } else if (this.devConfig.type === 'garage') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetDoorState, this.offValue);
      } else if (this.devConfig.type === 'lock') {
        this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.offValue);
      } else if (this.devConfig.type === 'motion') {
        this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.offValue);
      } else if (this.devConfig.type === 'security') {
        this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemTargetState, this.offValue);
      } else if (this.devConfig.type === 'thermostat' || this.devConfig.type === 'heatercooler') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState, this.offValue);
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, 10);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetTemperature, 10);
      }
    } else if (this.devConfig.startupValue === 'on') {
      if (this.devConfig.type === 'switch') {
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.onValue);
      } else if (this.devConfig.type === 'dimmer') {
        this.service.updateCharacteristic(this.platform.Characteristic.On, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.onValue);
      } else if (this.devConfig.type === 'blind') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.onValue);
      } else if (this.devConfig.type === 'garage') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetDoorState, this.onValue);
      } else if (this.devConfig.type === 'lock') {
        this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.LockTargetState, this.onValue);
      } else if (this.devConfig.type === 'motion') {
        this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, this.onValue);
      } else if (this.devConfig.type === 'security') {
        this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemTargetState, this.onValue);
      } else if (this.devConfig.type === 'thermostat' || this.devConfig.type === 'heatercooler') {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState, this.onValue);
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, 10);
        this.service.updateCharacteristic(this.platform.Characteristic.TargetTemperature, 10);
      }
    }

    this.startupTimer = false;


    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same subtype id.)
     */

    // remove sensor if it is set to off or if need to change type
    if (this.devConfig.sensor === 'disabled'
        || (this.accessory.getService('sensor')?.subtype !== this.devConfig.sensorType)) {
      const removeService = this.accessory.getService('sensor');
      if (removeService) {
        this.accessory.removeService(removeService);
        this.platform.log.info(`remove sensor for: ${accessory.context.device.name}`);
      }
    }

    // add sensor
    if (this.devConfig.sensor !== 'disabled') {
      if (this.devConfig.sensorType === 'motion') {
        this.sensor = this.accessory.getService('sensor') ||
          this.accessory.addService(this.platform.Service.MotionSensor, 'sensor', 'motion');
      } else if (this.devConfig.sensorType === 'contact') {
        this.sensor = this.accessory.getService('sensor') ||
          this.accessory.addService(this.platform.Service.ContactSensor, 'sensor', 'contact');
      } else if (this.devConfig.sensorType === 'occupancy') {
        this.sensor = this.accessory.getService('sensor') ||
          this.accessory.addService(this.platform.Service.OccupancySensor, 'sensor', 'occupancy');
      } else if (this.devConfig.sensorType === 'leak') {
        this.sensor = this.accessory.getService('sensor') ||
          this.accessory.addService(this.platform.Service.LeakSensor, 'sensor', 'leak');
      }
    }


  }


  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setValue(value: CharacteristicValue) {

    if (this.devConfig.type === 'switch') {
      this.states.On = value as boolean;
      this.service.updateCharacteristic(this.platform.Characteristic.On, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${(value) ? 'on' : 'off'}`);
    } else if (this.devConfig.type === 'dimmer') {
      this.states.Brightness = value as number;
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}%`);
    } else if (this.devConfig.type === 'blind') {
      this.states.TargetPosition = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, value);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}%`);
    } else if (this.devConfig.type === 'garage') {
      this.states.TargetDoorState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, value);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetDoorState, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    } else if (this.devConfig.type === 'lock') {
      this.states.LockTargetState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, value);
      this.service.updateCharacteristic(this.platform.Characteristic.LockTargetState, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    } else if (this.devConfig.type === 'motion') {
      this.states.MotionDetected = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    } else if (this.devConfig.type === 'security') {
      this.states.SecuritySystemTargetState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, value);
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemTargetState, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    } else if (this.devConfig.type === 'thermostat' && value as number <= 2) {
      this.states.TargetHeatingCoolingState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, value);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    } else if ((this.devConfig.type === 'thermostat' || this.devConfig.type === 'heatercooler') && value as number >= 10) {
      this.states.TargetTemperature = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, value);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetTemperature, value);
      this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);
    }

    if (this.devConfig.timerReset
        || (this.devConfig.timerType === 'whenOn' && value === this.offValue)
        || (this.devConfig.timerType === 'whenOff' && value !== this.offValue)) {
      clearTimeout(this.deviceTimer);
      this.deviceTimer = null;
      this.platform.log.debug(`[${this.accessory.context.device.name}]: timer reset`);
    }

    // if value !== offValue -> device is set to on
    if (value !== this.offValue) {

      // set timer to change device state
      if (!this.deviceTimer && this.devConfig.timerType === 'whenOn' && this.devConfig.timerTime > 0) {
        if (this.devConfig.timerDynamic && (this.devConfig.type === 'dimmer' || this.devConfig.type === 'blind') && value as number > 0) {
          this.deviceTimer = setTimeout(() => {
            this.setValue(value as number - 1);
          }, this.convertTime());
        } else {
          this.deviceTimer = setTimeout(() => {
            this.setValue(this.offValue);
          }, this.convertTime());
        }
      }

      // triger motion when device is on
      if (this.devConfig.sensor === 'whenOn') {
        this.triggerSensor(true);
      }

    } else {

      // set timer to change device state
      if (!this.deviceTimer && this.devConfig.timerType === 'whenOff' && this.devConfig.timerTime > 0) {
        if (this.devConfig.timerDynamic && (this.devConfig.type === 'dimmer' || this.devConfig.type === 'blind') && value as number < 100) {
          this.deviceTimer = setTimeout(() => {
            this.setValue(value as number + 1);
          }, this.convertTime());
        } else {
          this.deviceTimer = setTimeout(() => {
            this.setValue(this.onValue);
          }, this.convertTime());
        }
      }

      // triger motion when device is off
      if (this.devConfig.sensor === 'whenOff') {
        this.triggerSensor(true);
      }

    }
  }

  async triggerSensor(value) {
    if (this.devConfig.sensorType === 'motion') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, value);
    } else if (this.devConfig.sensorType === 'contact') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.ContactSensorState, value);
    } else if (this.devConfig.sensorType === 'occupancy') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.OccupancyDetected, value);
    } else if (this.devConfig.sensorType === 'leak') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.LeakDetected, value);
    }

    if (value) {
      clearTimeout(this.sensorTimer);
      this.sensorTimer = null;
      this.sensorTimer = setTimeout(() => {
        this.triggerSensor(false);
      }, 3000);
    }
  }

  convertTime() {

    let time = this.devConfig.timerTime;

    if (this.startupTimer && this.devConfig.timerStartup > 0) {
      time = this.devConfig.timerStartup;
    }

    this.platform.log.info(`[${this.accessory.context.device.name}]: set timer to ${time} ${this.devConfig.timerUnit}`);

    if (this.devConfig.timerUnit === 'miliseconds') {
      return time;
    } if (this.devConfig.timerUnit === 'seconds') {
      return time * 1000;
    } else if (this.devConfig.timerUnit === 'minutes') {
      return time * 60000;
    } else if (this.devConfig.timerUnit === 'hours') {
      return time * 3600000;
    } else if (this.devConfig.timerUnit === 'days') {
      return time * 86400000;
    } else {
      return time * 1000;
    }
  }

}
