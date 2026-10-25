import { NativeModules } from 'react-native';
import Purchases from '../src/purchases';

beforeEach(() => {
  jest.clearAllMocks();
  NativeModules.RNPurchases.isConfigured.mockResolvedValue(true);
});

test.each([null, undefined])('normalizes absent offering %s to null', async value => {
  NativeModules.RNPurchases.getCurrentOfferingForPlacement.mockResolvedValueOnce(value);
  expect(await Purchases.getCurrentOfferingForPlacement('no_offering')).toBe(null);
});

test('preserves an existing offering', async () => {
  const offering = { identifier: 'default' };
  NativeModules.RNPurchases.getCurrentOfferingForPlacement.mockResolvedValueOnce(offering);
  expect(await Purchases.getCurrentOfferingForPlacement('default')).toBe(offering);
});

test('preserves error rejection', async () => {
  NativeModules.RNPurchases.getCurrentOfferingForPlacement.mockRejectedValueOnce(
    Object.assign(new Error('offline'), { code: '10' })
  );
  await expect(Purchases.getCurrentOfferingForPlacement('default')).rejects.toMatchObject({ code: '10' });
});

test('rejects an unconfigured request before calling native code', async () => {
  NativeModules.RNPurchases.isConfigured.mockResolvedValueOnce(false);
  await expect(Purchases.getCurrentOfferingForPlacement('default')).rejects.toBeInstanceOf(Error);
  expect(NativeModules.RNPurchases.getCurrentOfferingForPlacement).not.toHaveBeenCalled();
});
