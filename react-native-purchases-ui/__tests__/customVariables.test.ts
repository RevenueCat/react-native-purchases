import {
  CustomVariableValue,
  CustomVariables,
  convertCustomVariablesToStringMap,
  transformOptionsForNative,
} from '../src/customVariables';

describe('convertCustomVariablesToStringMap', () => {
  it('should return null for undefined input', () => {
    const result = convertCustomVariablesToStringMap(undefined);
    expect(result).toBeNull();
  });

  it('should return empty object for empty CustomVariables', () => {
    const customVariables: CustomVariables = {};
    const result = convertCustomVariablesToStringMap(customVariables);
    expect(result).toEqual({});
  });

  it('should convert CustomVariables to string map', () => {
    const customVariables: CustomVariables = {
      player_name: CustomVariableValue.string('John'),
      level: CustomVariableValue.string('42'),
    };

    const result = convertCustomVariablesToStringMap(customVariables);

    expect(result).toEqual({
      player_name: 'John',
      level: '42',
    });
  });

  it('should handle empty string values', () => {
    const customVariables: CustomVariables = {
      empty_value: CustomVariableValue.string(''),
    };

    const result = convertCustomVariablesToStringMap(customVariables);

    expect(result).toEqual({
      empty_value: '',
    });
  });

  it('should handle special characters in values', () => {
    const customVariables: CustomVariables = {
      special: CustomVariableValue.string('Hello {{ world }}!'),
      unicode: CustomVariableValue.string('日本語'),
    };

    const result = convertCustomVariablesToStringMap(customVariables);

    expect(result).toEqual({
      special: 'Hello {{ world }}!',
      unicode: '日本語',
    });
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

  it('should transform options with customVariables', () => {
    const options: TestOptions = {
      fontFamily: 'Ubuntu',
      customVariables: {
        player_name: CustomVariableValue.string('John'),
      },
    };

    const result = transformOptionsForNative(options);

    expect(result).toEqual({
      fontFamily: 'Ubuntu',
      customVariables: {
        player_name: 'John',
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

  it('should be readonly', () => {
    const value = CustomVariableValue.string('test');

    // TypeScript should prevent mutation, but we verify the structure
    expect(Object.keys(value)).toEqual(['type', 'value']);
  });
});
