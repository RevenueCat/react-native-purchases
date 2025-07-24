import {
  PurchasesPackage,
} from '@revenuecat/purchases-typescript-internal';
import { loadTestPurchaseData } from './loadTestPurchaseData';

/**
 * Shows the test purchase modal using DOM manipulation and returns a promise that resolves when the modal is dismissed
 */
export function showTestPurchaseModal(
  packageIdentifier: string, 
  offeringIdentifier: string,
  onPurchase: (packageInfo: PurchasesPackage) => Promise<void>,
  onCancel: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    `;

    // Function to determine if device should use mobile layout
    const isMobileLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Use mobile layout for phones (width <= 768px) or when height is very constrained
      return width <= 768 || (width <= 1024 && height <= 600);
    };

    // Function to apply responsive styles to modal
    const applyModalStyles = () => {
      const mobile = isMobileLayout();
      modal.style.cssText = mobile ? `
        width: 100%;
        height: 100%;
        background-color: white;
        padding: 24px;
        padding-top: 60px;
        overflow-y: auto;
      ` : `
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        background-color: white;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
      `;
    };

    // Create modal content
    const modal = document.createElement('div');
    applyModalStyles();

    // Add CSS animation for loading spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Initially show loading state
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
        <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
      </div>

      <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <div style="font-size: 16px; font-weight: bold; color: #856404; margin-bottom: 8px;">⚠️ Test Mode</div>
        <div style="font-size: 14px; color: #856404; line-height: 1.4;">
          This is a test purchase and should only be used during development. In production, use an Apple/Google API key from RevenueCat.
        </div>
      </div>

      <div style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
        <div style="font-size: 16px; color: #666; text-align: center;">Loading package details...</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
          Cancel
        </button>
        <button id="purchaseBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: none; background-color: #ccc; color: #999; font-size: 16px; font-weight: 600; cursor: not-allowed;" disabled>
          Loading...
        </button>
      </div>
    `;

    // Load offerings and update modal content
    let packageInfo: PurchasesPackage;

    const handleCancel = () => {
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      onCancel();
      resolve();
    };

    const handlePurchase = async () => {
      if (!packageInfo) {
        // If package info is not loaded yet, do nothing
        return;
      }
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      
      try {
        await onPurchase(packageInfo);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    // Handle window resize for responsive behavior
    const handleResize = () => {
      applyModalStyles();
    };

    const attachEventListeners = () => {
      const closeBtn = modal.querySelector('#closeBtn');
      const cancelBtn = modal.querySelector('#cancelBtn');
      const purchaseBtn = modal.querySelector('#purchaseBtn');

      closeBtn?.addEventListener('click', handleCancel);
      cancelBtn?.addEventListener('click', handleCancel);
      purchaseBtn?.addEventListener('click', handlePurchase);
    };

    // Attach initial event listeners
    attachEventListeners();

    (async () => {
      try {
        const data = await loadTestPurchaseData(packageIdentifier, offeringIdentifier);
        packageInfo = data.packageInfo;
        const offers = data.offers;

        // Update modal content with package details
        modal.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
            <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
          </div>

          <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <div style="font-size: 16px; font-weight: bold; color: #856404; margin-bottom: 8px;">⚠️ Test Mode</div>
            <div style="font-size: 14px; color: #856404; line-height: 1.4;">
              This is a test purchase and should be tested with proper iOS and Apple RevenueCat API keys before uploading the app to the App Store/Play Store.
            </div>
          </div>

          <div style="flex: 1; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 12px;">Package Details</h3>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Package ID:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.identifier}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Product ID:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.identifier}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Title:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.title}</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
              <span style="font-size: 14px; font-weight: 600; color: #666;">Price:</span>
              <span style="font-size: 14px; color: #333;">${packageInfo.product.priceString}</span>
            </div>

            ${packageInfo.product.subscriptionPeriod ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">
                <span style="font-size: 14px; font-weight: 600; color: #666;">Period:</span>
                <span style="font-size: 14px; color: #333;">${packageInfo.product.subscriptionPeriod}</span>
              </div>
            ` : ''}

            ${offers.length > 0 ? `
              <div style="margin-top: 16px;">
                <h4 style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 12px;">Offers</h4>
                ${offers.map(offer => `<div style="font-size: 14px; color: #666; margin-bottom: 4px; line-height: 1.3;">• ${offer}</div>`).join('')}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
            <button id="purchaseBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: none; background-color: #007bff; color: white; font-size: 16px; font-weight: 600; cursor: pointer;">
              Test Purchase
            </button>
          </div>
        `;

        // Re-attach event listeners after content update
        attachEventListeners();

      } catch (error) {
        console.error('Error loading package details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Show error state
        modal.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">Test Purchase</h2>
            <button id="closeBtn" style="width: 32px; height: 32px; border-radius: 16px; background-color: #f0f0f0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #666;">×</button>
          </div>

          <div style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
            <div style="font-size: 48px; color: #dc3545; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 16px; color: #dc3545; text-align: center; margin-bottom: 8px;">Error loading package details</div>
            <div style="font-size: 14px; color: #666; text-align: center;">${errorMessage}</div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="cancelBtn" style="flex: 1; padding: 12px 24px; border-radius: 8px; border: 1px solid #dee2e6; background-color: #f8f9fa; color: #6c757d; font-size: 16px; font-weight: 600; cursor: pointer;">
              Close
            </button>
          </div>
        `;

        // Re-attach event listeners for error state
        attachEventListeners();
      }
    })();

    // Close modal on overlay click (but not on modal content click)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleCancel();
      }
    });

    // Append to DOM
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add resize event listener after modal is in DOM
    window.addEventListener('resize', handleResize);
  });
}