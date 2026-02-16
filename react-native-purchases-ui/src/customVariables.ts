/**
 * A value type for custom paywall variables that can be passed to paywalls at runtime.
 *
 * Custom variables allow developers to personalize paywall text with dynamic values.
 * Variables are defined in the RevenueCat dashboard and can be overridden at runtime.
 *
 * Currently only string values are supported. Additional types may be added in the future.
 *
 * @example
 * ```typescript
 * RevenueCatUI.presentPaywall({
 *   customVariables: {
 *     'player_name': CustomVariableValue.string('John'),
 *     'level': CustomVariableValue.string('42'),
 *   },
 * });
 * ```
 *
 * In the paywall text (configured in the dashboard), use the `custom.` prefix:
 * ```
 * Hello {{ custom.player_name }}!
 * ```
 */
export type CustomVariableValue = {
  readonly type: 'string';
  readonly value: string;
};

/**
 * Factory methods for creating CustomVariableValue instances.
 */
export const CustomVariableValue = {
  /**
   * Creates a string custom variable value.
   * @param value The string value for the custom variable.
   * @returns A CustomVariableValue containing the string.
   */
  string: (value: string): CustomVariableValue => ({ type: 'string', value }),
} as const;

/**
 * A map of custom variable names to their values.
 */
export type CustomVariables = { [key: string]: CustomVariableValue };

/**
 * Internal type for custom variables as sent to native bridge.
 * Currently only string values are supported.
 * @internal
 */
export type NativeCustomVariables = { [key: string]: string };

/**
 * Converts CustomVariables to a string map for native bridge.
 * @internal
 * @visibleForTesting
 */
export function convertCustomVariablesToStringMap(
  customVariables: CustomVariables | undefined
): NativeCustomVariables | null {
  if (!customVariables) return null;
  const result: NativeCustomVariables = {};
  for (const key of Object.keys(customVariables)) {
    const variable = customVariables[key];
    if (variable) {
      result[key] = variable.value;
    }
  }
  return result;
}

/**
 * Transforms options to native format, converting CustomVariables to string map.
 * @internal
 * @visibleForTesting
 */
export function transformOptionsForNative<T extends { customVariables?: CustomVariables }>(
  options: T | undefined
): (Omit<T, 'customVariables'> & { customVariables?: NativeCustomVariables | null }) | undefined {
  if (!options) return undefined;
  const { customVariables, ...rest } = options;
  return {
    ...rest as Omit<T, 'customVariables'>,
    customVariables: convertCustomVariablesToStringMap(customVariables),
  };
}
