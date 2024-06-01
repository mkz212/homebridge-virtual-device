import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { VirtualDevicePlatform } from './platform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class VirtualDeviceAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    On: false,
    Brightness: 100,
  };

  motionSensor;

  constructor(
    private readonly platform: VirtualDevicePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Homebridge Virtual Device')
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.type || 'type')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.uuid || 'uuid');


    // set device type
    if (accessory.context.device.type === 'switch') {
      // get the Switch service if it exists, otherwise create a new Switch service
      // you can create multiple services for each accessory
      this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    } else {
      // get the LightBulb service if it exists, otherwise create a new LightBulb service
      // you can create multiple services for each accessory
      this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    }

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);


    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    if (accessory.context.device.type !== 'switch') {
      // register handlers for the Brightness Characteristic
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .onSet(this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below
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

    // check current config for device
    const devConfig = this.platform.config.devices.find((item) => item.name === accessory.context.device.name) || {};

    // add sensor
    if (devConfig.sensor === 'motion') {
      // Add motion sensor
      this.motionSensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.MotionSensor, 'sensor', 'motion');
    } else if (devConfig.sensor === 'contact') {
      // Add contact sensor
      this.motionSensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.ContactSensor, 'sensor', 'contact');
    } else if (devConfig.sensor === 'occupancy') {
      // Add occupancy sensor
      this.motionSensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.OccupancySensor, 'sensor', 'occupancy');
    } else if (devConfig.sensor === 'leak') {
      // Add leak sensor
      this.motionSensor = this.accessory.getService('sensor') ||
        this.accessory.addService(this.platform.Service.LeakSensor, 'sensor', 'leak');
    } else {
      const removeService = this.accessory.getService('sensor');
      if (removeService) {
        this.accessory.removeService(removeService);
      }
    }

  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.states.On = value as boolean;

    this.platform.log.info(`[${this.accessory.context.device.name}]: ${(value) ? 'set on' : 'set off'}`);

    // triger motion sensor if added
    if (!value) {
      this.triggerSensor();
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
    // implement your own code to check if the device is on
    const isOn = this.states.On;

    this.platform.log.info(`[${this.accessory.context.device.name}]: ${(isOn) ? 'on' : 'off'}`);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.states.Brightness = value as number;

    this.platform.log.info(`[${this.accessory.context.device.name}]: ${value}%`);
  }

  async triggerSensor() {
    if (this.accessory.context.device.sensor === 'motion') {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, true);
      setTimeout(() => {
        // push the new value to HomeKit
        this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, false);
      }, 3000);
    } else if (this.accessory.context.device.sensor === 'contact') {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.ContactSensorState, true);
      setTimeout(() => {
        // push the new value to HomeKit
        this.motionSensor.updateCharacteristic(this.platform.Characteristic.ContactSensorState, false);
      }, 3000);
    } else if (this.accessory.context.device.sensor === 'occupancy') {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.OccupancyDetected, true);
      setTimeout(() => {
        // push the new value to HomeKit
        this.motionSensor.updateCharacteristic(this.platform.Characteristic.OccupancyDetected, false);
      }, 3000);
    } else if (this.accessory.context.device.sensor === 'leak') {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.LeakDetected, true);
      setTimeout(() => {
        // push the new value to HomeKit
        this.motionSensor.updateCharacteristic(this.platform.Characteristic.LeakDetected, false);
      }, 3000);
    }

  }

}
