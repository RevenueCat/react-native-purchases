import { NativeEventEmitter } from 'react-native';
import RevenueCatUI from '../index';

// Mock the native modules
jest.mock('react-native', () => {
  const RNCustomerCenter = {
    presentCustomerCenter: jest.fn().mockResolvedValue(undefined),
  };

  return {
    NativeEventEmitter: jest.fn(),
    NativeModules: {
      RNCustomerCenter,
    },
    Platform: {
      select: jest.fn(),
    },
  };
});

describe('RevenueCatUI CustomerCenter', () => {
  let eventEmitter: any;
  let addListenerMock: jest.Mock;
  let removeListenerMock: jest.Mock;

  beforeEach(() => {
    addListenerMock = jest.fn();
    removeListenerMock = jest.fn();
    eventEmitter = {
      addListener: addListenerMock,
      remove: removeListenerMock,
    };
    (NativeEventEmitter as jest.Mock).mockImplementation(() => eventEmitter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onCustomActionSelected event', () => {
    it('should register and handle onCustomActionSelected event', async () => {
      const mockCallback = jest.fn();
      const mockEvent = {
        actionId: 'test_action',
      };

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected: mockCallback,
        },
      });

      // Verify event listener was registered
      expect(addListenerMock).toHaveBeenCalledWith(
        'onCustomActionSelected',
        expect.any(Function)
      );

      // Simulate event emission
      const eventHandler = addListenerMock.mock.calls.find(
        call => call[0] === 'onCustomActionSelected'
      )[1];
      eventHandler(mockEvent);

      // Verify callback was called with correct data
      expect(mockCallback).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle onCustomActionSelected event with different action IDs', async () => {
      const mockCallback = jest.fn();
      const mockEvent = {
        actionId: 'different_action',
      };

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected: mockCallback,
        },
      });

      // Simulate event emission
      const eventHandler = addListenerMock.mock.calls.find(
        call => call[0] === 'onCustomActionSelected'
      )[1];
      eventHandler(mockEvent);

      // Verify callback was called with correct data
      expect(mockCallback).toHaveBeenCalledWith(mockEvent);
    });

    it('should cleanup event listener when customer center is dismissed', async () => {
      const mockCallback = jest.fn();
      const promise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected: mockCallback,
        },
      });

      // Get the subscription object that was created
      const subscription = eventEmitter;

      // Resolve the presentCustomerCenter promise
      await promise;

      // Verify listener is removed when customer center is dismissed
      expect(subscription.remove).toHaveBeenCalled();
    });
  });
});
