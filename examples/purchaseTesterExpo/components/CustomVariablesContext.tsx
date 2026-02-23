import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomVariableValue, CustomVariables } from 'react-native-purchases-ui';

interface CustomVariablesContextType {
  customVariables: CustomVariables;
  setCustomVariables: (vars: CustomVariables) => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
}

const CustomVariablesContext = createContext<CustomVariablesContextType | undefined>(undefined);

export const CustomVariablesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customVariables, setCustomVariables] = useState<CustomVariables>({});
  const [showEditor, setShowEditor] = useState(false);

  return (
    <CustomVariablesContext.Provider value={{ customVariables, setCustomVariables, showEditor, setShowEditor }}>
      {children}
    </CustomVariablesContext.Provider>
  );
};

export const useCustomVariables = () => {
  const context = useContext(CustomVariablesContext);
  if (!context) {
    throw new Error('useCustomVariables must be used within CustomVariablesProvider');
  }
  return context;
};

// Helper to convert CustomVariables to string map for display
export const customVariablesToStringMap = (vars: CustomVariables): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  for (const key of Object.keys(vars)) {
    result[key] = vars[key].value;
  }
  return result;
};

// Helper to convert string map to CustomVariables
export const stringMapToCustomVariables = (vars: { [key: string]: string }): CustomVariables => {
  const result: CustomVariables = {};
  for (const key of Object.keys(vars)) {
    result[key] = CustomVariableValue.string(vars[key]);
  }
  return result;
};
