// Store event listeners registered by the code
const eventListeners = {};

// Mock the native modules before importing anything
jest.mock("react-native", () => {
  const listeners = {};

  return {
    NativeModules: {
      RNCustomerCenter: {
        presentCustomerCenter: jest.fn(() => Promise.resolve()),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
      RNPaywalls: {
        presentPaywall: jest.fn(() => Promise.resolve("RESTORED")),
        presentPaywallIfNeeded: jest.fn(() => Promise.resolve("NOT_PRESENTED")),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn((eventName, callback) => {
        // Store the callback so we can trigger it in tests
        if (!listeners[eventName]) {
          listeners[eventName] = [];
        }
        listeners[eventName].push(callback);

        // Also store globally so tests can access
        if (!eventListeners[eventName]) {
          eventListeners[eventName] = [];
        }
        eventListeners[eventName].push(callback);

        return {
          remove: jest.fn(() => {
            // Remove this specific callback
            const listenerArray = listeners[eventName];
            if (listenerArray) {
              const index = listenerArray.indexOf(callback);
              if (index > -1) {
                listenerArray.splice(index, 1);
              }
            }
            const globalListenerArray = eventListeners[eventName];
            if (globalListenerArray) {
              const idx = globalListenerArray.indexOf(callback);
              if (idx > -1) {
                globalListenerArray.splice(idx, 1);
              }
            }
          }),
        };
      }),
      removeAllListeners: jest.fn((eventName) => {
        if (eventName) {
          delete listeners[eventName];
          delete eventListeners[eventName];
        } else {
          Object.keys(listeners).forEach(key => delete listeners[key]);
          Object.keys(eventListeners).forEach(key => delete eventListeners[key]);
        }
      }),
    })),
    UIManager: {
      getViewManagerConfig: jest.fn(() => null),
    },
    Platform: {
      select: jest.fn((obj) => obj.ios || obj.default),
      OS: "ios",
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
    },
    ScrollView: "ScrollView",
    View: "View",
    requireNativeComponent: jest.fn(),
  };
});

// Helper function to emit events to registered listeners
function emitEvent(eventName, data) {
  const listeners = eventListeners[eventName];
  if (listeners) {
    listeners.forEach(callback => callback(data));
  }
}

describe("RevenueCatUI.presentCustomerCenter", () => {
  let RevenueCatUI;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(eventListeners).forEach(key => delete eventListeners[key]);

    // Require the module fresh for each test
    RevenueCatUI = require("../src/index").default;
  });

  afterEach(() => {
    Object.keys(eventListeners).forEach(key => delete eventListeners[key]);
  });

  describe("onCustomActionSelected callback", () => {
    it("should be called when onCustomActionSelected event is emitted", async () => {
      const onCustomActionSelected = jest.fn();

      // Start presenting customer center with callback
      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected,
        },
      });

      // Simulate the native module emitting the event
      emitEvent("onCustomActionSelected", { actionId: "test-action-id" });

      // Resolve the promise
      await presentPromise;

      // Verify the callback was called with correct parameters
      expect(onCustomActionSelected).toHaveBeenCalledTimes(1);
      expect(onCustomActionSelected).toHaveBeenCalledWith({
        actionId: "test-action-id",
      });
    });

    it("should be called with purchaseIdentifier when provided", async () => {
      const onCustomActionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected,
        },
      });

      // Simulate the event with purchaseIdentifier (Android sends this)
      emitEvent("onCustomActionSelected", {
        actionId: "custom-action-123",
        purchaseIdentifier: "purchase-456",
      });

      await presentPromise;

      expect(onCustomActionSelected).toHaveBeenCalledTimes(1);
      expect(onCustomActionSelected).toHaveBeenCalledWith({
        actionId: "custom-action-123",
        purchaseIdentifier: "purchase-456",
      });
    });

    it("should not be confused with onManagementOptionSelected", async () => {
      const onCustomActionSelected = jest.fn();
      const onManagementOptionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected,
          onManagementOptionSelected,
        },
      });

      // Emit onManagementOptionSelected - should NOT trigger onCustomActionSelected
      emitEvent("onManagementOptionSelected", {
        option: "cancel",
        url: null,
      });

      // Emit onCustomActionSelected - should trigger onCustomActionSelected
      emitEvent("onCustomActionSelected", {
        actionId: "test-action",
      });

      await presentPromise;

      // Verify only the correct callbacks were called
      expect(onManagementOptionSelected).toHaveBeenCalledTimes(1);
      expect(onManagementOptionSelected).toHaveBeenCalledWith({
        option: "cancel",
        url: null,
      });

      expect(onCustomActionSelected).toHaveBeenCalledTimes(1);
      expect(onCustomActionSelected).toHaveBeenCalledWith({
        actionId: "test-action",
      });
    });

    it("should not be called when callback is not provided", async () => {
      // Present without onCustomActionSelected callback
      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted: jest.fn(),
        },
      });

      // Emit an event - should not throw since no callback is registered
      emitEvent("onCustomActionSelected", { actionId: "test-action" });

      // This should not throw an error
      await expect(presentPromise).resolves.not.toThrow();
    });

    it("should handle multiple custom action events", async () => {
      const onCustomActionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected,
        },
      });

      // Emit multiple events
      emitEvent("onCustomActionSelected", { actionId: "action-1" });
      emitEvent("onCustomActionSelected", { actionId: "action-2" });
      emitEvent("onCustomActionSelected", { actionId: "action-3" });

      await presentPromise;

      expect(onCustomActionSelected).toHaveBeenCalledTimes(3);
      expect(onCustomActionSelected).toHaveBeenNthCalledWith(1, {
        actionId: "action-1",
      });
      expect(onCustomActionSelected).toHaveBeenNthCalledWith(2, {
        actionId: "action-2",
      });
      expect(onCustomActionSelected).toHaveBeenNthCalledWith(3, {
        actionId: "action-3",
      });
    });
  });

  describe("onFeedbackSurveyCompleted callback", () => {
    it("should be called when feedback survey is completed", async () => {
      const onFeedbackSurveyCompleted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onFeedbackSurveyCompleted,
        },
      });

      emitEvent("onFeedbackSurveyCompleted", { feedbackSurveyOptionId: "option-123" });

      await presentPromise;

      expect(onFeedbackSurveyCompleted).toHaveBeenCalledTimes(1);
      expect(onFeedbackSurveyCompleted).toHaveBeenCalledWith({
        feedbackSurveyOptionId: "option-123",
      });
    });
  });

  describe("onShowingManageSubscriptions callback", () => {
    it("should be called when manage subscriptions is shown", async () => {
      const onShowingManageSubscriptions = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onShowingManageSubscriptions,
        },
      });

      emitEvent("onShowingManageSubscriptions");

      await presentPromise;

      expect(onShowingManageSubscriptions).toHaveBeenCalledTimes(1);
    });
  });

  describe("onRestoreStarted callback", () => {
    it("should be called when restore starts", async () => {
      const onRestoreStarted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted,
        },
      });

      emitEvent("onRestoreStarted");

      await presentPromise;

      expect(onRestoreStarted).toHaveBeenCalledTimes(1);
    });
  });

  describe("onRestoreCompleted callback", () => {
    it("should be called when restore completes successfully", async () => {
      const onRestoreCompleted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreCompleted,
        },
      });

      const mockCustomerInfo = {
        activeSubscriptions: ["test_sub"],
        entitlements: { active: {}, all: {} },
      };

      emitEvent("onRestoreCompleted", { customerInfo: mockCustomerInfo });

      await presentPromise;

      expect(onRestoreCompleted).toHaveBeenCalledTimes(1);
      expect(onRestoreCompleted).toHaveBeenCalledWith({
        customerInfo: mockCustomerInfo,
      });
    });
  });

  describe("onRestoreFailed callback", () => {
    it("should be called when restore fails", async () => {
      const onRestoreFailed = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreFailed,
        },
      });

      const mockError = {
        code: "RESTORE_ERROR",
        message: "Failed to restore purchases",
      };

      emitEvent("onRestoreFailed", { error: mockError });

      await presentPromise;

      expect(onRestoreFailed).toHaveBeenCalledTimes(1);
      expect(onRestoreFailed).toHaveBeenCalledWith({
        error: mockError,
      });
    });
  });

  describe("onRefundRequestStarted callback", () => {
    it("should be called when refund request starts (iOS only)", async () => {
      const onRefundRequestStarted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRefundRequestStarted,
        },
      });

      emitEvent("onRefundRequestStarted", { productIdentifier: "com.test.product" });

      await presentPromise;

      expect(onRefundRequestStarted).toHaveBeenCalledTimes(1);
      expect(onRefundRequestStarted).toHaveBeenCalledWith({
        productIdentifier: "com.test.product",
      });
    });
  });

  describe("onRefundRequestCompleted callback", () => {
    it("should be called when refund request completes (iOS only)", async () => {
      const onRefundRequestCompleted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRefundRequestCompleted,
        },
      });

      emitEvent("onRefundRequestCompleted", {
        productIdentifier: "com.test.product",
        refundRequestStatus: "SUCCESS",
      });

      await presentPromise;

      expect(onRefundRequestCompleted).toHaveBeenCalledTimes(1);
      expect(onRefundRequestCompleted).toHaveBeenCalledWith({
        productIdentifier: "com.test.product",
        refundRequestStatus: "SUCCESS",
      });
    });

    it("should handle USER_CANCELLED status", async () => {
      const onRefundRequestCompleted = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRefundRequestCompleted,
        },
      });

      emitEvent("onRefundRequestCompleted", {
        productIdentifier: "com.test.product",
        refundRequestStatus: "USER_CANCELLED",
      });

      await presentPromise;

      expect(onRefundRequestCompleted).toHaveBeenCalledWith({
        productIdentifier: "com.test.product",
        refundRequestStatus: "USER_CANCELLED",
      });
    });
  });

  describe("onManagementOptionSelected callback", () => {
    it("should be called when a management option is selected", async () => {
      const onManagementOptionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onManagementOptionSelected,
        },
      });

      emitEvent("onManagementOptionSelected", {
        option: "cancel",
        url: null,
      });

      await presentPromise;

      expect(onManagementOptionSelected).toHaveBeenCalledTimes(1);
      expect(onManagementOptionSelected).toHaveBeenCalledWith({
        option: "cancel",
        url: null,
      });
    });

    it("should handle custom_url option with URL", async () => {
      const onManagementOptionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onManagementOptionSelected,
        },
      });

      emitEvent("onManagementOptionSelected", {
        option: "custom_url",
        url: "https://example.com/support",
      });

      await presentPromise;

      expect(onManagementOptionSelected).toHaveBeenCalledWith({
        option: "custom_url",
        url: "https://example.com/support",
      });
    });

    it("should handle different management option types", async () => {
      const onManagementOptionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onManagementOptionSelected,
        },
      });

      const options = [
        { option: "cancel", url: null },
        { option: "refund_request", url: null },
        { option: "change_plans", url: null },
        { option: "missing_purchase", url: null },
      ];

      options.forEach(opt => emitEvent("onManagementOptionSelected", opt));

      await presentPromise;

      expect(onManagementOptionSelected).toHaveBeenCalledTimes(4);
      options.forEach((opt, index) => {
        expect(onManagementOptionSelected).toHaveBeenNthCalledWith(index + 1, opt);
      });
    });
  });

  describe("multiple callbacks", () => {
    it("should handle multiple callbacks simultaneously", async () => {
      const onRestoreStarted = jest.fn();
      const onRestoreCompleted = jest.fn();
      const onManagementOptionSelected = jest.fn();
      const onCustomActionSelected = jest.fn();

      const presentPromise = RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted,
          onRestoreCompleted,
          onManagementOptionSelected,
          onCustomActionSelected,
        },
      });

      // Emit multiple different events
      emitEvent("onRestoreStarted");
      emitEvent("onManagementOptionSelected", { option: "cancel", url: null });
      emitEvent("onCustomActionSelected", { actionId: "custom-action" });

      const mockCustomerInfo = { activeSubscriptions: [] };
      emitEvent("onRestoreCompleted", { customerInfo: mockCustomerInfo });

      await presentPromise;

      // Verify each callback was called correctly
      expect(onRestoreStarted).toHaveBeenCalledTimes(1);
      expect(onRestoreCompleted).toHaveBeenCalledTimes(1);
      expect(onRestoreCompleted).toHaveBeenCalledWith({ customerInfo: mockCustomerInfo });
      expect(onManagementOptionSelected).toHaveBeenCalledTimes(1);
      expect(onManagementOptionSelected).toHaveBeenCalledWith({ option: "cancel", url: null });
      expect(onCustomActionSelected).toHaveBeenCalledTimes(1);
      expect(onCustomActionSelected).toHaveBeenCalledWith({ actionId: "custom-action" });
    });
  });

  describe("callback cleanup", () => {
    it("should clean up event listeners after customer center is dismissed", async () => {
      const onCustomActionSelected = jest.fn();

      // Present and immediately resolve (simulating dismissal)
      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onCustomActionSelected,
        },
      });

      // Verify the listener was removed by checking the eventListeners object
      expect(eventListeners["onCustomActionSelected"] || []).toEqual([]);

      // Emit event after dismissal - callback should not be called
      emitEvent("onCustomActionSelected", { actionId: "after-dismissal" });

      // The callback should not have been called since listeners were cleaned up
      expect(onCustomActionSelected).toHaveBeenCalledTimes(0);
    });

    it("should clean up all listeners for multiple callbacks", async () => {
      const onRestoreStarted = jest.fn();
      const onRestoreCompleted = jest.fn();
      const onCustomActionSelected = jest.fn();

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted,
          onRestoreCompleted,
          onCustomActionSelected,
        },
      });

      // Verify all listeners were removed
      expect(eventListeners["onRestoreStarted"] || []).toEqual([]);
      expect(eventListeners["onRestoreCompleted"] || []).toEqual([]);
      expect(eventListeners["onCustomActionSelected"] || []).toEqual([]);

      // Emit events after dismissal - no callbacks should be called
      emitEvent("onRestoreStarted");
      emitEvent("onRestoreCompleted", { customerInfo: {} });
      emitEvent("onCustomActionSelected", { actionId: "test" });

      expect(onRestoreStarted).toHaveBeenCalledTimes(0);
      expect(onRestoreCompleted).toHaveBeenCalledTimes(0);
      expect(onCustomActionSelected).toHaveBeenCalledTimes(0);
    });
  });
});
