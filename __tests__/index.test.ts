import { isUTCDateStringFuture } from "../index";

jest.mock('NativeEventEmitter');

describe('isUTCDateStringFuture', () => {
  it('returns true when a date is in the future', () => {
    const dateAhead = new Date();
    dateAhead.setDate(dateAhead.getDate() + 2);

    expect(isUTCDateStringFuture(dateAhead.toUTCString())).toEqual(true);
  });
});
