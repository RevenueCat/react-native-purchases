const EventEmitter = require('EventEmitter');
const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

/**
 * Mock the NativeEventEmitter as a normal JS EventEmitter.
 */
class NativeEventEmitter extends EventEmitter {
  constructor() {
    super(RCTDeviceEventEmitter.sharedSubscriber);
  }
}
