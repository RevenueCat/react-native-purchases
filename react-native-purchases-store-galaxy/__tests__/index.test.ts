import {
  GALAXY_BILLING_MODE,
} from "../src";

describe("Galaxy Store configuration exports", () => {
  it("exports Galaxy billing modes", () => {
    expect(GALAXY_BILLING_MODE.PRODUCTION).toEqual("PRODUCTION");
    expect(GALAXY_BILLING_MODE.TEST).toEqual("TEST");
    expect(GALAXY_BILLING_MODE.ALWAYS_FAIL).toEqual("ALWAYS_FAIL");
  });
});
