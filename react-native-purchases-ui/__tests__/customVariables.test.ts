import {
  CustomVariableValue,
  CustomVariables,
  convertCustomVariablesToNativeMap,
  transformOptionsForNative,
} from '../src/customVariables';

describe('convertCustomVariablesToNativeMap', () => {
  it('should return null for undefined input', () => {
    const result = convertCustomVariablesToNativeMap(undefined);
    expect(result).toBeNull();
  });

  it('should return empty object for empty CustomVariables', () => {
    const customVariables: CustomVariables = {};
    const result = convertCustomVariablesToNativeMap(customVariables);
    expect(result).toEqual({});
  });

  it('should convert string CustomVariables to native map', () => {
    const customVariables: CustomVariables = {
      player_name: CustomVariableValue.string('John'),
      greeting: CustomVariableValue.string('Hello'),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      player_name: 'John',
      greeting: 'Hello',
    });
  });

  it('should convert number CustomVariables to native map', () => {
    const customVariables: CustomVariables = {
      level: CustomVariableValue.number(42),
      score: CustomVariableValue.number(99.5),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      level: 42,
      score: 99.5,
    });
  });

  it('should convert boolean CustomVariables to native map', () => {
    const customVariables: CustomVariables = {
      is_premium: CustomVariableValue.boolean(true),
      has_trial: CustomVariableValue.boolean(false),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      is_premium: true,
      has_trial: false,
    });
  });

  it('should convert mixed-type CustomVariables to native map', () => {
    const customVariables: CustomVariables = {
      player_name: CustomVariableValue.string('John'),
      level: CustomVariableValue.number(42),
      is_premium: CustomVariableValue.boolean(true),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      player_name: 'John',
      level: 42,
      is_premium: true,
    });
  });

  it('should handle empty string values', () => {
    const customVariables: CustomVariables = {
      empty_value: CustomVariableValue.string(''),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      empty_value: '',
    });
  });

  it('should handle special characters in string values', () => {
    const customVariables: CustomVariables = {
      special: CustomVariableValue.string('Hello {{ world }}!'),
      unicode: CustomVariableValue.string('日本語'),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      special: 'Hello {{ world }}!',
      unicode: '日本語',
    });
  });

  it('should handle zero and negative numbers', () => {
    const customVariables: CustomVariables = {
      zero: CustomVariableValue.number(0),
      negative: CustomVariableValue.number(-10),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({
      zero: 0,
      negative: -10,
    });
  });

  it('should skip NaN values and warn', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const customVariables: CustomVariables = {
      valid: CustomVariableValue.number(42),
      nan_value: CustomVariableValue.number(NaN),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({ valid: 42 });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("nan_value")
    );
    warnSpy.mockRestore();
  });

  it('should skip Infinity values and warn', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const customVariables: CustomVariables = {
      pos_inf: CustomVariableValue.number(Infinity),
      neg_inf: CustomVariableValue.number(-Infinity),
      valid: CustomVariableValue.string('ok'),
    };

    const result = convertCustomVariablesToNativeMap(customVariables);

    expect(result).toEqual({ valid: 'ok' });
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
});

describe('transformOptionsForNative', () => {
  // Type that mimics PaywallViewOptions structure
  interface TestOptions {
    fontFamily?: string;
    offering?: null;
    customVariables?: CustomVariables;
  }

  it('should return undefined for undefined input', () => {
    const result = transformOptionsForNative<TestOptions>(undefined);
    expect(result).toBeUndefined();
  });

  it('should transform options without customVariables', () => {
    const options: TestOptions = {
      fontFamily: 'Ubuntu',
    };

    const result = transformOptionsForNative(options);

    expect(result).toEqual({
      fontFamily: 'Ubuntu',
      customVariables: null,
    });
  });

  it('should transform options with mixed-type customVariables', () => {
    const options: TestOptions = {
      fontFamily: 'Ubuntu',
      customVariables: {
        player_name: CustomVariableValue.string('John'),
        level: CustomVariableValue.number(42),
        is_premium: CustomVariableValue.boolean(true),
      },
    };

    const result = transformOptionsForNative(options);

    expect(result).toEqual({
      fontFamily: 'Ubuntu',
      customVariables: {
        player_name: 'John',
        level: 42,
        is_premium: true,
      },
    });
  });

  it('should preserve other option properties', () => {
    const options: TestOptions = {
      fontFamily: 'Ubuntu',
      offering: null,
      customVariables: {
        key: CustomVariableValue.string('value'),
      },
    };

    const result = transformOptionsForNative(options);

    expect(result).toEqual({
      fontFamily: 'Ubuntu',
      offering: null,
      customVariables: {
        key: 'value',
      },
    });
  });

  it('should handle empty customVariables object', () => {
    const options: TestOptions = {
      customVariables: {},
    };

    const result = transformOptionsForNative(options);

    expect(result).toEqual({
      customVariables: {},
    });
  });
});

describe('CustomVariableValue', () => {
  it('should create string value with correct type', () => {
    const value = CustomVariableValue.string('test');

    expect(value.type).toBe('string');
    expect(value.value).toBe('test');
  });

  it('should create number value with correct type', () => {
    const value = CustomVariableValue.number(42);

    expect(value.type).toBe('number');
    expect(value.value).toBe(42);
  });

  it('should create boolean value with correct type', () => {
    const value = CustomVariableValue.boolean(true);

    expect(value.type).toBe('boolean');
    expect(value.value).toBe(true);
  });

  it('should be readonly', () => {
    const value = CustomVariableValue.string('test');

    // TypeScript should prevent mutation, but we verify the structure
    expect(Object.keys(value)).toEqual(['type', 'value']);
  });
});
