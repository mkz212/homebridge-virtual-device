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
  sensor;
  sensorTimer;

  constructor(
    private readonly platform: VirtualDevicePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // check current config for device
    this.devConfig = this.platform.config.devices.find((item) => item.name === accessory.context.device.name) || {};

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
        //.onGet(this.getOn.bind(this));
    } else if (this.devConfig.type === 'dimmer') {
      this.service.getCharacteristic(this.platform.Characteristic.On)
        .onSet(this.setValue.bind(this));
        //.onGet(this.getOn.bind(this));
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
    }

    // start values
    if (this.devConfig.type === 'switch') {
      this.service.updateCharacteristic(this.platform.Characteristic.On, false);
    } else if (this.devConfig.type === 'dimmer') {
      this.service.updateCharacteristic(this.platform.Characteristic.On, false);
      this.service.updateCharacteristic(this.platform.Characteristic.Brightness, 0);
    } else if (this.devConfig.type === 'blind') {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, 0);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, 0);
    } else if (this.devConfig.type === 'garage') {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, 0);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetDoorState, 0);
    } else if (this.devConfig.type === 'lock') {
      this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, 1);
      this.service.updateCharacteristic(this.platform.Characteristic.LockTargetState, 1);
    } else if (this.devConfig.type === 'motion') {
      this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, 0);
    } else if (this.devConfig.type === 'security') {
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, 3);
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemTargetState, 3);
    } else if (this.devConfig.type === 'thermostat') {
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, 0);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState, 0);
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, 10);
      this.service.updateCharacteristic(this.platform.Characteristic.TargetTemperature, 10);
    }

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
    if (this.accessory.getService('sensor')?.subtype !== this.devConfig.sensor) {
      const removeService = this.accessory.getService('sensor');
      if (removeService) {
        this.accessory.removeService(removeService);
        this.platform.log.info(`remove sensor for: ${accessory.context.device.name}`);
      }
    }

    // add sensor
    if (this.devConfig.sensor === 'motion') {
      // Add motion sensor
      this.sensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.MotionSensor, 'sensor', 'motion');
    } else if (this.devConfig.sensor === 'contact') {
      // Add contact sensor
      this.sensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.ContactSensor, 'sensor', 'contact');
    } else if (this.devConfig.sensor === 'occupancy') {
      // Add occupancy sensor
      this.sensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.OccupancySensor, 'sensor', 'occupancy');
    } else if (this.devConfig.sensor === 'leak') {
      // Add leak sensor
      this.sensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.LeakSensor, 'sensor', 'leak');
    }

  }


  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // check if the device is on
    const isOn = this.states.On;

    this.platform.log.info(`[${this.accessory.context.device.name}]: ${(isOn) ? 'on' : 'off'}`);

    // if need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setValue(value: CharacteristicValue) {

    if (this.devConfig.type === 'switch') {
      this.states.On = value as boolean;
    } else if (this.devConfig.type === 'dimmer') {
      this.states.Brightness = value as number;
    } else if (this.devConfig.type === 'blind') {
      this.states.TargetPosition = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, value);
    } else if (this.devConfig.type === 'garage') {
      this.states.TargetDoorState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, value);
    } else if (this.devConfig.type === 'lock') {
      this.states.LockTargetState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, value);
    } else if (this.devConfig.type === 'motion') {
      this.states.MotionDetected = value as number;
    } else if (this.devConfig.type === 'security') {
      this.states.SecuritySystemTargetState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState, value);
    } else if (this.devConfig.type === 'thermostat' && value as number <= 2) {
      this.states.TargetHeatingCoolingState = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState, value);
    } else if (this.devConfig.type === 'thermostat' && value as number >= 10) {
      this.states.TargetTemperature = value as number;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, value);
    }

    this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}`);

    // triger motion sensor if value false and sensor added
    if (!value && this.sensor) {
      this.triggerSensor(true);
    }
  }

  async triggerSensor(value) {
    if (this.devConfig.sensor === 'motion') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, value);
    } else if (this.devConfig.sensor === 'contact') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.ContactSensorState, value);
    } else if (this.devConfig.sensor === 'occupancy') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.OccupancyDetected, value);
    } else if (this.devConfig.sensor === 'leak') {
      this.sensor.updateCharacteristic(this.platform.Characteristic.LeakDetected, value);
    }

    if (value) {
      clearTimeout(this.sensorTimer);
      this.sensorTimer = setTimeout(() => {
        this.triggerSensor(false);
      }, 3000);
    }
  }

}
