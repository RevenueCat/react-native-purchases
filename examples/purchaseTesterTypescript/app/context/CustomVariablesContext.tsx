import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomVariables, CustomVariableValue } from 'react-native-purchases-ui';

interface CustomVariablesContextType {
  customVariables: CustomVariables;
  setCustomVariables: (vars: CustomVariables) => void;
  stringMapToCustomVariables: (map: { [key: string]: string }) => CustomVariables;
  customVariablesToStringMap: (vars: CustomVariables) => { [key: string]: string };
}

const CustomVariablesContext = createContext<CustomVariablesContextType | undefined>(undefined);

export const CustomVariablesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customVariables, setCustomVariables] = useState<CustomVariables>({});

  const stringMapToCustomVariables = (map: { [key: string]: string }): CustomVariables => {
    const result: CustomVariables = {};
    for (const key of Object.keys(map)) {
      result[key] = CustomVariableValue.string(map[key]);
    }
    return result;
  };

  const customVariablesToStringMap = (vars: CustomVariables): { [key: string]: string } => {
    const result: { [key: string]: string } = {};
    for (const key of Object.keys(vars)) {
      result[key] = vars[key].value;
    }
    return result;
  };

  return (
    <CustomVariablesContext.Provider
      value={{
        customVariables,
        setCustomVariables,
        stringMapToCustomVariables,
        customVariablesToStringMap,
      }}>
      {children}
    </CustomVariablesContext.Provider>
  );
};

export const useCustomVariables = (): CustomVariablesContextType => {
  const context = useContext(CustomVariablesContext);
  if (!context) {
    throw new Error('useCustomVariables must be used within a CustomVariablesProvider');
  }
  return context;
};
