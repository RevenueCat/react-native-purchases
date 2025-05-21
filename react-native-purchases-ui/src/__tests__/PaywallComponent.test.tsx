import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RevenueCatUIMock from '../../src/RevenueCatUIMock'; // Import the mock directly
import {
  PAYWALL_RESULT,
  PURCHASES_ERROR_CODE,
  // The following are not strictly needed for these tests as we're checking if callbacks are called,
  // not necessarily the exact shape of internal mock data passed to them,
  // as that's an internal detail of RevenueCatUIMock's Paywall->PlaceholderPaywall interaction.
  // CustomerInfo,
  // PurchasesStoreTransaction,
  // PurchasesPackage,
  // PurchasesError,
} from '@revenuecat/purchases-typescript-internal';

const { Paywall } = RevenueCatUIMock;

describe('Mock Paywall Component from RevenueCatUIMock', () => {
  it('calls onPurchaseStarted, onPurchaseCompleted, and onDismiss when "Simulate Successful Purchase" is pressed', () => {
    const mockOnPurchaseStarted = jest.fn();
    const mockOnPurchaseCompleted = jest.fn();
    const mockOnDismiss = jest.fn();

    const { getByText } = render(
      <Paywall
        onPurchaseStarted={mockOnPurchaseStarted}
        onPurchaseCompleted={mockOnPurchaseCompleted}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByText('Simulate Successful Purchase'));

    expect(mockOnPurchaseStarted).toHaveBeenCalledTimes(1);
    expect(mockOnPurchaseCompleted).toHaveBeenCalledTimes(1);
    // Further assertions could check the payload of mockOnPurchaseCompleted if needed
    // e.g., expect(mockOnPurchaseCompleted).toHaveBeenCalledWith(expect.objectContaining({ customerInfo: expect.any(Object) }));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onPurchaseStarted, onPurchaseError, and onDismiss when "Simulate Cancel / Error" is pressed', () => {
    const mockOnPurchaseStarted = jest.fn();
    const mockOnPurchaseError = jest.fn();
    const mockOnDismiss = jest.fn();

    const { getByText } = render(
      <Paywall
        onPurchaseStarted={mockOnPurchaseStarted}
        onPurchaseError={mockOnPurchaseError}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByText('Simulate Cancel / Error'));
    expect(mockOnPurchaseStarted).toHaveBeenCalledTimes(1);
    expect(mockOnPurchaseError).toHaveBeenCalledTimes(1);
    expect(mockOnPurchaseError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR, // Or PAYWALL_RESULT.CANCELLED depending on mock
          userCancelled: true,
        }),
      })
    );
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onRestoreStarted, onRestoreCompleted, and onDismiss when "Simulate Restore" is pressed', () => {
    const mockOnRestoreStarted = jest.fn();
    const mockOnRestoreCompleted = jest.fn();
    const mockOnDismiss = jest.fn();

    const { getByText } = render(
      <Paywall
        onRestoreStarted={mockOnRestoreStarted}
        onRestoreCompleted={mockOnRestoreCompleted}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByText('Simulate Restore'));
    expect(mockOnRestoreStarted).toHaveBeenCalledTimes(1);
    expect(mockOnRestoreCompleted).toHaveBeenCalledTimes(1);
    // e.g., expect(mockOnRestoreCompleted).toHaveBeenCalledWith(expect.objectContaining({ customerInfo: expect.any(Object) }));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onPurchaseError and onDismiss when "Close" button is pressed (if displayCloseButton is true)', () => {
    const mockOnPurchaseError = jest.fn();
    const mockOnDismiss = jest.fn();
    // onPurchaseCancelled is not explicitly used by PlaceholderPaywall's close button, it calls onPurchaseError.
    const mockOnPurchaseCancelled = jest.fn(); 

    const { getByText } = render(
      <Paywall
        options={{ displayCloseButton: true }}
        onPurchaseError={mockOnPurchaseError}
        onPurchaseCancelled={mockOnPurchaseCancelled} // To see if it's inadvertently called
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByText('Close'));
    
    // Based on current RevenueCatUIMock.tsx, the "Close" button in PlaceholderPaywall calls its onPurchaseError prop.
    expect(mockOnPurchaseError).toHaveBeenCalledTimes(1);
    expect(mockOnPurchaseError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR, // Or PAYWALL_RESULT.CANCELLED
            userCancelled: true,
          }),
        })
      );
    expect(mockOnPurchaseCancelled).not.toHaveBeenCalled(); // Ensure the specific onPurchaseCancelled isn't called by this path
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('"Close" button should not be visible if displayCloseButton is false or undefined', () => {
    const { queryByText } = render(<Paywall options={{ displayCloseButton: false }} />);
    expect(queryByText('Close')).toBeNull();

    const { queryByText: queryByTextUndefined } = render(<Paywall />);
    expect(queryByTextUndefined('Close')).toBeNull();
  });

  it('displays offering identifier if provided in options', () => {
    const offeringIdentifier = "test_offering";
    const { getByText } = render(<Paywall options={{ offering: { identifier: offeringIdentifier } as any }} />);
    expect(getByText(`Offering: ${offeringIdentifier}`)).toBeTruthy();
  });

  it('displays font family if provided in options', () => {
    const fontFamily = "Arial";
    const { getByText } = render(<Paywall options={{ fontFamily: fontFamily }} />);
    expect(getByText(`Font Family: ${fontFamily}`)).toBeTruthy();
  });

});
